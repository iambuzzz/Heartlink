import Link from "next/link";
import { notFound } from "next/navigation";
import { ScheduleReveal } from "@/components/ScheduleReveal";
import { FireflyHeart } from "@/components/scenery";
import { backendReady } from "@/lib/server/env";
import { getPaidGift } from "@/lib/server/gifts";
import { siteOrigin } from "@/lib/server/origin";
import { ShareActions } from "./ShareActions";

export const dynamic = "force-dynamic";

export default async function DonePage({ params, searchParams }: { params: Promise<{ template: string }>; searchParams: Promise<{ slug?: string }> }) {
  const { template } = await params;
  const { slug = "" } = await searchParams;
  const found = backendReady() ? await getPaidGift(slug) : null;
  if (!found) notFound();
  const url = `${await siteOrigin()}/g/${found.gift.slug}`;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-10 text-center">
      <FireflyHeart />
      <p className="mt-2 text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-gold">Paid · it&apos;s live</p>
      <h1 className="mt-2 font-display text-[30px] font-light leading-tight">
        {found.content.them}&apos;s gift is <span className="text-shine font-medium">glowing</span>
      </h1>
      <p className="mt-2 text-[15px] text-muted">Send this private link. Only people with the link can open it, and it never expires.</p>
      <ShareActions url={url} them={found.content.them} templateSlug={template} />
      <div className="mt-3 w-full">
        <ScheduleReveal giftId={found.gift.id} revealAt={found.gift.reveal_at} />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-bold text-muted">
        <Link href={`/g/${found.gift.slug}`}>Open it yourself</Link>
        <Link href={`/g/${found.gift.slug}/tag`}>Print a QR gift tag</Link>
        <Link href="/gifts">My gifts</Link>
      </div>
    </main>
  );
}
