import { NextResponse } from "next/server";
import { existingDeviceUserId } from "@/lib/server/device";
import { backendReady } from "@/lib/server/env";
import { BadRequest, claimOrder } from "@/lib/server/gifts";
import { isUtr } from "@/lib/server/upi";

export async function POST(req: Request) {
  if (!backendReady()) return NextResponse.json({ error: "Payments aren't switched on yet." }, { status: 503 });
  const body = (await req.json()) as { orderId?: string; utr?: string };
  const utr = String(body.utr ?? "").replace(/\s/g, "");
  if (!isUtr(utr)) return NextResponse.json({ error: "The UTR is the 12-digit number in your UPI app's payment details." }, { status: 400 });

  const ownerId = await existingDeviceUserId();
  if (!ownerId) return NextResponse.json({ error: "Please start checkout again from this device." }, { status: 400 });
  try {
    const slug = await claimOrder(ownerId, String(body.orderId ?? ""), utr);
    return NextResponse.json({ slug });
  } catch (e) {
    if (e instanceof BadRequest) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("claim failed", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
