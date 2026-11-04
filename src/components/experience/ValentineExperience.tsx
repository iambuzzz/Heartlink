"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { sound } from "@/lib/sound";
import type { GiftContent } from "@/lib/templates/types";
import { VALENTINE_DAYS, valentineStart } from "@/lib/templates/valentine";
import { CloseIcon, LockIcon } from "../Icons";
import { Story } from "./Story";

const DAY_MS = 24 * 60 * 60 * 1000;

export function ValentineExperience({ content, preview = false, slug }: { content: GiftContent; preview?: boolean; slug?: string }) {
  return (
    <Story
      content={content}
      preview={preview}
      slug={slug}
      scenes={["week"]}
      renderScene={(scene, next) => scene === "week" && <Week content={content} preview={preview} onDone={next} />}
    />
  );
}

const fmt = (t: number) => new Date(t).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" });

function Week({ content, preview, onDone }: { content: GiftContent; preview: boolean; onDone: () => void }) {
  const router = useRouter();
  const notes = (content.values.days ?? {}) as Record<string, string>;
  const start = typeof content.values.start === "string" ? valentineStart(content.values.start) : Date.now();
  const [reading, setReading] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // The server only sends days that have arrived; when the next one does, fetch it.
  const nextUnlock = VALENTINE_DAYS.map((_, i) => start + i * DAY_MS).find((t) => t > now);
  useEffect(() => {
    if (preview || !nextUnlock || nextUnlock - Date.now() > DAY_MS) return;
    const t = window.setTimeout(() => {
      setNow(Date.now());
      router.refresh();
    }, nextUnlock - Date.now() + 1500);
    return () => window.clearTimeout(t);
  }, [nextUnlock, preview, router]);

  const todayIndex = VALENTINE_DAYS.findIndex((_, i) => now >= start + i * DAY_MS && now < start + (i + 1) * DAY_MS);
  const openCount = VALENTINE_DAYS.filter((d) => preview || typeof notes[d.id] === "string").length;

  return (
    <>
      <h1 className="font-display text-[26px] font-light leading-tight">Your Valentine&apos;s week, {content.them}</h1>
      <p className="mt-1.5 text-[15px] text-muted">{openCount === VALENTINE_DAYS.length ? "Every day is open now." : `A new surprise opens every midnight. ${openCount} of 8 open so far.`}</p>
      <ol className="mt-6 flex w-full flex-col gap-2.5">
        {VALENTINE_DAYS.map((d, i) => {
          const at = start + i * DAY_MS;
          const isOpen = preview || typeof notes[d.id] === "string";
          const isToday = i === todayIndex;
          const daysLeft = Math.ceil((at - now) / DAY_MS);
          return (
            <li key={d.id}>
              <button
                type="button"
                disabled={!isOpen}
                onClick={() => {
                  sound.chime("open");
                  setReading(i);
                }}
                className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-transform active:scale-[0.98] ${isOpen ? "glass" : "border border-dashed border-glass-line opacity-60"} ${isToday ? "ring-2 ring-[var(--gold-text)]" : ""}`}
              >
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isOpen ? "bg-cell" : ""}`}>{isOpen ? <DayIcon id={d.id} /> : <LockIcon size={18} />}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-hand text-[24px] leading-tight">{d.title}</span>
                  <span className="block text-xs text-muted">{fmt(at)}</span>
                </span>
                <span className="shrink-0 text-xs font-extrabold uppercase tracking-wider text-gold">{isToday ? "New today" : isOpen ? "Open" : daysLeft <= 1 ? "Tomorrow" : `In ${daysLeft} days`}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <button type="button" onClick={onDone} className="btn-cta mt-7 h-14 rounded-full px-8 font-extrabold">
        Keep going
      </button>

      {reading !== null && (
        <div className="anim-fade fixed inset-0 z-40 flex items-center justify-center bg-[rgba(6,14,16,0.82)] p-5" onClick={() => setReading(null)} role="dialog" aria-modal="true" aria-label={VALENTINE_DAYS[reading].title}>
          <div className="anim-letter relative w-full max-w-md rounded-[18px] px-6 pb-7 pt-6 text-center" style={{ background: "var(--paper)", color: "var(--paper-ink)" }} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setReading(null)} aria-label="Close" className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full opacity-60">
              <CloseIcon size={18} />
            </button>
            <span className="valentine-pop mx-auto flex h-20 w-20 items-center justify-center rounded-full" style={{ background: "rgba(231,180,60,0.16)" }}>
              <DayIcon id={VALENTINE_DAYS[reading].id} size={46} />
            </span>
            <p className="mt-3 text-[11px] font-extrabold uppercase tracking-[0.18em] opacity-55">{fmt(start + reading * DAY_MS)}</p>
            <p className="font-hand text-[32px] leading-tight">{VALENTINE_DAYS[reading].title}</p>
            <p className="ink-in mt-3 whitespace-pre-wrap font-hand text-[24px] leading-snug" style={{ animationDelay: "0.35s" }}>
              {notes[VALENTINE_DAYS[reading].id] || "Something sweet goes here."}
            </p>
            <p className="ink-in mt-3 font-hand text-[22px]" style={{ animationDelay: "0.8s" }}>
              — {content.you}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/** A small drawing for each day of the week. */
function DayIcon({ id, size = 30 }: { id: string; size?: number }) {
  const s = { width: size, height: size, viewBox: "0 0 32 32", "aria-hidden": true } as const;
  switch (id) {
    case "rose":
      return (
        <svg {...s}>
          <path d="M16 18v11M16 24c-3-1-5-3-6-5M16 22c2-2 5-2 6-1" stroke="#4f8a3c" strokeWidth={1.8} fill="none" strokeLinecap="round" />
          <path d="M9 10c0-4 3-7 7-7s7 3 7 7-3 8-7 8-7-4-7-8z" fill="#e0425f" />
          <path d="M12 9c1-2 3-3 5-2s3 3 2 5-4 2-5 0 1-3 3-2" stroke="#9e1c37" strokeWidth={1.3} fill="none" strokeLinecap="round" />
        </svg>
      );
    case "propose":
      return (
        <svg {...s}>
          <circle cx={16} cy={20} r={8} fill="none" stroke="#e7b43c" strokeWidth={2.6} />
          <path d="M12 9l4-5 4 5-4 4z" fill="#bfe6ff" stroke="#7fb6d9" strokeWidth={1} />
        </svg>
      );
    case "chocolate":
      return (
        <svg {...s}>
          <rect x={7} y={5} width={18} height={23} rx={2} fill="#6b3a1f" />
          <path d="M7 12.5h18M7 20h18M16 5v23" stroke="#4a2614" strokeWidth={1.4} />
          <path d="M7 20l18-10v18H7z" fill="#c8202f" opacity={0.9} />
        </svg>
      );
    case "teddy":
      return (
        <svg {...s}>
          <circle cx={9} cy={9} r={4} fill="#b9814f" />
          <circle cx={23} cy={9} r={4} fill="#b9814f" />
          <circle cx={16} cy={17} r={10} fill="#c99260" />
          <ellipse cx={16} cy={21} rx={4.5} ry={3.5} fill="#ecd2b0" />
          <circle cx={12} cy={15} r={1.3} fill="#3a2414" />
          <circle cx={20} cy={15} r={1.3} fill="#3a2414" />
          <path d="M14.8 19.6h2.4l-1.2 1.3z" fill="#3a2414" />
        </svg>
      );
    case "promise":
      return (
        <svg {...s}>
          <path d="M5 18c4-6 9-6 11 0s7 6 11 0" stroke="#e7b43c" strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M5 18c4 6 9 6 11 0s7-6 11 0" stroke="#e0425f" strokeWidth={3} fill="none" strokeLinecap="round" />
        </svg>
      );
    case "hug":
      return (
        <svg {...s}>
          <path d="M12 26S4 21 4 14.5A4.5 4.5 0 0 1 12 11a4.5 4.5 0 0 1 8 3.5C20 21 12 26 12 26z" fill="#f08aa0" />
          <path d="M20 24s-8-5-8-11.5A4.5 4.5 0 0 1 20 9a4.5 4.5 0 0 1 8 3.5C28 19 20 24 20 24z" fill="#e0425f" opacity={0.92} />
        </svg>
      );
    case "kiss":
      return (
        <svg {...s}>
          <path d="M3 16c4-5 8-6 10-4 1.5-1.5 4.5-1.5 6 0 2-2 6-1 10 4-4 6-9 8-13 8S7 22 3 16z" fill="#d92b4b" />
          <path d="M3 16c6 1 20 1 26 0" stroke="#8f1028" strokeWidth={1.4} fill="none" />
        </svg>
      );
    default:
      return (
        <svg {...s}>
          <path d="M16 28S4 21 4 12.5A6 6 0 0 1 16 9a6 6 0 0 1 12 3.5C28 21 16 28 16 28z" fill="#e0425f" />
          <path d="M9 12a3 3 0 0 1 3-3" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" opacity={0.6} />
        </svg>
      );
  }
}
