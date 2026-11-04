import "server-only";
import { randomBytes, randomUUID } from "node:crypto";
import { getTemplate, validateGift } from "../templates";
import { RELATIONS, type GiftContent, type Relation, type TemplateDefinition } from "../templates/types";
import { MEDIA_BUCKET } from "./env";
import { db } from "./supabase";

const ALL_RELATIONS = Object.values(RELATIONS).flat() as Relation[];
const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const DATA_URL = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/;
const VOICE_URL = /^data:audio\/(mp4|webm|ogg|aac|mpeg)(?:;codecs=[^;,]+)?;base64,([A-Za-z0-9+/=]+)$/;
const MAX_VOICE_BYTES = 1.5 * 1024 * 1024;

export type StoredPhoto = { key: string; caption: string };
export type StoredVoice = { key: string; seconds: number };
export type GiftRow = { id: string; slug: string; owner_id: string; template_slug: string; content: GiftContent; status: "draft" | "paid" | "paused" | "removed"; paid_at: string | null; reveal_at: string | null; created_at: string };

export class BadRequest extends Error {}

/** Keeps only fields the template defines and rejects anything the template would reject. */
export function sanitizeContent(template: TemplateDefinition, input: unknown): GiftContent {
  const raw = (input ?? {}) as Partial<GiftContent>;
  if (!raw.relation || !ALL_RELATIONS.includes(raw.relation)) throw new BadRequest("Pick who the gift is for");
  const values: Record<string, unknown> = {};
  const rawValues = (raw.values ?? {}) as Record<string, unknown>;
  for (const field of template.steps.flatMap((s) => s.fields)) {
    if (field.id in rawValues) values[field.id] = rawValues[field.id];
  }
  const content: GiftContent = {
    relation: raw.relation,
    them: String(raw.them ?? "").trim().slice(0, 40),
    you: String(raw.you ?? "").trim().slice(0, 60),
    lang: raw.lang === "hinglish" ? "hinglish" : "en",
    values,
  };
  const errors = validateGift(template, content);
  if (errors.length) throw new BadRequest(errors.join(", "));
  return content;
}

async function replacePhotos(giftId: string, photos: unknown): Promise<StoredPhoto[]> {
  const storage = db().storage.from(MEDIA_BUCKET);
  const { data: old } = await db().from("media").select("storage_key").eq("gift_id", giftId).eq("kind", "photo");
  if (old?.length) {
    await storage.remove(old.map((m) => m.storage_key as string));
    await db().from("media").delete().eq("gift_id", giftId).eq("kind", "photo");
  }
  const list = Array.isArray(photos) ? photos : [];
  const stored: StoredPhoto[] = [];
  for (const [position, p] of list.entries()) {
    const match = DATA_URL.exec(String((p as { src?: unknown })?.src ?? ""));
    if (!match) throw new BadRequest("A photo couldn't be read — please add it again");
    const bytes = Buffer.from(match[2], "base64");
    if (bytes.length > MAX_PHOTO_BYTES) throw new BadRequest("A photo is too large");
    const ext = match[1] === "jpeg" ? "jpg" : match[1];
    const key = `${giftId}/${randomUUID()}.${ext}`;
    const { error } = await storage.upload(key, bytes, { contentType: `image/${match[1]}`, upsert: false });
    if (error) throw error;
    const caption = String((p as { caption?: unknown }).caption ?? "").slice(0, 60);
    await db().from("media").insert({ gift_id: giftId, kind: "photo", storage_key: key, caption, position });
    stored.push({ key, caption });
  }
  return stored;
}

/** Swaps the gift's voice note for the new recording (or removes it). */
async function replaceVoice(giftId: string, voice: unknown): Promise<StoredVoice | null> {
  const storage = db().storage.from(MEDIA_BUCKET);
  const { data: old } = await db().from("media").select("storage_key").eq("gift_id", giftId).eq("kind", "voice").is("caption", null);
  if (old?.length) {
    await storage.remove(old.map((m) => m.storage_key as string));
    await db().from("media").delete().eq("gift_id", giftId).eq("kind", "voice").is("caption", null);
  }
  if (!voice) return null;
  const v = voice as { src?: unknown; seconds?: unknown };
  const match = VOICE_URL.exec(String(v.src ?? ""));
  if (!match) throw new BadRequest("The voice note couldn't be read — please record it again");
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length > MAX_VOICE_BYTES) throw new BadRequest("The voice note is too long");
  const key = `${giftId}/${randomUUID()}.${match[1] === "mp4" ? "m4a" : match[1]}`;
  const { error } = await storage.upload(key, bytes, { contentType: `audio/${match[1]}`, upsert: false });
  if (error) throw error;
  await db().from("media").insert({ gift_id: giftId, kind: "voice", storage_key: key, position: 0 });
  return { key, seconds: Math.round(Number(v.seconds) || 0) };
}

/** Creates the buyer's gift, or overwrites their existing unpaid draft, with photos moved to storage. */
export async function saveDraftGift(ownerId: string, templateSlug: string, input: unknown, giftId?: string): Promise<GiftRow> {
  const template = getTemplate(templateSlug);
  if (!template) throw new BadRequest("Unknown template");
  const content = sanitizeContent(template, input);

  let row: GiftRow | null = null;
  if (giftId) {
    const { data } = await db().from("gifts").select("*").eq("id", giftId).eq("owner_id", ownerId).maybeSingle();
    if (data?.status === "draft") row = data as GiftRow;
  }
  if (!row) {
    const { data, error } = await db()
      .from("gifts")
      .insert({ owner_id: ownerId, template_slug: template.slug, slug: randomBytes(9).toString("base64url"), content: { ...content, values: { ...content.values, photos: [], voice: null } } })
      .select("*")
      .single();
    if (error) throw error;
    row = data as GiftRow;
  }

  const photos = await replacePhotos(row.id, content.values.photos);
  const voice = await replaceVoice(row.id, content.values.voice);
  const finalContent = { ...content, values: { ...content.values, photos, voice } };
  const { data, error } = await db().from("gifts").update({ content: finalContent, updated_at: new Date().toISOString() }).eq("id", row.id).select("*").single();
  if (error) throw error;
  return data as GiftRow;
}

/**
 * The buyer says "I paid" with a UTR. We trust it so the gift unlocks immediately (a midnight
 * surprise can't wait), and an admin checks the bank statement later. Returns the gift slug.
 */
export async function claimOrder(ownerId: string, orderId: string, utr: string): Promise<string> {
  const { data: order } = await db().from("orders").select("id, gift_id, status").eq("id", orderId).eq("user_id", ownerId).maybeSingle();
  if (!order) throw new BadRequest("Order not found");
  if (order.status === "created") {
    const { error } = await db().from("orders").update({ status: "claimed", utr, claimed_at: new Date().toISOString() }).eq("id", order.id).eq("status", "created");
    if (error) throw error.code === "23505" ? new BadRequest("That UTR has already been used") : error;
    await db().from("gifts").update({ status: "paid", paid_at: new Date().toISOString() }).eq("id", order.gift_id).eq("status", "draft");
  } else if (order.status === "rejected") {
    throw new BadRequest("This payment couldn't be confirmed. Message us and we'll help.");
  }
  const { data: gift, error } = await db().from("gifts").select("slug").eq("id", order.gift_id).single();
  if (error || !gift) throw error ?? new Error("Gift missing for order");
  return gift.slug as string;
}

export type AdminOrder = { id: string; amount_paise: number; utr: string | null; status: string; claimed_at: string | null; created_at: string; gift: { slug: string; status: string; content: GiftContent } | null };

export async function listOrdersForReview(): Promise<AdminOrder[]> {
  const { data, error } = await db()
    .from("orders")
    .select("id, amount_paise, utr, status, claimed_at, created_at, gift:gifts(slug, status, content)")
    .in("status", ["claimed", "verified", "rejected"])
    .order("claimed_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as unknown as AdminOrder[];
}

/** Admin decision after checking the bank statement. Rejecting pauses the gift; verifying restores it. */
export async function reviewOrder(orderId: string, decision: "verified" | "rejected") {
  const { data: order, error } = await db()
    .from("orders")
    .update({ status: decision, verified_at: new Date().toISOString() })
    .eq("id", orderId)
    .in("status", ["claimed", "verified", "rejected"])
    .select("gift_id")
    .single();
  if (error) throw error;
  const giftStatus = decision === "verified" ? "paid" : "paused";
  await db().from("gifts").update({ status: giftStatus }).eq("id", order.gift_id).in("status", ["paid", "paused"]);
}

/** A paid gift with photo keys swapped for short-lived signed URLs, ready to render. */
export async function getPaidGift(slug: string): Promise<{ gift: GiftRow; content: GiftContent } | null> {
  if (!/^[A-Za-z0-9_-]{8,32}$/.test(slug)) return null;
  const { data } = await db().from("gifts").select("*").eq("slug", slug).eq("status", "paid").maybeSingle();
  if (!data) return null;
  const gift = data as GiftRow;
  const stored = (gift.content.values.photos ?? []) as StoredPhoto[];
  const storedVoice = (gift.content.values.voice ?? null) as StoredVoice | null;
  const keys = [...stored.map((p) => p.key), ...(storedVoice ? [storedVoice.key] : [])];
  let photos: { src: string; caption: string }[] = [];
  let voice: { src: string; seconds: number } | null = null;
  if (keys.length) {
    const { data: signed } = await db().storage.from(MEDIA_BUCKET).createSignedUrls(keys, 60 * 60 * 6);
    photos = stored.map((p, i) => ({ src: signed?.[i]?.signedUrl ?? "", caption: p.caption })).filter((p) => p.src);
    const voiceUrl = storedVoice ? signed?.[stored.length]?.signedUrl : undefined;
    if (storedVoice && voiceUrl) voice = { src: voiceUrl, seconds: storedVoice.seconds };
  }
  return { gift, content: { ...gift.content, values: { ...gift.content.values, photos, voice } } };
}

const MAX_REPLIES = 30;

/** The recipient's paper plane: a message and/or a short voice note, stored for the sender. */
export async function addReply(slug: string, message: string, voice: unknown) {
  if (!/^[A-Za-z0-9_-]{8,32}$/.test(slug)) throw new BadRequest("Gift not found");
  const { data: gift } = await db().from("gifts").select("id").eq("slug", slug).eq("status", "paid").maybeSingle();
  if (!gift) throw new BadRequest("Gift not found");
  const text = message.trim().slice(0, 500);
  if (!text && !voice) throw new BadRequest("Write something or record a voice note");
  const { count } = await db().from("replies").select("id", { count: "exact", head: true }).eq("gift_id", gift.id);
  if ((count ?? 0) >= MAX_REPLIES) throw new BadRequest("This gift has all the replies it can hold");

  let mediaId: string | null = null;
  if (voice) {
    const v = voice as { src?: unknown; seconds?: unknown };
    const match = VOICE_URL.exec(String(v.src ?? ""));
    if (!match) throw new BadRequest("The voice note couldn't be read — please record it again");
    const bytes = Buffer.from(match[2], "base64");
    if (bytes.length > MAX_VOICE_BYTES) throw new BadRequest("The voice note is too long");
    const key = `${gift.id}/replies/${randomUUID()}.${match[1] === "mp4" ? "m4a" : match[1]}`;
    const { error } = await db().storage.from(MEDIA_BUCKET).upload(key, bytes, { contentType: `audio/${match[1]}`, upsert: false });
    if (error) throw error;
    const { data: media, error: mediaError } = await db().from("media").insert({ gift_id: gift.id, kind: "voice", storage_key: key, caption: "reply", position: Math.round(Number(v.seconds) || 0) }).select("id").single();
    if (mediaError) throw mediaError;
    mediaId = media.id as string;
  }
  const { error } = await db().from("replies").insert({ gift_id: gift.id, message: text || null, media_id: mediaId });
  if (error) throw error;
  await recordEvent(gift.id as string, "reply");
}

export async function recordEvent(giftId: string, kind: "open" | "complete" | "reply" | "share" | "hug") {
  await db().from("events").insert({ gift_id: giftId, kind });
}

export type OwnerReply = { id: string; message: string | null; voice: { src: string; seconds: number } | null; created_at: string };
export type OwnerGift = { id: string; slug: string; template_slug: string; status: GiftRow["status"]; them: string; created_at: string; reveal_at: string | null; opens: number; hugs: number; replies: OwnerReply[] };

/** Everything the "My gifts" page shows: each unlocked gift with its opens, hugs and replies. */
export async function ownerDashboard(ownerId: string): Promise<OwnerGift[]> {
  const { data: gifts } = await db()
    .from("gifts")
    .select("id, slug, template_slug, status, content, created_at, reveal_at")
    .eq("owner_id", ownerId)
    .in("status", ["paid", "paused"])
    .order("created_at", { ascending: false })
    .limit(50);
  if (!gifts?.length) return [];
  const ids = gifts.map((g) => g.id as string);

  const [{ data: events }, { data: replies }] = await Promise.all([
    db().from("events").select("gift_id, kind").in("gift_id", ids).in("kind", ["open", "hug"]).limit(10000),
    db().from("replies").select("id, gift_id, message, created_at, media:media(storage_key, position)").in("gift_id", ids).order("created_at", { ascending: false }).limit(500),
  ]);

  type ReplyRow = { id: string; gift_id: string; message: string | null; created_at: string; media: { storage_key: string; position: number } | null };
  const replyRows = (replies ?? []) as unknown as ReplyRow[];
  const voiceKeys = replyRows.flatMap((r) => (r.media ? [r.media.storage_key] : []));
  const signed = new Map<string, string>();
  if (voiceKeys.length) {
    const { data } = await db().storage.from(MEDIA_BUCKET).createSignedUrls(voiceKeys, 60 * 60 * 6);
    data?.forEach((d, i) => d.signedUrl && signed.set(voiceKeys[i], d.signedUrl));
  }

  return gifts.map((g) => {
    const mine = (events ?? []).filter((e) => e.gift_id === g.id);
    return {
      id: g.id as string,
      slug: g.slug as string,
      template_slug: g.template_slug as string,
      status: g.status as GiftRow["status"],
      them: (g.content as GiftContent).them,
      created_at: g.created_at as string,
      reveal_at: (g.reveal_at as string | null) ?? null,
      opens: mine.filter((e) => e.kind === "open").length,
      hugs: mine.filter((e) => e.kind === "hug").length,
      replies: replyRows
        .filter((r) => r.gift_id === g.id)
        .map((r) => ({ id: r.id, message: r.message, created_at: r.created_at, voice: r.media && signed.has(r.media.storage_key) ? { src: signed.get(r.media.storage_key)!, seconds: r.media.position } : null })),
    };
  });
}

/** Sets when the gift opens (null = right away). Only the device that made it can change this. */
export async function setRevealAt(ownerId: string, giftId: string, revealAt: string | null) {
  if (revealAt !== null) {
    const t = Date.parse(revealAt);
    if (!Number.isFinite(t)) throw new BadRequest("That date doesn't look right");
    if (t > Date.now() + 1000 * 60 * 60 * 24 * 366) throw new BadRequest("Pick a time within the next year");
  }
  const { data, error } = await db()
    .from("gifts")
    .update({ reveal_at: revealAt === null || Date.parse(revealAt) <= Date.now() ? null : new Date(revealAt).toISOString() })
    .eq("id", giftId)
    .eq("owner_id", ownerId)
    .neq("status", "removed")
    .select("reveal_at")
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new BadRequest("Gift not found");
  return (data.reveal_at as string | null) ?? null;
}

export async function listOwnerGifts(ownerId: string): Promise<GiftRow[]> {
  const { data } = await db().from("gifts").select("*").eq("owner_id", ownerId).neq("status", "removed").order("created_at", { ascending: false }).limit(50);
  return (data ?? []) as GiftRow[];
}
