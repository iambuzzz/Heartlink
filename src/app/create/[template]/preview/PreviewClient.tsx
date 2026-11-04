"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GiftExperience } from "@/components/experience/GiftExperience";
import { CloseIcon, LockIcon } from "@/components/Icons";
import { loadDraft, saveDraft, toContent, type Draft } from "@/lib/draft";
import { getTemplate, validateGift } from "@/lib/templates";

type Order = { giftId: string; orderId: string; amount: string; upiLink: string; qrSvg: string; vpa: string; payee: string };

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Something went wrong");
  return data as T;
}

export function PreviewClient({ slug }: { slug: string }) {
  const template = getTemplate(slug)!;
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [utr, setUtr] = useState("");

  useEffect(() => setDraft(loadDraft(slug)), [slug]);

  if (draft === undefined) return <div className="min-h-dvh" />;

  const content = draft ? toContent(draft) : null;
  const errors = content ? validateGift(template, content) : ["Start by choosing who the gift is for"];
  if (!draft || !content || errors.length) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-display text-2xl font-light">A few things are missing</h1>
        <ul className="text-sm text-muted">
          {errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
        <Link href={`/create/${slug}`} className="btn-cta inline-flex h-12 items-center rounded-full px-6 font-extrabold no-underline">
          Back to the builder
        </Link>
      </div>
    );
  }

  const startPayment = async () => {
    setBusy(true);
    setError(null);
    try {
      const o = await postJson<Order>("/api/checkout", { template: slug, giftId: draft.giftId, content });
      const saved = { ...draft, giftId: o.giftId };
      saveDraft(slug, saved);
      setDraft(saved);
      setOrder(o);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const claim = async () => {
    if (!order) return;
    setBusy(true);
    setError(null);
    try {
      const { slug: giftSlug } = await postJson<{ slug: string }>("/api/checkout/claim", { orderId: order.orderId, utr });
      router.push(`/create/${slug}/done?slug=${giftSlug}`);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  };

  const close = () => {
    setOrder(null);
    setError(null);
  };

  return (
    <>
      <GiftExperience template={slug} content={content} preview />

      <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4">
        <div className="glass glass-blur mx-auto flex max-w-md items-center gap-3 rounded-[22px] p-2 pl-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-muted">{content.them}&apos;s gift is ready</p>
            <p className="font-display text-lg">
              ₹{template.priceInr} <span className="text-sm text-muted">one time</span>
            </p>
          </div>
          <Link href={`/create/${slug}`} className="btn-sec flex h-12 items-center rounded-full px-4 text-sm font-bold no-underline">
            Edit
          </Link>
          <button type="button" onClick={startPayment} disabled={busy} className="btn-cta flex h-12 items-center gap-2 rounded-full px-5 text-sm font-extrabold disabled:opacity-60">
            <LockIcon size={16} /> {busy && !order ? "Saving…" : "Unlock link"}
          </button>
        </div>
      </div>

      {(order || error) && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/40 p-3 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="pay-title" onClick={close}>
          <div className="glass anim-rise max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-[26px] p-5" style={{ background: "var(--bg-solid)" }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <h2 id="pay-title" className="font-display text-xl">
                {order ? "Pay with any UPI app" : "Not yet"}
              </h2>
              <button type="button" onClick={close} aria-label="Close" className="-mr-2 -mt-2 flex h-11 w-11 items-center justify-center rounded-full">
                <CloseIcon size={18} />
              </button>
            </div>

            {order && (
              <>
                <p className="mt-1 text-sm text-muted">
                  Pay exactly <b className="text-ink">₹{order.amount}</b>. The extra paise help us match your payment.
                </p>
                <div className="mt-4 flex flex-col items-center gap-3">
                  <div className="w-48 rounded-2xl bg-white p-2.5" aria-label={`UPI QR code for ₹${order.amount}`} role="img" dangerouslySetInnerHTML={{ __html: order.qrSvg }} />
                  <p className="text-xs text-muted">
                    Scan with GPay, PhonePe or Paytm · {order.payee} · {order.vpa}
                  </p>
                  <a href={order.upiLink} className="btn-cta flex h-12 w-full items-center justify-center rounded-full font-extrabold no-underline">
                    Open my UPI app
                  </a>
                  {/* Personal UPI IDs make some apps show a "pay up to ₹2,000" note, which reads like an error. */}
                  <p className="text-center text-xs text-muted">If your UPI app shows a note about a ₹2,000 limit, just tap Dismiss. Your payment is well within it.</p>
                </div>
                <div className="my-5 h-px bg-divider" />
                <label htmlFor="utr" className="text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-gold">
                  After paying: UPI reference (UTR)
                </label>
                <input
                  id="utr"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={14}
                  placeholder="12-digit number"
                  value={utr}
                  onChange={(e) => setUtr(e.target.value.replace(/[^\d ]/g, ""))}
                  className="mt-2 w-full rounded-2xl border border-glass-line bg-field px-4 py-3 text-lg tracking-widest outline-none"
                />
                <p className="mt-1.5 text-xs text-muted">Find it in your UPI app under this payment&apos;s details (UPI Ref No. / UTR).</p>
                <button type="button" onClick={claim} disabled={busy || utr.replace(/\s/g, "").length !== 12} className="btn-cta mt-4 h-14 w-full rounded-full font-extrabold disabled:opacity-50">
                  {busy ? "Unlocking…" : "I've paid, unlock my link"}
                </button>
              </>
            )}

            {error && <p className="mt-3 text-[15px] font-bold leading-relaxed text-heart">{error}</p>}
            {!order && error && <p className="mt-2 text-sm text-muted">Your gift is still saved on this device.</p>}
          </div>
        </div>
      )}
    </>
  );
}
