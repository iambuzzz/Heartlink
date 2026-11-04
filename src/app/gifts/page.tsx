import type { Metadata } from "next";
import Link from "next/link";
import { HeartIcon, PlaneIcon, ReplyIcon } from "@/components/Icons";
import { revealLabel } from "@/components/experience/Teaser";
import { ScheduleReveal } from "@/components/ScheduleReveal";
import { MemoryJar } from "@/components/scenery";
import { SiteHeader } from "@/components/SiteHeader";
import { existingDeviceUserId } from "@/lib/server/device";
import { backendReady } from "@/lib/server/env";
import { ownerDashboard, type OwnerGift } from "@/lib/server/gifts";
import { siteOrigin } from "@/lib/server/origin";
import { getTemplate } from "@/lib/templates";
import { LinkActions, VoicePlay } from "./GiftActions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My gifts — heartlink", robots: { index: false, follow: false } };

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default async function MyGiftsPage() {
  const ownerId = backendReady() ? await existingDeviceUserId() : null;
  const gifts = ownerId ? await ownerDashboard(ownerId) : [];
  const origin = await siteOrigin();

  return (
    <>
      <SiteHeader />
      <main className="relative z-[1] mx-auto w-full max-w-2xl px-[22px] pb-16 pt-6">
        <p className="text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-gold">On this phone</p>
        <h1 className="mt-1 font-display text-[30px] font-light">My gifts</h1>

        {gifts.length === 0 ? (
          <div className="glass mt-6 flex flex-col items-center gap-4 rounded-[24px] p-8 text-center">
            <MemoryJar label="soon" />
            <p className="font-display text-xl">No gifts yet</p>
            <p className="text-sm text-muted">Gifts you make and unlock on this phone show up here, with every open, jhappi and reply they send back.</p>
            <Link href="/create/birthday" className="btn-cta inline-flex h-12 items-center rounded-full px-6 font-extrabold no-underline">
              Make your first gift
            </Link>
          </div>
        ) : (
          <div className="mt-6 flex flex-col gap-4">
            {gifts.map((g) => (
              <GiftCard key={g.id} gift={g} url={`${origin}/g/${g.slug}`} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function GiftCard({ gift, url }: { gift: OwnerGift; url: string }) {
  const sealed = gift.reveal_at && Date.parse(gift.reveal_at) > Date.now();
  const status = gift.status === "paused" ? { label: "Paused", note: "Payment couldn't be confirmed" } : sealed ? { label: "Sealed", note: `Opens ${revealLabel(gift.reveal_at!)}` } : { label: "Live", note: `Made ${when(gift.created_at)}` };

  return (
    <article className="glass rounded-[24px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-bold text-muted">{getTemplate(gift.template_slug)?.name ?? "Gift"}</p>
          <h2 className="truncate font-hand text-[34px] leading-tight">For {gift.them}</h2>
          <p className="text-xs text-muted">{status.note}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider ${gift.status === "paused" ? "bg-[var(--heart)] text-white" : "bg-cell text-gold"}`}>{status.label}</span>
      </div>

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        {[
          ["Opened", gift.opens, null],
          ["Jhappis", gift.hugs, <HeartIcon key="h" size={14} />],
          ["Replies", gift.replies.length, <ReplyIcon key="r" size={14} />],
        ].map(([label, n, icon]) => (
          <div key={String(label)} className="rounded-2xl border border-glass-line bg-cell py-2.5">
            <dd className="flex items-center justify-center gap-1 font-display text-2xl tabular-nums">
              {icon}
              {n as number}
            </dd>
            <dt className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">{label as string}</dt>
          </div>
        ))}
      </dl>

      {gift.replies.length > 0 && (
        <section className="mt-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-gold">Paper planes from {gift.them}</h3>
            <span className="text-xs font-bold text-muted">
              {gift.replies.length} {gift.replies.length === 1 ? "reply" : "replies"}
            </span>
          </div>
          {/* Read like a chat from them: their initial, a bubble, and when it landed. */}
          <ol className="mt-3 flex flex-col gap-3.5">
            {gift.replies.map((r) => (
              <li key={r.id} className="flex items-end gap-2.5">
                <span className="mb-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-glass-line bg-cell font-display text-[17px] text-gold" aria-hidden="true">
                  {(gift.them.trim()[0] ?? "♥").toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className={`flex max-w-full flex-col gap-1.5 rounded-[20px] rounded-bl-md border border-glass-line bg-cell px-4 py-3 ${r.voice ? "w-full" : "w-fit"}`}>
                    {r.message && <p className="whitespace-pre-wrap break-words font-hand text-[23px] leading-snug">{r.message}</p>}
                    {r.voice && <VoicePlay src={r.voice.src} seconds={r.voice.seconds} />}
                  </div>
                  <p className="mt-1.5 flex items-center gap-1.5 pl-1 text-[11px] font-semibold text-muted">
                    <PlaneIcon size={11} /> Landed {when(r.created_at)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="mt-4 flex flex-col gap-2.5">
        <LinkActions url={url} them={gift.them} />
        {gift.status !== "paused" && <ScheduleReveal giftId={gift.id} revealAt={gift.reveal_at} />}
        <div className="flex flex-wrap gap-x-5 gap-y-1 pl-1 text-sm font-bold text-muted">
          <Link href={`/g/${gift.slug}`}>Open</Link>
          <Link href={`/g/${gift.slug}/tag`}>Print QR tag</Link>
        </div>
      </div>
    </article>
  );
}
