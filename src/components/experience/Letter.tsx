"use client";

import { useEffect, useMemo, useState } from "react";
import { sound } from "@/lib/sound";
import { HeartIcon } from "../Icons";

type Stage = "sealed" | "opening" | "open";

/** An envelope that opens, then a letter that writes itself in, word by word. */
export function Letter({ text, them, you, onDone }: { text: string; them: string; you: string; onDone: () => void }) {
  const [stage, setStage] = useState<Stage>("sealed");
  const [instant, setInstant] = useState(false);
  useEffect(() => {
    if (stage !== "opening") return;
    const t = window.setTimeout(() => setStage("open"), 1250);
    return () => window.clearTimeout(t);
  }, [stage]);

  const lines = useMemo(() => {
    let n = 0;
    return text.split("\n").map((line) => line.split(/\s+/).filter(Boolean).map((w) => ({ w, i: n++ })));
  }, [text]);
  const words = lines.reduce((sum, l) => sum + l.length, 0);
  // About 6 seconds however long the letter is, but never faster than a calm reading pace.
  const step = Math.min(0.11, 6 / Math.max(1, words));
  const signDelay = instant ? 0 : words * step + 0.3;

  if (stage !== "open") {
    return (
      <>
        <h1 className="font-display text-[26px] font-light">One last thing</h1>
        <button
          type="button"
          disabled={stage === "opening"}
          onClick={() => {
            sound.chime("open");
            setStage("opening");
          }}
          aria-label="Open the letter"
          className={`envelope relative mt-8 h-[170px] w-[260px] ${stage === "opening" ? "is-opening" : "anim-floaty"}`}
        >
          <span className="env-back" />
          <span className="env-paper" />
          <svg viewBox="0 0 260 170" width={260} height={170} className="env-pocket" aria-hidden="true">
            <path d="M0 6 L118 98 Q130 106 142 98 L260 6 L260 164 Q260 170 254 170 L6 170 Q0 170 0 164 Z" fill="var(--paper)" />
            <path d="M0 170 L108 86 M260 170 L152 86" stroke="rgba(120,100,60,0.22)" strokeWidth={1} />
          </svg>
          <span className="env-flap" />
          <span className="env-seal" style={{ background: "var(--heart)" }}>
            <HeartIcon size={18} />
          </span>
          <span className="env-to font-hand text-xl" style={{ color: "var(--paper-ink)" }}>
            to {them}
          </span>
        </button>
        <p className="mt-6 text-sm font-bold text-muted">{stage === "opening" ? "…" : "Tap the envelope"}</p>
      </>
    );
  }

  return (
    <>
      <div
        className="anim-letter relative w-full cursor-default rounded-[18px] px-6 py-6 text-left shadow-[var(--glow)]"
        style={{ background: "var(--paper)", color: "var(--paper-ink)", backgroundImage: "repeating-linear-gradient(180deg, transparent 0 33px, rgba(120,100,60,0.12) 33px 34px)", backgroundPosition: "0 22px" }}
        onClick={() => setInstant(true)}
      >
        <div className="font-hand text-[23px] leading-[34px]">
          {lines.map((line, li) =>
            line.length ? (
              <p key={li}>
                {line.map(({ w, i }) => (
                  <span key={i} className={instant ? "" : "ink-in"} style={instant ? undefined : { animationDelay: `${(i * step).toFixed(2)}s` }}>
                    {w}{" "}
                  </span>
                ))}
              </p>
            ) : (
              <p key={li} className="h-[34px]" />
            ),
          )}
        </div>
        <p className="ink-in mt-2 text-right font-hand text-[25px]" style={{ animationDelay: `${signDelay.toFixed(2)}s` }}>
          — {you}
        </p>
      </div>
      <button type="button" onClick={onDone} className="btn-cta ink-in mt-6 h-14 rounded-full px-8 font-extrabold" style={{ animationDelay: `${(signDelay + 0.4).toFixed(2)}s` }}>
        Close the letter
      </button>
    </>
  );
}
