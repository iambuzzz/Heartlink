import type { Metadata } from "next";
import Link from "next/link";
import { isAdmin } from "@/lib/server/admin";
import { backendReady, env } from "@/lib/server/env";
import { listOrdersForReview } from "@/lib/server/gifts";
import { formatRupees } from "@/lib/server/upi";
import { login, review } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — heartlink", robots: { index: false, follow: false } };

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "medium", timeStyle: "short" }) : "—");

const STATUS_STYLE: Record<string, string> = {
  claimed: "bg-[var(--fly-core)] text-[#3a2a05]",
  verified: "bg-[#2a7a4b] text-white",
  rejected: "bg-[var(--heart)] text-white",
};

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (!backendReady() || !env.adminPassword) {
    return <Shell>Set SUPABASE_*, UPI_VPA and ADMIN_PASSWORD in .env.local to use the admin page.</Shell>;
  }

  if (!(await isAdmin())) {
    const { error } = await searchParams;
    return (
      <Shell>
        <form action={login} className="glass flex flex-col gap-3 rounded-[22px] p-5">
          <label htmlFor="password" className="text-sm font-bold">
            Admin password
          </label>
          <input id="password" name="password" type="password" autoComplete="current-password" required className="rounded-xl border border-glass-line bg-field px-4 py-3 outline-none" />
          {error && <p className="text-sm font-bold text-heart">Wrong password.</p>}
          <button type="submit" className="btn-cta h-12 rounded-full font-extrabold">
            Log in
          </button>
        </form>
      </Shell>
    );
  }

  const orders = await listOrdersForReview();
  const pending = orders.filter((o) => o.status === "claimed");

  return (
    <Shell wide>
      <p className="text-sm text-muted">
        Match each <b>amount + UTR</b> with a credit on your {env.upiVpa} statement. Verify it if it&apos;s there. Reject it if it isn&apos;t (that pauses the gift).
      </p>
      <p className="mt-2 font-bold">{pending.length} waiting for review</p>
      <div className="mt-4 flex flex-col gap-2.5">
        {orders.length === 0 && <p className="text-muted">No payments yet.</p>}
        {orders.map((o) => (
          <div key={o.id} className="glass flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl p-4">
            <span className="font-display text-xl tabular-nums">₹{formatRupees(o.amount_paise)}</span>
            <span className="font-mono text-sm">{o.utr}</span>
            <span className="text-sm text-muted">{when(o.claimed_at)}</span>
            <span className="text-sm">for {o.gift?.content.them ?? "?"}</span>
            {o.gift && (
              <Link href={`/g/${o.gift.slug}`} className="text-sm font-bold underline" target="_blank">
                open gift
              </Link>
            )}
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase ${STATUS_STYLE[o.status] ?? ""}`}>{o.status}</span>
            <form action={review} className="ml-auto flex gap-2">
              <input type="hidden" name="orderId" value={o.id} />
              {o.status !== "verified" && (
                <button name="decision" value="verified" className="btn-cta h-10 rounded-full px-4 text-sm font-extrabold">
                  Verify
                </button>
              )}
              {o.status !== "rejected" && (
                <button name="decision" value="rejected" className="btn-sec h-10 rounded-full px-4 text-sm font-bold">
                  Reject
                </button>
              )}
            </form>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function Shell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <main className={`mx-auto px-5 py-10 ${wide ? "max-w-4xl" : "max-w-sm"}`}>
      <h1 className="mb-4 font-display text-2xl">Payments</h1>
      {children}
    </main>
  );
}
