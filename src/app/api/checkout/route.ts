import { NextResponse } from "next/server";
import { deviceUserId } from "@/lib/server/device";
import { backendReady, env } from "@/lib/server/env";
import { BadRequest, saveDraftGift } from "@/lib/server/gifts";
import { db } from "@/lib/server/supabase";
import { formatRupees, uniqueAmountPaise, upiLink, upiQrSvg } from "@/lib/server/upi";
import { getTemplate } from "@/lib/templates";

// Saves the draft as a gift and opens a UPI order for it. The price always comes
// from the template on the server, never from the request.
export async function POST(req: Request) {
  if (!backendReady()) {
    return NextResponse.json({ error: "Payments aren't switched on yet." }, { status: 503 });
  }
  try {
    const body = (await req.json()) as { template?: string; giftId?: string; content?: unknown };
    const template = getTemplate(String(body.template ?? ""));
    if (!template) return NextResponse.json({ error: "Unknown template" }, { status: 400 });

    const ownerId = await deviceUserId();
    const gift = await saveDraftGift(ownerId, template.slug, body.content, body.giftId);
    const amountPaise = await uniqueAmountPaise(template.priceInr);
    const { data: order, error } = await db().from("orders").insert({ user_id: ownerId, gift_id: gift.id, kind: "gift", amount_paise: amountPaise }).select("id").single();
    if (error) throw error;

    const link = upiLink(amountPaise, `HeartLink gift ${gift.slug.slice(0, 6)}`);
    return NextResponse.json({
      giftId: gift.id,
      orderId: order.id,
      amount: formatRupees(amountPaise),
      upiLink: link,
      qrSvg: await upiQrSvg(link),
      vpa: env.upiVpa,
      payee: env.upiPayeeName,
    });
  } catch (e) {
    if (e instanceof BadRequest) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error("checkout failed", e);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
