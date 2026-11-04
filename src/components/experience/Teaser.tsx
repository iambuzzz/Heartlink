"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Countdown } from "../Countdown";
import { MemoryJar } from "../scenery";

export const revealLabel = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

/** Shown on the gift link before its reveal time. The gift itself isn't sent to the page until then. */
export function Teaser({ them, you, revealAt }: { them: string; you: string; revealAt: string }) {
  const router = useRouter();
  const open = useCallback(() => router.refresh(), [router]);

  const addToCalendar = () => {
    const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const start = new Date(revealAt);
    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//heartlink//EN",
      "BEGIN:VEVENT",
      `UID:${start.getTime()}@heartlink`,
      `DTSTAMP:${stamp(new Date())}`,
      `DTSTART:${stamp(start)}`,
      `DTEND:${stamp(new Date(start.getTime() + 30 * 60 * 1000))}`,
      `SUMMARY:A gift from ${you} opens`,
      `DESCRIPTION:${window.location.href}`,
      `URL:${window.location.href}`,
      "BEGIN:VALARM",
      "TRIGGER:PT0M",
      "ACTION:DISPLAY",
      "DESCRIPTION:Your gift is open",
      "END:VALARM",
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = "heartlink-gift.ics";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 py-10 text-center">
      <div className="scale-125">
        <MemoryJar label={`for ${them}`} />
      </div>
      <p className="mt-10 text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-gold">Sealed until it&apos;s time</p>
      <h1 className="mt-2 font-display text-[30px] font-light leading-tight">
        Something&apos;s on its way to you, <span className="text-shine font-medium">{them}</span>
      </h1>
      <p className="mt-2 text-[15px] text-muted">
        {you} made you a gift. It opens on <b className="text-ink">{revealLabel(revealAt)}</b>.
      </p>
      <div className="mt-7 w-full">
        <Countdown target={Date.parse(revealAt)} onDone={open} large />
      </div>
      <button type="button" onClick={addToCalendar} className="btn-sec mt-6 h-12 rounded-full px-6 font-bold">
        Remind me when it opens
      </button>
      <p className="mt-4 text-xs text-muted">Keep this page open and it will open by itself.</p>
    </main>
  );
}
