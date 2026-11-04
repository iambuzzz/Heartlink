"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ordinal } from "@/lib/relations";
import { rng } from "@/lib/scene";
import { sound } from "@/lib/sound";
import { useBlowDetector } from "@/lib/useBlowDetector";
import { ArrowRightIcon, MicIcon } from "../Icons";
import { vars } from "../scenery";

type Flavour = { side: [string, string, string, string]; drip: string; dripHi: string; pearl: string; fruit: string; candle: [string, string] };

const FLAVOURS: Record<string, Flavour> = {
  chocolate: { side: ["#4a2919", "#a46d47", "#7d4c2f", "#3c2013"], drip: "#3a1f12", dripHi: "#8a5a3c", pearl: "#f6e7cf", fruit: "#c81d3a", candle: ["#ffe08a", "#e8902c"] },
  strawberry: { side: ["#d8728f", "#ffe3ea", "#f7bccb", "#cc6482"], drip: "#df3f6a", dripHi: "#ff9dbb", pearl: "#ffffff", fruit: "#d81f48", candle: ["#ffe08a", "#e8902c"] },
  mango: { side: ["#e39a2e", "#ffeab2", "#ffd27a", "#d88b22"], drip: "#ff9419", dripHi: "#ffd08a", pearl: "#fffaf0", fruit: "#e8541c", candle: ["#ffc2d8", "#e2507f"] },
};
const SPRINKLES = ["#ff6f91", "#ffd166", "#6fd3ff", "#b388ff", "#7ee081", "#ffffff"];

// Geometry, in the 260×250 SVG box (1 unit = 1 css px).
const CX = 130;
const BOTTOM = { top: 158, rx: 96, ry: 18, h: 62 };
const TOP = { top: 104, rx: 62, ry: 12, h: 54 };

type Tier = typeof BOTTOM;
const front = (t: Tier, u: number, dy = 0) => {
  const a = Math.PI * (1 - u);
  return [CX + t.rx * Math.cos(a), t.top + dy + t.ry * Math.sin(a)] as const;
};

/** Frosting that covers the tier's top and runs down the front in rounded drips. */
function dripPath(t: Tier, seed: number) {
  const rand = rng(seed);
  const n = Math.round(t.rx / 10);
  let d = `M${CX - t.rx} ${t.top}`;
  for (let j = 0; j < n; j++) {
    const [ax, ay] = front(t, (j + 0.3) / n, 3);
    const [bx, by] = front(t, (j + 0.7) / n, 3);
    const [ex, ey] = front(t, (j + 1) / n, 3);
    const len = 6 + rand() * t.h * 0.5;
    const bottom = Math.max(ay, by) + len;
    const r = (bx - ax) / 2;
    d += `L${ax.toFixed(1)} ${ay.toFixed(1)}L${ax.toFixed(1)} ${bottom.toFixed(1)}A${r.toFixed(1)} ${r.toFixed(1)} 0 0 0 ${bx.toFixed(1)} ${bottom.toFixed(1)}L${bx.toFixed(1)} ${by.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`;
  }
  return `${d}L${CX + t.rx} ${t.top}A${t.rx} ${t.ry} 0 0 0 ${CX - t.rx} ${t.top}Z`;
}

function dripTips(t: Tier, seed: number) {
  const rand = rng(seed);
  const n = Math.round(t.rx / 10);
  return Array.from({ length: n }, (_, j) => {
    const [ax, ay] = front(t, (j + 0.3) / n, 3);
    const [bx, by] = front(t, (j + 0.7) / n, 3);
    const len = 6 + rand() * t.h * 0.5;
    return { x: (ax + bx) / 2, y: Math.max(ay, by) + len, r: (bx - ax) / 2 };
  });
}

const pearls = (t: Tier, count: number) => Array.from({ length: count }, (_, i) => front(t, (i + 0.5) / count, t.h));

function TierShape({ t, f, id, seed }: { t: Tier; f: Flavour; id: string; seed: number }) {
  return (
    <g>
      <path d={`M${CX - t.rx} ${t.top}L${CX - t.rx} ${t.top + t.h}A${t.rx} ${t.ry} 0 0 0 ${CX + t.rx} ${t.top + t.h}L${CX + t.rx} ${t.top}Z`} fill={`url(#${id}-side)`} />
      <path d={dripPath(t, seed)} fill={f.drip} />
      {dripTips(t, seed).map((d, i) => (
        <ellipse key={i} cx={d.x - d.r * 0.25} cy={d.y - d.r * 0.55} rx={d.r * 0.32} ry={d.r * 0.45} fill={f.dripHi} opacity={0.55} />
      ))}
      <ellipse cx={CX} cy={t.top} rx={t.rx - 1} ry={t.ry - 0.5} fill={f.drip} />
      <ellipse cx={CX - t.rx * 0.25} cy={t.top - t.ry * 0.25} rx={t.rx * 0.5} ry={t.ry * 0.4} fill="url(#gloss)" />
      {pearls(t, Math.round(t.rx / 6)).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y - 2} r={4.4} fill="url(#pearl)" />
      ))}
    </g>
  );
}

function Cherry({ x, y, color }: { x: number; y: number; color: string }) {
  return (
    <g>
      <path d={`M${x} ${y - 6}q2-9 9-12`} stroke="#4f6b2a" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <circle cx={x} cy={y} r={7.5} fill={color} />
      <circle cx={x - 2.6} cy={y - 2.6} r={2.2} fill="#fff" opacity={0.7} />
    </g>
  );
}

type Candle = { x: number; wickY: number; digit?: string };

function candlesFor(age?: number): Candle[] {
  if (age && age > 0 && age < 100) {
    const digits = String(age).split("");
    return digits.map((digit, i) => ({
      digit,
      x: CX + (i - (digits.length - 1) / 2) * 44,
      wickY: TOP.top - 46,
    }));
  }
  return [CX - 26, CX, CX + 26].map((x) => ({ x, wickY: TOP.top - 38 }));
}

function CakeArt({ f, candles, lit }: { f: Flavour; candles: Candle[]; lit: boolean }) {
  const sprinkles = useMemo(() => {
    const rand = rng(7);
    return Array.from({ length: 22 }, () => {
      const a = rand() * Math.PI * 2;
      const r = 0.45 + rand() * 0.45;
      return {
        x: CX + Math.cos(a) * (TOP.rx - 8) * r,
        y: TOP.top + Math.sin(a) * (TOP.ry - 2) * r,
        rot: rand() * 180,
        c: SPRINKLES[Math.floor(rand() * SPRINKLES.length)],
      };
    });
  }, []);
  return (
    <svg viewBox="0 0 260 250" width={260} height={250} className="absolute inset-0" aria-hidden="true">
      <defs>
        {(["b", "t"] as const).map((id) => (
          <linearGradient key={id} id={`${id}-side`} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor={f.side[0]} />
            <stop offset="0.28" stopColor={f.side[1]} />
            <stop offset="0.6" stopColor={f.side[2]} />
            <stop offset="1" stopColor={f.side[3]} />
          </linearGradient>
        ))}
        <radialGradient id="pearl" cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.5" stopColor={f.pearl} />
          <stop offset="1" stopColor={f.pearl} stopOpacity={0.75} />
        </radialGradient>
        <radialGradient id="gloss">
          <stop offset="0" stopColor="#fff" stopOpacity={0.35} />
          <stop offset="1" stopColor="#fff" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="plate" cx="0.5" cy="0.4" r="0.6">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.7" stopColor="#ece6da" />
          <stop offset="1" stopColor="#cfc6b4" />
        </radialGradient>
        <radialGradient id="warm">
          <stop offset="0" stopColor="#ffcf7a" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffcf7a" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="num" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={f.candle[0]} />
          <stop offset="1" stopColor={f.candle[1]} />
        </linearGradient>
        <pattern id="stripes" width={8} height={8} patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width={8} height={8} fill="#fff6e6" />
          <rect width={3.5} height={8} fill="#ff8fab" />
        </pattern>
        <linearGradient id="shade" x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity={0.18} />
          <stop offset="0.35" stopColor="#fff" stopOpacity={0.35} />
          <stop offset="1" stopColor="#000" stopOpacity={0.22} />
        </linearGradient>
      </defs>

      <ellipse cx={CX} cy={232} rx={124} ry={15} fill="#000" opacity={0.18} />
      <ellipse cx={CX} cy={224} rx={122} ry={18} fill="url(#plate)" />
      <TierShape t={BOTTOM} f={f} id="b" seed={3} />
      <Cherry x={CX - 78} y={BOTTOM.top + 2} color={f.fruit} />
      <Cherry x={CX + 80} y={BOTTOM.top + 4} color={f.fruit} />
      <TierShape t={TOP} f={f} id="t" seed={9} />
      {sprinkles.map((s, i) => (
        <rect key={i} x={s.x - 2.5} y={s.y - 0.9} width={5} height={1.8} rx={0.9} fill={s.c} transform={`rotate(${s.rot.toFixed(0)} ${s.x.toFixed(1)} ${s.y.toFixed(1)})`} />
      ))}
      <ellipse cx={CX} cy={TOP.top - 2} rx={TOP.rx + 30} ry={TOP.ry + 30} fill="url(#warm)" style={{ opacity: lit ? 1 : 0, transition: "opacity 0.8s" }} />

      {candles.map((c) =>
        c.digit ? (
          <g key={c.x}>
            <text
              x={c.x}
              y={TOP.top + 6}
              textAnchor="middle"
              fontFamily="var(--font-outfit), sans-serif"
              fontWeight={600}
              fontSize={64}
              fill="url(#num)"
              stroke="#fffaf0"
              strokeWidth={3.5}
              strokeLinejoin="round"
              paintOrder="stroke"
            >
              {c.digit}
            </text>
            <line x1={c.x} y1={c.wickY + 8} x2={c.x} y2={c.wickY} stroke="#3b2a1a" strokeWidth={1.6} strokeLinecap="round" />
          </g>
        ) : (
          <g key={c.x}>
            <rect x={c.x - 4.5} y={c.wickY + 6} width={9} height={TOP.top - c.wickY - 4} rx={2} fill="url(#stripes)" />
            <rect x={c.x - 4.5} y={c.wickY + 6} width={9} height={TOP.top - c.wickY - 4} rx={2} fill="url(#shade)" />
            <line x1={c.x} y1={c.wickY + 7} x2={c.x} y2={c.wickY} stroke="#3b2a1a" strokeWidth={1.4} strokeLinecap="round" />
          </g>
        ),
      )}
    </svg>
  );
}

const CONFETTI = (() => {
  const rand = rng(42);
  const colors = ["#ff6f91", "#ffd166", "#6fd3ff", "#b388ff", "#7ee081", "#ff9f43"];
  return Array.from({ length: 28 }, () => ({
    left: `${(rand() * 100).toFixed(1)}%`,
    c: colors[Math.floor(rand() * colors.length)],
    cx: `${((rand() - 0.5) * 120).toFixed(0)}px`,
    rot: `${(360 + rand() * 720).toFixed(0)}deg`,
    dur: `${(2.6 + rand() * 1.8).toFixed(2)}s`,
    delay: `${(rand() * 0.6).toFixed(2)}s`,
    w: rand() > 0.5 ? 7 : 5,
  }));
})();

type Stage = "unlit" | "lit" | "blown";

export function Cake({ them, age, flavour, onDone }: { them: string; age?: number; flavour: string; onDone: () => void }) {
  const f = FLAVOURS[flavour] ?? FLAVOURS.chocolate;
  const candles = useMemo(() => candlesFor(age), [age]);
  const [stage, setStage] = useState<Stage>("unlit");
  const [out, setOut] = useState<number[]>([]);
  const box = useRef<HTMLDivElement>(null);
  const meter = useRef<HTMLSpanElement>(null);
  const energy = useRef(0);
  const lastFrame = useRef(0);
  const outRef = useRef<number[]>([]);

  const setLean = (lean: number) => box.current?.style.setProperty("--lean", lean.toFixed(3));

  const putOut = (i: number) => {
    if (outRef.current.includes(i)) return;
    outRef.current = [...outRef.current, i];
    setOut(outRef.current);
    if (outRef.current.length === candles.length) {
      window.setTimeout(() => {
        setLean(0);
        setStage("blown");
        sound.chime("blow");
      }, 450);
    }
  };

  // Each frame of blowing adds energy; candles go out one by one as it builds, so a
  // gentle, long blow works as well as a short, strong one.
  const onLevel = (level: number) => {
    const now = performance.now();
    const dt = lastFrame.current ? Math.min(0.1, (now - lastFrame.current) / 1000) : 0;
    lastFrame.current = now;
    energy.current = Math.max(0, energy.current + (level > 0 ? level * dt : -0.15 * dt));
    setLean(Math.min(1, level * 1.2));
    if (meter.current) meter.current.style.transform = `scaleX(${Math.max(0.04, level)})`;
    const needed = 0.32;
    const count = Math.min(candles.length, Math.floor(energy.current / needed));
    for (let i = 0; i < count; i++) putOut(i);
  };
  const mic = useBlowDetector(onLevel);
  const stopMic = mic.stop;
  const allOut = out.length === candles.length;
  useEffect(() => {
    if (allOut) stopMic();
  }, [allOut, stopMic]);

  // The music would trip the mic, so it steps aside while the mic listens.
  useEffect(() => {
    if (mic.state !== "listening" || allOut) return;
    sound.duck(true);
    return () => sound.duck(false);
  }, [mic.state, allOut]);

  const tapBlow = () => {
    sound.whoosh();
    const startAt = performance.now();
    const step = (now: number) => {
      const t = (now - startAt) / 1000;
      setLean(Math.min(0.95, t * 2.4) * (0.85 + 0.15 * Math.sin(t * 40)));
      candles.forEach((_, i) => t > 0.35 + i * 0.18 && putOut(i));
      if (outRef.current.length < candles.length) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  return (
    <>
      {/* Two lines tall at every stage, so the cake never jumps when the text changes. */}
      <div className="flex min-h-[70px] items-center justify-center">
        <h1 className="font-display text-[28px] font-light leading-tight">
          {stage === "blown" ? (
            <>
              Happy {age ? `${ordinal(age)} ` : ""}birthday, <span className="text-shine font-medium">{them}</span>
            </>
          ) : stage === "lit" ? (
            "Close your eyes. Make a wish."
          ) : (
            "A cake, just for you"
          )}
        </h1>
      </div>

      <div ref={box} className="relative mt-4 h-[250px] w-[260px]" style={vars({ "--lean": 0 })}>
        <CakeArt f={f} candles={candles} lit={stage !== "unlit" && !allOut} />
        {stage !== "unlit" &&
          candles.map((c, i) => (
            <span key={c.x} className={`flame ${out.includes(i) ? "out" : ""}`} style={{ left: c.x, top: c.wickY }}>
              <span className="flame-lean" style={vars({ "--k": 0.85 + ((i * 37) % 30) / 100 })}>
                <span className="flame-in" style={{ animationDelay: `${i * 0.18}s` }}>
                  <span className="flame-glow" />
                  <span className="flame-body" style={{ animationDelay: `${i * 0.13}s` }} />
                </span>
              </span>
              {out.includes(i) &&
                [0, 1, 2, 3, 4].map((p) => <span key={p} className="smoke-puff" style={vars({ "--sx": `${(p % 2 ? -1 : 1) * (6 + p * 5)}px`, animationDelay: `${p * 0.16}s` })} />)}
            </span>
          ))}
        {stage === "blown" &&
          candles.map((c, ci) =>
            Array.from({ length: 6 }, (_, i) => (
              <span
                key={`${ci}-${i}`}
                className="firefly absolute h-[6px] w-[6px]"
                style={vars({
                  left: c.x - 3,
                  top: c.wickY - 6,
                  "--dx": `${Math.cos(i * 1.1 + ci) * 110}px`,
                  "--dy": `${-50 - ((i * 37 + ci * 23) % 110)}px`,
                  animation: `burst 2.4s cubic-bezier(0.2,0.7,0.3,1) ${i * 0.07}s forwards`,
                })}
              />
            )),
          )}
      </div>

      {stage === "blown" && (
        <div className="pointer-events-none fixed inset-0 z-20 overflow-hidden" aria-hidden="true">
          {CONFETTI.map((p, i) => (
            <span
              key={i}
              className="confetti"
              style={vars({
                left: p.left,
                width: p.w,
                background: p.c,
                "--cx": p.cx,
                "--rot": p.rot,
                "--dur": p.dur,
                "--delay": p.delay,
              })}
            />
          ))}
        </div>
      )}

      <div className="flex min-h-[132px] flex-col items-center">
        {stage === "unlit" && (
          <button
            type="button"
            onClick={() => {
              sound.chime("found");
              setStage("lit");
            }}
            className="btn-cta mt-4 h-14 rounded-full px-8 font-extrabold"
          >
            Light the candles
          </button>
        )}
        {stage === "lit" && !allOut && (
          <div className="mt-4 flex flex-col items-center gap-3">
            {mic.state === "listening" ? (
              <div className="flex flex-col items-center gap-2" aria-live="polite">
                <p className="flex items-center gap-2 font-display text-lg">
                  <MicIcon size={20} /> Blow at your phone…
                </p>
                <span className="h-1.5 w-40 overflow-hidden rounded-full bg-[var(--divider)]">
                  <span ref={meter} className="block h-full w-full origin-left rounded-full bg-[var(--gold-text)] transition-transform duration-75" style={{ transform: "scaleX(0.04)" }} />
                </span>
              </div>
            ) : (
              <button type="button" onClick={mic.start} disabled={mic.state === "asking"} className="btn-cta flex h-14 items-center gap-2 rounded-full px-8 font-extrabold">
                <MicIcon size={18} /> {mic.state === "asking" ? "Allow the mic…" : "Blow for real"}
              </button>
            )}
            {(mic.state === "denied" || mic.state === "unsupported") && <p className="text-sm text-muted">No mic? No problem. Tap below.</p>}
            <button type="button" onClick={tapBlow} className="text-sm font-bold text-muted underline underline-offset-4">
              or tap to blow them out
            </button>
          </div>
        )}
        {stage === "blown" && (
          <button type="button" onClick={onDone} className="btn-sec mt-4 inline-flex h-12 items-center gap-2 rounded-full px-6 font-bold">
            There&apos;s more <ArrowRightIcon size={16} />
          </button>
        )}
      </div>
    </>
  );
}
