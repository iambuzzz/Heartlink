import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { heartDots } from "@/lib/scene";
import { siteOrigin } from "@/lib/server/origin";
import { qrSvg } from "@/lib/server/upi";
import { loadGift } from "../data";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Gift tag — heartlink", robots: { index: false, follow: false } };

const DOTS = heartDots();

// A printable tag for a physical gift: scanning it opens the gift link.
export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await loadGift(slug);
  if (!found) notFound();
  const url = `${await siteOrigin()}/g/${found.gift.slug}`;
  const qr = await qrSvg(url, "#3a2f18");

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      <div className="no-print">
        <h1 className="font-display text-2xl font-light">Your gift tag</h1>
        <p className="mt-1 text-sm text-muted">Print it, cut along the dashes, tie it to the present. Scanning it opens the gift.</p>
      </div>

      <div className="gift-tag relative flex w-[300px] flex-col items-center px-7 pb-7 pt-12" style={{ color: "#2b2a20" }}>
        <span className="absolute left-1/2 top-4 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-[#c9a45c] bg-white" aria-hidden="true" />
        <svg viewBox="0 0 260 190" width={120} height={88} aria-hidden="true">
          {DOTS.map((d, i) => (
            <circle key={i} cx={d.x + d.s / 2} cy={d.y + d.s / 2} r={d.s / 2 + 0.6} fill="#e7b43c" opacity={0.55 + (i % 3) * 0.15} />
          ))}
        </svg>
        <p className="mt-3 text-[10.5px] font-extrabold uppercase tracking-[0.2em]" style={{ color: "#9a7426" }}>
          A little gift for
        </p>
        <p className="font-hand text-[44px] leading-none">{found.content.them}</p>
        <div className="mt-5 rounded-2xl bg-white p-3 shadow-[0_0_0_1px_rgba(201,164,92,0.5)]">
          <div className="h-[150px] w-[150px] [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qr }} />
        </div>
        <p className="mt-3 text-sm font-bold">Scan me with your phone camera</p>
        <p className="mt-0.5 font-hand text-xl">— from {found.content.you}</p>
        <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "#9a7426" }}>
          heartlink
        </p>
      </div>

      <div className="no-print flex flex-col items-center gap-3">
        <PrintButton />
        <Link href="/gifts" className="text-sm font-bold text-muted">
          Back to my gifts
        </Link>
      </div>
    </main>
  );
}
