import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { GiftExperience } from "@/components/experience/GiftExperience";
import { Teaser } from "@/components/experience/Teaser";
import { recordEvent } from "@/lib/server/gifts";
import { lockValentineDays } from "@/lib/templates/valentine";
import { loadGift } from "./data";

export const dynamic = "force-dynamic";

const PREVIEW_BOTS = /bot|crawl|spider|whatsapp|facebookexternalhit|telegram|slack|discord|preview/i;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const found = await loadGift(slug);
  const title = found ? `A little gift for ${found.content.them}` : "A little gift";
  const description = "Someone who loves you made this. Tap to open.";
  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function GiftPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await loadGift(slug);
  if (!found) notFound();

  // Sealed until its reveal time: only the names reach the page, never the gift itself.
  if (found.gift.reveal_at && Date.parse(found.gift.reveal_at) > Date.now()) {
    return <Teaser them={found.content.them} you={found.content.you} revealAt={found.gift.reveal_at} />;
  }

  // Link previews (WhatsApp etc.) fetch the page too; only count real opens.
  const ua = (await headers()).get("user-agent") ?? "";
  if (!PREVIEW_BOTS.test(ua)) await recordEvent(found.gift.id, "open").catch(() => {});

  // Valentine's week: days that haven't arrived never leave the server.
  const content = found.gift.template_slug === "valentine-week" ? lockValentineDays(found.content) : found.content;
  return <GiftExperience template={found.gift.template_slug} content={content} slug={found.gift.slug} />;
}
