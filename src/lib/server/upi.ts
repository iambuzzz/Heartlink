import "server-only";
import { randomInt } from "node:crypto";
import QRCode from "qrcode";
import { env } from "./env";
import { db } from "./supabase";

const HOUR_MS = 1000 * 60 * 60;
// A claimed order keeps its amount until it's reviewed; an unpaid one lets go after 2 hours.
const CLAIMED_HOLD_MS = 48 * HOUR_MS;
const UNPAID_HOLD_MS = 2 * HOUR_MS;

/**
 * Picks an amount like ₹99.37 that no other open order is using, so a line on the bank
 * statement maps to exactly one order. The paise stay under a rupee so ₹99 never reads
 * as ₹100, which allows 99 buyers mid-payment at once.
 */
export async function uniqueAmountPaise(priceInr: number): Promise<number> {
  const base = priceInr * 100;
  const now = Date.now();
  const { data, error } = await db()
    .from("orders")
    .select("amount_paise, status, created_at")
    .in("status", ["created", "claimed"])
    .gte("created_at", new Date(now - CLAIMED_HOLD_MS).toISOString())
    .gt("amount_paise", base)
    .lt("amount_paise", base + 100);
  if (error) throw error;
  const held = (data ?? []).filter((o) => o.status === "claimed" || now - Date.parse(o.created_at as string) < UNPAID_HOLD_MS);
  const taken = new Set(held.map((o) => o.amount_paise as number));
  const free = Array.from({ length: 99 }, (_, i) => base + 1 + i).filter((a) => !taken.has(a));
  if (!free.length) throw new Error("No free payment amounts right now");
  return free[randomInt(free.length)];
}

export const formatRupees = (paise: number) => (paise / 100).toFixed(2);

// Built by hand: some UPI apps show URLSearchParams' "+" for spaces literally, and choke on "%40" in the VPA.
export function upiLink(amountPaise: number, note: string): string {
  const vpa = env.upiVpa.replace(/[^A-Za-z0-9.@_-]/g, "");
  const enc = encodeURIComponent;
  return `upi://pay?pa=${vpa}&pn=${enc(env.upiPayeeName)}&am=${formatRupees(amountPaise)}&cu=INR&tn=${enc(note)}`;
}

export const upiQrSvg = (link: string) => QRCode.toString(link, { type: "svg", margin: 1, errorCorrectionLevel: "M" });

/** A QR for any link, drawn in `color` so it can sit on a printed card. */
export const qrSvg = (text: string, color = "#1f2a24") => QRCode.toString(text, { type: "svg", margin: 0, errorCorrectionLevel: "Q", color: { dark: color, light: "#0000" } });

export const isUtr = (utr: string) => /^\d{12}$/.test(utr);
