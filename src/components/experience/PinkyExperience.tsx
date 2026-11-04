"use client";

import { useEffect, useRef, useState } from "react";
import { sound } from "@/lib/sound";
import type { GiftContent } from "@/lib/templates/types";
import { HeartIcon } from "../Icons";
import { Story } from "./Story";

export function PinkyExperience({ content, preview = false, slug }: { content: GiftContent; preview?: boolean; slug?: string }) {
  const v = content.values;
  const promises = (Array.isArray(v.promises) ? (v.promises as string[]) : []).filter((p) => p.trim());
  const note = typeof v.note === "string" ? v.note.trim() : "";
  return (
    <Story
      content={content}
      preview={preview}
      slug={slug}
      scenes={["swear", "promises"]}
      renderScene={(scene, next) => (
        <>
          {scene === "swear" && <Swear them={content.them} you={content.you} onDone={next} />}
          {scene === "promises" && <Promises promises={promises} note={note} them={content.them} you={content.you} onDone={next} />}
        </>
      )}
    />
  );
}

/** A hand with its little finger out, facing right. The other hand is this one mirrored. */
function Hand({ tone, sleeve, flip }: { tone: string; sleeve: string; flip?: boolean }) {
  return (
    <svg viewBox="0 0 120 90" width={120} height={90} style={{ transform: flip ? "scaleX(-1)" : undefined }} aria-hidden="true">
      {/* sleeve, fist, thumb on top, curled finger knuckles, then the little finger reaching out */}
      <rect x={-4} y={36} width={26} height={34} rx={6} fill={sleeve} />
      <rect x={16} y={30} width={52} height={44} rx={20} fill={tone} />
      <ellipse cx={46} cy={31} rx={17} ry={8} fill={tone} stroke="rgba(0,0,0,0.12)" strokeWidth={1.5} />
      {[42, 52, 62].map((y) => (
        <circle key={y} cx={66} cy={y} r={6.5} fill={tone} stroke="rgba(0,0,0,0.12)" strokeWidth={1.5} />
      ))}
      <path d="M62 69 C80 72 94 66 97 53" stroke={tone} strokeWidth={9} fill="none" strokeLinecap="round" />
    </svg>
  );
}

function Swear({ them, you, onDone }: { them: string; you: string; onDone: () => void }) {
  const [holding, setHolding] = useState(false);
  const [sworn, setSworn] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const begin = () => {
    if (sworn) return;
    setHolding(true);
    navigator.vibrate?.([40, 80, 40]);
    timer.current = window.setTimeout(() => {
      setHolding(false);
      setSworn(true);
      navigator.vibrate?.([30, 60, 120]);
      sound.chime("hug");
    }, 1800);
  };
  const end = () => {
    if (sworn) return;
    window.clearTimeout(timer.current);
    setHolding(false);
  };

  const hooked = holding || sworn;
  return (
    <>
      <h1 className="font-display text-[28px] font-light leading-tight">{sworn ? "Sworn. No take-backs." : `${you} wants to make you some promises`}</h1>
      <p className="mt-1.5 text-[15px] text-muted">{sworn ? `${them} and ${you}, pinky-linked.` : "But first, a pinky swear."}</p>
      <div className={`pinky-stage relative mt-10 h-[110px] w-[300px] ${hooked ? "is-hooked" : ""} ${sworn ? "is-sworn" : ""}`}>
        <span className="pinky-left absolute left-0 top-2">
          <Hand tone="#f1c49b" sleeve="#e7b43c" />
        </span>
        <span className="pinky-right absolute right-0 top-2">
          <Hand tone="#c98d62" sleeve="#7fb6d9" flip />
        </span>
        {sworn && (
          <span className="pinky-heart absolute left-1/2 top-[-34px] -translate-x-1/2" style={{ color: "var(--heart)" }} aria-hidden="true">
            <HeartIcon size={34} />
          </span>
        )}
      </div>
      {sworn ? (
        <button type="button" onClick={onDone} className="btn-cta anim-rise mt-12 h-14 rounded-full px-8 font-extrabold">
          Read the promises
        </button>
      ) : (
        <button
          type="button"
          onPointerDown={begin}
          onPointerUp={end}
          onPointerLeave={end}
          onPointerCancel={end}
          onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !e.repeat && begin()}
          onKeyUp={end}
          onContextMenu={(e) => e.preventDefault()}
          className={`btn-cta mt-12 h-16 w-full select-none rounded-full font-extrabold transition-transform ${holding ? "scale-95" : ""}`}
          style={{ touchAction: "none" }}
        >
          {holding ? "Hold… hold…" : "Hold to pinky swear"}
        </button>
      )}
    </>
  );
}

function Promises({ promises, note, them, you, onDone }: { promises: string[]; note: string; them: string; you: string; onDone: () => void }) {
  const today = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const initials = (you.trim()[0] ?? "♥").toUpperCase();
  return (
    <>
      <div className="anim-letter relative w-full rounded-[18px] px-6 pb-8 pt-6 text-left shadow-[var(--glow)]" style={{ background: "var(--paper)", color: "var(--paper-ink)" }}>
        <p className="text-center text-[11px] font-extrabold uppercase tracking-[0.2em] opacity-60">Pinky promises</p>
        <p className="text-center font-hand text-[26px] leading-tight">from {you} to {them}</p>
        <ol className="mt-4 flex flex-col gap-3">
          {promises.map((p, i) => (
            <li key={i} className="ink-in flex gap-3" style={{ animationDelay: `${0.3 + i * 0.5}s` }}>
              <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full" style={{ background: "#e7b43c", boxShadow: "0 0 8px 2px rgba(231,180,60,0.6)" }} aria-hidden="true" />
              <span className="font-hand text-[23px] leading-snug">{p}</span>
            </li>
          ))}
        </ol>
        {note && (
          <p className="ink-in mt-5 font-hand text-[22px] italic leading-snug" style={{ animationDelay: `${0.3 + promises.length * 0.5}s` }}>
            {note}
          </p>
        )}
        <div className="ink-in mt-6 flex items-end justify-between" style={{ animationDelay: `${0.6 + promises.length * 0.5}s` }}>
          <div>
            <p className="font-hand text-[26px] leading-none">{you}</p>
            <p className="mt-1 text-xs opacity-60">Sworn on {today}</p>
          </div>
          <span className="flex h-14 w-14 rotate-[-8deg] items-center justify-center rounded-full font-display text-xl text-white" style={{ background: "radial-gradient(circle at 35% 30%, #e0655a, #a8342c)", boxShadow: "0 3px 8px rgba(120,30,20,0.35), inset 0 0 0 3px rgba(255,255,255,0.15)" }} aria-label="Wax seal">
            {initials}
          </span>
        </div>
      </div>
      <button type="button" onClick={onDone} className="btn-cta ink-in mt-6 h-14 rounded-full px-8 font-extrabold" style={{ animationDelay: `${1 + promises.length * 0.5}s` }}>
        I&apos;ll hold you to it
      </button>
    </>
  );
}
