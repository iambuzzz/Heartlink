import type { CSSProperties } from "react";
import { meadow } from "@/lib/scene";
import { HeartCanvas, SkyCanvas } from "./glow-canvas";

// Custom properties aren't in CSSProperties; this keeps the casts in one place.
export const vars = (v: Record<string, string | number>) => v as CSSProperties;

const RAYS = [
  { x: 77, w: 90, d: 0, dur: 7 },
  { x: 61, w: 50, d: 2.5, dur: 9 },
  { x: 44, w: 70, d: 4.5, dur: 8 },
];

/** Fixed background: gradient, soft sun rays, and one canvas for fireflies, seeds and shooting stars. */
export function FireflySky() {
  return (
    <div className="sky" aria-hidden="true">
      <div className="sky-haze" />
      {RAYS.map((r, i) => (
        <span
          key={i}
          className="anim-ray"
          style={{ left: `${r.x}%`, top: -80, width: r.w, height: 640, transform: "rotate(24deg)", background: "linear-gradient(90deg, transparent, var(--ray), transparent)", animationDelay: `${r.d}s`, animationDuration: `${r.dur}s` }}
        />
      ))}
      <SkyCanvas />
    </div>
  );
}

/** Fireflies flying in and settling into a breathing heart (260×190). */
export function FireflyHeart({ label = "Fireflies gathering into a softly glowing heart" }: { label?: string }) {
  return (
    <div role="img" aria-label={label} className="relative h-[190px] w-[260px]">
      <div className="anim-halo absolute left-5 -top-1 h-[196px] w-[220px] rounded-full" style={{ background: "var(--halo)" }} />
      <HeartCanvas />
    </div>
  );
}

const MEADOW = meadow();

/** Grass, ferns and dandelion puffs; shows the centre slice on narrow screens. */
export function Meadow({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`relative h-[76px] overflow-hidden ${className}`} style={{ maskImage: "linear-gradient(180deg, #000 52%, transparent 100%)", WebkitMaskImage: "linear-gradient(180deg, #000 52%, transparent 100%)" }}>
      <svg className="absolute bottom-0 left-1/2 block -translate-x-1/2" width={MEADOW.width} height={80} viewBox={`0 0 ${MEADOW.width} 80`}>
        <path d={MEADOW.back} fill="var(--grass-back)" />
        <path d={MEADOW.puffStem} stroke="var(--grass-front)" strokeWidth={1.2} fill="none" />
        <g opacity={0.45}>
          <path d={MEADOW.puff} stroke="var(--puff)" strokeWidth={0.9} strokeLinecap="round" fill="none" />
        </g>
        <path d={MEADOW.puff} stroke="var(--puff)" strokeWidth={0.6} strokeLinecap="round" fill="none" opacity={0.7} />
        <g>
          <path d={MEADOW.front} fill="var(--grass-front)" />
        </g>
        <g>
          <path d={MEADOW.fernStems} stroke="var(--fern)" strokeWidth={1.6} strokeLinecap="round" fill="none" />
          <path d={MEADOW.fernLeaves} fill="var(--fern)" />
        </g>
      </svg>
    </div>
  );
}

const JAR_FLIES = [[32, 50], [56, 44], [74, 58], [44, 68], [64, 78], [28, 84], [52, 58], [78, 86], [40, 124], [66, 126]].map(([x, y], i) => ({
  x: x - 2.2,
  y: y - 2.2,
  s: 3.5 + ((i * 7) % 5) * 0.5,
  d: ((i * 13) % 30) / 10,
  dur: 2.2 + ((i * 11) % 20) / 10,
}));

/** A mason jar of fireflies with a handwritten label. */
export function MemoryJar({ label = "for Didi" }: { label?: string }) {
  return (
    <div className="anim-floaty relative h-[140px] w-[104px] shrink-0" aria-hidden="true">
      <div className="anim-halo absolute -left-1.5 top-[18px] h-[124px] w-[116px] rounded-full" style={{ background: "var(--jar-halo)" }} />
      <svg width={104} height={140} viewBox="0 0 104 140" className="absolute left-0 top-0">
        <defs>
          <linearGradient id="jar-glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--jar-a)" stopOpacity="var(--jar-a-o)" />
            <stop offset="0.5" stopColor="var(--jar-b)" stopOpacity="var(--jar-b-o)" />
            <stop offset="1" stopColor="var(--jar-a)" stopOpacity="var(--jar-a-o)" />
          </linearGradient>
        </defs>
        <path d="M33 23C33 29 14 30 14 46L14 122Q14 134 26 134L78 134Q90 134 90 122L90 46C90 30 71 29 71 23Z" fill="url(#jar-glass)" stroke="var(--jar-line)" strokeWidth={1.3} />
        <rect x={31} y={15} width={42} height={9} rx={2} fill="url(#jar-glass)" stroke="var(--jar-line)" strokeWidth={1.2} />
        <rect x={27} y={4} width={50} height={12} rx={3.5} fill="var(--lid)" stroke="var(--lid-line)" strokeWidth={1} />
        <path d="M34 7v6M41 7v6M48 7v6M55 7v6M62 7v6M69 7v6" stroke="var(--lid-line)" strokeWidth={0.9} strokeLinecap="round" />
        <path d="M30 20Q52 25 74 20" stroke="var(--twine)" strokeWidth={2} fill="none" strokeLinecap="round" />
        <path d="M71 21q6-7 10 0q-5 3-10 0M71 21q-1 7-5 11M72 21q4 6 4 12" stroke="var(--twine)" strokeWidth={1.3} fill="none" strokeLinecap="round" />
        <g transform="rotate(-4 52 104)">
          <rect x={27} y={92} width={50} height={24} rx={4} fill="var(--label)" />
          <text x={52} y={109} textAnchor="middle" fontFamily="var(--font-caveat), cursive" fontSize={15} fontWeight={600} fill="var(--label-ink)">
            {label}
          </text>
        </g>
        <path d="M21 52Q19 86 21 120" stroke="var(--hi)" strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <path d="M28 44Q26 48 26 53" stroke="var(--hi)" strokeWidth={2} strokeLinecap="round" fill="none" />
      </svg>
      {JAR_FLIES.map((j, i) => (
        <span key={i} className="firefly anim-blink absolute" style={{ left: j.x, top: j.y, width: j.s, height: j.s, animationDuration: `${j.dur}s`, animationDelay: `${j.d}s` }} />
      ))}
    </div>
  );
}
