"use client";

import { useEffect, useRef, useState } from "react";
import type { VoiceNote } from "@/lib/draft";
import { sound } from "@/lib/sound";
import { PlayIcon, ReplayIcon } from "../Icons";
import { vars } from "../scenery";

const INSIDE = [[34, 62], [58, 54], [76, 70], [46, 82], [66, 92], [30, 100], [54, 72], [80, 104], [42, 122], [68, 126]];
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s) % 60).padStart(2, "0")}`;

/** A jar of fireflies; lifting the lid lets them out and plays the sender's voice. */
export function VoiceJar({ note, you, onDone }: { note: VoiceNote; you: string; onDone: () => void }) {
  const [stage, setStage] = useState<"closed" | "open">("closed");
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const audio = useRef<HTMLAudioElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const time = useRef<HTMLSpanElement>(null);

  // Progress is drawn straight onto the DOM each frame, not through React state.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    const tick = () => {
      const a = audio.current;
      if (a) {
        const total = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : note.seconds;
        if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, a.currentTime / total)})`;
        if (time.current) time.current.textContent = `${clock(a.currentTime)} / ${clock(total)}`;
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    sound.duck(true);
    return () => {
      cancelAnimationFrame(raf);
      sound.duck(false);
    };
  }, [playing, note.seconds]);

  const open = () => {
    sound.chime("open");
    setStage("open");
    // Let the lid lift and the first fireflies escape before the voice starts.
    window.setTimeout(() => void audio.current?.play().catch(() => setPlaying(false)), 700);
  };
  const toggle = () => {
    const a = audio.current;
    if (!a) return;
    if (playing) a.pause();
    else {
      if (ended) a.currentTime = 0;
      setEnded(false);
      void a.play();
    }
  };

  return (
    <>
      <h1 className="font-display text-[26px] font-light leading-tight">{stage === "closed" ? `${you} caught something for you` : `A little voice from ${you}`}</h1>
      <p className="mt-1.5 text-[15px] text-muted">{stage === "closed" ? "Lift the lid. Turn your sound up." : "Listen closely."}</p>

      <audio
        ref={audio}
        src={note.src}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setEnded(true);
          if (bar.current) bar.current.style.transform = "scaleX(1)";
        }}
      />

      <button
        type="button"
        onClick={stage === "closed" ? open : toggle}
        aria-label={stage === "closed" ? "Open the jar" : playing ? "Pause the voice note" : "Play the voice note"}
        className={`voice-jar relative mt-6 h-[238px] w-[178px] ${stage === "open" ? "is-open" : "anim-floaty"} ${playing ? "is-playing" : ""}`}
      >
        <span className="voice-jar-halo absolute -inset-10 rounded-full" style={{ background: "var(--jar-halo)" }} aria-hidden="true" />
        <svg viewBox="0 0 104 140" width={178} height={238} className="absolute inset-0" aria-hidden="true">
          <defs>
            <linearGradient id="vjar-glass" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="var(--jar-a)" stopOpacity="var(--jar-a-o)" />
              <stop offset="0.5" stopColor="var(--jar-b)" stopOpacity="var(--jar-b-o)" />
              <stop offset="1" stopColor="var(--jar-a)" stopOpacity="var(--jar-a-o)" />
            </linearGradient>
          </defs>
          <path d="M33 23C33 29 14 30 14 46L14 122Q14 134 26 134L78 134Q90 134 90 122L90 46C90 30 71 29 71 23Z" fill="url(#vjar-glass)" stroke="var(--jar-line)" strokeWidth={1.3} />
          <rect x={31} y={15} width={42} height={9} rx={2} fill="url(#vjar-glass)" stroke="var(--jar-line)" strokeWidth={1.2} />
          <path d="M30 20Q52 25 74 20" stroke="var(--twine)" strokeWidth={2} fill="none" strokeLinecap="round" />
          <g transform="rotate(-4 52 104)">
            <rect x={20} y={94} width={64} height={23} rx={4} fill="var(--label)" />
            <text x={52} y={110} textAnchor="middle" fontFamily="var(--font-caveat), cursive" fontSize={13} fontWeight={600} fill="var(--label-ink)">
              {`from ${you}`.slice(0, 16)}
            </text>
          </g>
          <path d="M21 52Q19 86 21 120" stroke="var(--hi)" strokeWidth={3.5} strokeLinecap="round" fill="none" />
        </svg>
        <svg viewBox="0 0 104 140" width={178} height={238} className="voice-jar-lid absolute inset-0" aria-hidden="true">
          <rect x={27} y={4} width={50} height={12} rx={3.5} fill="var(--lid)" stroke="var(--lid-line)" strokeWidth={1} />
          <path d="M34 7v6M41 7v6M48 7v6M55 7v6M62 7v6M69 7v6" stroke="var(--lid-line)" strokeWidth={0.9} strokeLinecap="round" />
        </svg>
        {INSIDE.map(([x, y], i) => (
          <span
            key={i}
            className={`firefly absolute ${stage === "open" ? "" : "anim-blink"}`}
            style={vars({
              left: x * 1.71 - 3,
              top: y * 1.71 - 3,
              width: 6,
              height: 6,
              animationDuration: `${2.2 + (i % 5) * 0.4}s`,
              ...(stage === "open" ? { "--dx": `${(i % 2 ? 1 : -1) * (30 + i * 9)}px`, "--dy": `${-130 - i * 14}px`, animation: `burst 2.6s cubic-bezier(0.2,0.7,0.3,1) ${i * 0.08}s forwards` } : {}),
            })}
          />
        ))}
        {stage === "open" && (
          <span className="absolute left-1/2 top-[40%] flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[var(--on-cta)]" style={{ background: "var(--cta)", boxShadow: "var(--cta-glow)" }} aria-hidden="true">
            {playing ? (
              <span className="flex items-end gap-[3px]">
                {[0, 1, 2, 3].map((b) => (
                  <span key={b} className="voice-eq w-[4px] rounded-full bg-current" style={{ animationDelay: `${b * 0.15}s` }} />
                ))}
              </span>
            ) : ended ? (
              <ReplayIcon size={22} />
            ) : (
              <PlayIcon size={20} />
            )}
          </span>
        )}
      </button>

      <div className="mt-6 flex min-h-[92px] w-full max-w-[280px] flex-col items-center gap-2">
        {stage === "open" && (
          <>
            <span className="h-1.5 w-full overflow-hidden rounded-full bg-[var(--divider)]">
              <span ref={bar} className="block h-full w-full origin-left rounded-full bg-[var(--gold-text)]" style={{ transform: "scaleX(0)" }} />
            </span>
            <span ref={time} className="text-xs font-bold tabular-nums text-muted">
              0:00 / {clock(note.seconds)}
            </span>
            {ended && (
              <button type="button" onClick={onDone} className="btn-cta anim-rise mt-2 h-14 rounded-full px-8 font-extrabold">
                Keep going
              </button>
            )}
          </>
        )}
        {stage === "closed" && (
          <button type="button" onClick={onDone} className="text-sm font-bold text-muted underline underline-offset-4">
            Skip for now
          </button>
        )}
        {stage === "open" && !ended && (
          <button type="button" onClick={onDone} className="mt-1 text-sm font-bold text-muted underline underline-offset-4">
            Skip
          </button>
        )}
      </div>
    </>
  );
}
