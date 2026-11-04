import { NextResponse } from "next/server";
import { backendReady } from "@/lib/server/env";
import { getPaidGift, recordEvent } from "@/lib/server/gifts";

// The recipient held the jhappi button; the sender sees it in their gift's activity.
export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!backendReady()) return NextResponse.json({ ok: false }, { status: 503 });
  const { slug } = await params;
  const found = await getPaidGift(slug);
  if (!found) return NextResponse.json({ ok: false }, { status: 404 });
  await recordEvent(found.gift.id, "hug");
  return NextResponse.json({ ok: true });
}
