"use client";

import { useEffect, useState } from "react";
import { sound } from "@/lib/sound";
import type { GiftContent, Pair } from "@/lib/templates/types";
import { CloseIcon, HeartIcon } from "../Icons";
import { Story } from "./Story";

export function OpenWhenExperience({ content, preview = false, slug }: { content: GiftContent; preview?: boolean; slug?: string }) {
  const letters = (Array.isArray(content.values.letters) ? (content.values.letters as Pair[]) : []).filter((l) => l.title?.trim() && l.body?.trim());
  return (
    <Story
      content={content}
      preview={preview}
      slug={slug}
      scenes={["letters"]}
      renderScene={(scene, next) => scene === "letters" && <Letters letters={letters} you={content.you} them={content.them} storeKey={slug ? `heartlink:opened:${slug}` : null} onDone={next} />}
    />
  );
}

const TILTS = [-2.5, 1.8, -1.2, 2.6, -1.8, 1.2, -2.2, 2];

/** Sealed envelopes; which ones were opened is remembered on this phone, so the rest can wait. */
function Letters({ letters, you, them, storeKey, onDone }: { letters: Pair[]; you: string; them: string; storeKey: string | null; onDone: () => void }) {
  const [opened, setOpened] = useState<number[]>([]);
  const [reading, setReading] = useState<number | null>(null);

  useEffect(() => {
    if (!storeKey) return;
    try {
      const saved = JSON.parse(localStorage.getItem(storeKey) ?? "[]");
      if (Array.isArray(saved)) setOpened(saved.filter((n) => typeof n === "number"));
    } catch {}
  }, [storeKey]);

  const open = (i: number) => {
    sound.chime("open");
    setReading(i);
    if (opened.includes(i)) return;
    const next = [...opened, i];
    setOpened(next);
    try {
      if (storeKey) localStorage.setItem(storeKey, JSON.stringify(next));
    } catch {}
  };

  return (
    <>
      <h1 className="font-display text-[26px] font-light leading-tight">Letters for later</h1>
      <p className="mt-1.5 text-[15px] text-muted">
        {you} sealed these for you, {them}. Open one when the moment comes. You don&apos;t have to read them all today.
      </p>
      <div className="mt-6 grid w-full grid-cols-2 gap-3">
        {letters.map((l, i) => {
          const isOpen = opened.includes(i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => open(i)}
              aria-label={`Open when ${l.title}${isOpen ? " (opened)" : ""}`}
              className="relative flex h-[120px] flex-col justify-end rounded-[12px] p-3 text-left transition-transform active:scale-95"
              style={{ background: "var(--paper)", color: "var(--paper-ink)", transform: `rotate(${TILTS[i % TILTS.length]}deg)`, boxShadow: "0 10px 22px -10px rgba(0,0,0,0.45)" }}
            >
              <svg viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute inset-x-0 top-0 h-[58%] w-full" aria-hidden="true">
                <path d="M0 0 L50 44 L100 0" fill={isOpen ? "none" : "rgba(120,100,60,0.08)"} stroke="rgba(120,100,60,0.3)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              </svg>
              {!isOpen && (
                <span className="absolute left-1/2 top-[34%] flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white" style={{ background: "var(--heart)", boxShadow: "0 0 0 3px var(--paper)" }} aria-hidden="true">
                  <HeartIcon size={14} />
                </span>
              )}
              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] opacity-55">{isOpen ? "Opened" : "Open when"}</span>
              <span className="font-hand text-[21px] leading-tight">{l.title}</span>
            </button>
          );
        })}
      </div>
      <button type="button" onClick={onDone} className={`${opened.length ? "btn-cta" : "btn-sec"} mt-8 h-14 rounded-full px-8 font-extrabold`}>
        {opened.length ? "Save the rest for later" : "I'll open them when I need to"}
      </button>

      {reading !== null && (
        <div className="anim-fade fixed inset-0 z-40 flex items-center justify-center bg-[rgba(6,14,16,0.82)] p-5" onClick={() => setReading(null)} role="dialog" aria-modal="true" aria-label={`Open when ${letters[reading].title}`}>
          <div className="anim-letter relative max-h-[86dvh] w-full max-w-md overflow-y-auto rounded-[18px] px-6 pb-7 pt-6 text-left" style={{ background: "var(--paper)", color: "var(--paper-ink)", backgroundImage: "repeating-linear-gradient(180deg, transparent 0 33px, rgba(120,100,60,0.12) 33px 34px)", backgroundPosition: "0 62px" }} onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setReading(null)} aria-label="Close the letter" className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full opacity-60">
              <CloseIcon size={18} />
            </button>
            <p className="text-[10.5px] font-extrabold uppercase tracking-[0.18em] opacity-55">Open when</p>
            <p className="font-hand text-[30px] leading-tight">{letters[reading].title}</p>
            <div className="mt-3 font-hand text-[23px] leading-[34px]">
              {letters[reading].body.split("\n").map((line, li) => (
                <p key={li} className="ink-in min-h-[34px]" style={{ animationDelay: `${0.2 + li * 0.35}s` }}>
                  {line}
                </p>
              ))}
            </div>
            <p className="ink-in mt-3 text-right font-hand text-[24px]" style={{ animationDelay: `${0.4 + letters[reading].body.split("\n").length * 0.35}s` }}>
              — {you}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
