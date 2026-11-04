import { NextResponse } from "next/server";
import { existingDeviceUserId } from "@/lib/server/device";
import { backendReady } from "@/lib/server/env";
import { BadRequest, setRevealAt } from "@/lib/server/gifts";

// The sender picks when the gift opens; until then the link shows a countdown.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!backendReady()) return NextResponse.json({ error: "Not available yet." }, { status: 503 });
  const ownerId = await existingDeviceUserId();
  if (!ownerId) return NextResponse.json({ error: "Open this from the phone you made the gift on." }, { status: 403 });
  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as { revealAt?: unknown };
  try {
    const revealAt = await setRevealAt(ownerId, id, typeof body.revealAt === "string" ? body.revealAt : null);
    return NextResponse.json({ revealAt });
  } catch (e) {
    if (e instanceof BadRequest) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("reveal update failed", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
