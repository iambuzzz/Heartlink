import { NextResponse } from "next/server";
import { backendReady } from "@/lib/server/env";
import { addReply, BadRequest } from "@/lib/server/gifts";

// The recipient's paper plane back to the sender.
export async function POST(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!backendReady()) return NextResponse.json({ error: "Replies aren't switched on yet." }, { status: 503 });
  const { slug } = await params;
  const body = (await req.json().catch(() => ({}))) as { message?: unknown; voice?: unknown };
  try {
    await addReply(slug, typeof body.message === "string" ? body.message : "", body.voice ?? null);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof BadRequest) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("reply failed", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
