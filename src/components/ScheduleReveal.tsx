"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { revealLabel } from "./experience/Teaser";
import { LockIcon } from "./Icons";

type Mode = "now" | "midnight" | "exact";

const todayIST = () => new Date(Date.now() + 5.5 * 3600 * 1000).toISOString().slice(0, 10);

/** Lets the sender seal the gift until a moment, e.g. midnight on the birthday (India time). */
export function ScheduleReveal({ giftId, revealAt }: { giftId: string; revealAt: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("midnight");
  const [date, setDate] = useState("");
  const [exact, setExact] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async (value: string | null) => {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/gifts/${giftId}/reveal`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ revealAt: value }) }).catch(() => null);
    setBusy(false);
    if (!res?.ok) {
      setError(((await res?.json().catch(() => ({}))) as { error?: string } | undefined)?.error ?? "Couldn't save. Try again.");
      return;
    }
    setOpen(false);
    router.refresh();
  };

  const chosen = mode === "now" ? null : mode === "midnight" ? (date ? new Date(`${date}T00:00:00+05:30`).toISOString() : "") : exact ? new Date(exact).toISOString() : "";
  const sealed = revealAt && Date.parse(revealAt) > Date.now();

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="glass flex w-full items-center gap-3 rounded-2xl p-3 pl-4 text-left">
        <LockIcon size={18} />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-extrabold">{sealed ? `Opens ${revealLabel(revealAt!)}` : "Opens right away"}</span>
          <span className="block text-xs text-muted">{sealed ? "Until then the link shows a countdown." : "Seal it until midnight on the day?"}</span>
        </span>
        <span className="text-sm font-bold text-gold">Change</span>
      </button>
    );
  }

  return (
    <div className="glass flex w-full flex-col gap-3 rounded-2xl p-4 text-left">
      <p className="text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-gold">When should it open?</p>
      <div className="grid grid-cols-3 gap-2">
        {(
          [
            ["now", "Right away"],
            ["midnight", "Midnight on…"],
            ["exact", "Exact time"],
          ] as [Mode, string][]
        ).map(([m, label]) => (
          <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={`h-11 rounded-xl border text-[13px] font-bold ${mode === m ? "btn-cta border-transparent" : "border-sec-line bg-sec"}`}>
            {label}
          </button>
        ))}
      </div>
      {mode === "midnight" && (
        <label className="text-sm">
          <span className="mb-1 block text-muted">The day it opens (12:00 AM, India time)</span>
          <input type="date" min={todayIST()} value={date} onChange={(e) => setDate(e.target.value)} className="w-full rounded-xl border border-glass-line bg-field px-3 py-2.5" />
        </label>
      )}
      {mode === "exact" && (
        <label className="text-sm">
          <span className="mb-1 block text-muted">Date and time (your phone&apos;s time zone)</span>
          <input type="datetime-local" value={exact} onChange={(e) => setExact(e.target.value)} className="w-full rounded-xl border border-glass-line bg-field px-3 py-2.5" />
        </label>
      )}
      {error && <p className="text-sm font-bold text-heart">{error}</p>}
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(false)} className="btn-sec h-11 flex-1 rounded-full text-sm font-bold">
          Cancel
        </button>
        <button type="button" disabled={busy || chosen === ""} onClick={() => save(chosen)} className="btn-cta h-11 flex-1 rounded-full text-sm font-extrabold disabled:opacity-45">
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
