"use client";

import { useEffect, useRef } from "react";
import { dandelionSeeds, heartDots, wanderers } from "@/lib/scene";

// Fireflies drawn on one canvas each instead of ~100 animated DOM nodes: one layer for
// the compositor, a pre-rendered glow sprite, and nothing runs while off screen.

type Theme = "light" | "dark";
const PALETTE: Record<Theme, { core: string; glow: string; fly: number }> = {
  light: { core: "#f2b83a", glow: "250, 200, 90", fly: 0.9 },
  dark: { core: "#fbefa0", glow: "222, 236, 120", fly: 1 },
};

const sprites = new Map<Theme, HTMLCanvasElement>();
function glowSprite(theme: Theme) {
  let s = sprites.get(theme);
  if (s) return s;
  const { core, glow } = PALETTE[theme];
  s = document.createElement("canvas");
  s.width = s.height = 64;
  const g = s.getContext("2d")!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "#fffbe6");
  grad.addColorStop(0.12, core);
  grad.addColorStop(0.24, `rgba(${glow}, 0.8)`);
  grad.addColorStop(0.5, `rgba(${glow}, 0.22)`);
  grad.addColorStop(1, `rgba(${glow}, 0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  sprites.set(theme, s);
  return s;
}

const currentTheme = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
const blink = (t: number, period: number, phase: number) => {
  const p = Math.max(0, Math.sin(((t / period + phase) % 1) * Math.PI * 2));
  return 0.18 + 0.82 * p * p;
};

type Draw = (ctx: CanvasRenderingContext2D, t: number, w: number, h: number, theme: Theme) => void;

/** Sizes the canvas to its box, runs draw() each frame while visible, and redraws on theme change. */
function useCanvas(draw: Draw, { fps = 60 } = {}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;
    let theme = currentTheme();
    let visible = true;
    let raf = 0;
    let last = 0;
    const t0 = performance.now();

    const frame = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      if (!still) raf = requestAnimationFrame(frame);
      if (!still && now - last < 1000 / fps - 2) return;
      last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      draw(ctx, still ? 60 : (now - t0) / 1000, w, h, theme);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const resize = () => {
      const r = canvas.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      last = 0;
      kick();
    };

    const sizeObs = new ResizeObserver(resize);
    sizeObs.observe(canvas);
    const viewObs = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) kick();
    });
    viewObs.observe(canvas);
    const themeObs = new MutationObserver(() => {
      theme = currentTheme();
      last = 0;
      kick();
    });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    document.addEventListener("visibilitychange", kick);
    resize();
    return () => {
      cancelAnimationFrame(raf);
      sizeObs.disconnect();
      viewObs.disconnect();
      themeObs.disconnect();
      document.removeEventListener("visibilitychange", kick);
    };
    // draw is module-level per component; it never changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return ref;
}

const SKY_FLIES = wanderers(22, 11).map((f, i) => ({ ...f, p1: i * 1.7, p2: i * 0.9 }));
const SKY_SEEDS = dandelionSeeds(7, 23);
const STARS = [
  { x: 0.88, y: 0.03, d: 1.2, dur: 9 },
  { x: 0.66, y: 0.12, d: 5, dur: 11 },
  { x: 0.98, y: 0.22, d: 8.5, dur: 13 },
];
const SEED_PATH = "M9 26V11 M9 11 2 4 M9 11 4.6 1.8 M9 11V1 M9 11 13.4 1.8 M9 11 16 4 M9 11 1 8 M9 11 17 8";
let seedPath: Path2D | null = null;

const drawSky: Draw = (ctx, t, w, h, theme) => {
  const sprite = glowSprite(theme);
  ctx.globalAlpha = 1;
  if (theme === "dark") {
    for (const s of STARS) {
      const p = ((t + s.dur - s.d) % s.dur) / s.dur;
      if (p > 0.14) continue;
      const k = p / 0.14;
      const x = s.x * w - 240 * k;
      const y = s.y * h + 129 * k;
      const a = k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8;
      const grad = ctx.createLinearGradient(x, y, x + 97, y - 52);
      grad.addColorStop(0, `rgba(255, 250, 215, ${0.95 * a})`);
      grad.addColorStop(1, "rgba(255, 250, 215, 0)");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 97, y - 52);
      ctx.stroke();
    }
  } else {
    seedPath ??= new Path2D(SEED_PATH);
    ctx.strokeStyle = "#86977f";
    ctx.lineWidth = 0.8;
    for (const d of SKY_SEEDS) {
      const p = ((t - d.delay) % d.dur) / d.dur;
      const a = p < 0.12 ? p / 0.12 : p > 0.88 ? (1 - p) / 0.12 : 0.92;
      ctx.globalAlpha = a;
      ctx.save();
      ctx.translate((d.x / 100) * w + d.sx * p, (d.y / 100) * h + d.sy * p - 16 * Math.sin(p * Math.PI));
      ctx.rotate(((16 * Math.sin(p * Math.PI * 2)) * Math.PI) / 180);
      ctx.scale(d.w / 18, d.h / 28);
      ctx.stroke(seedPath);
      ctx.restore();
    }
  }
  const op = PALETTE[theme].fly;
  for (const f of SKY_FLIES) {
    const k = (Math.PI * 2 * (t - f.delay)) / f.dur;
    const x = (f.x / 100) * w + f.ax * Math.sin(k + f.p1) + f.bx * 0.5 * Math.sin(k * 0.6 + f.p2);
    const y = (f.y / 100) * h + f.ay * Math.sin(k * 0.8 + f.p2) + f.by * 0.5 * Math.cos(k * 0.5 + f.p1);
    const size = f.s * 4;
    ctx.globalAlpha = op * blink(t, f.bd, f.bl / f.bd);
    ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
  }
  ctx.globalAlpha = 1;
};

/** The ambient fireflies, seeds and shooting stars behind every page. */
export function SkyCanvas() {
  const ref = useCanvas(drawSky, { fps: 30 });
  return <canvas ref={ref} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}

const HEART = heartDots();
const PAD = 70;
const easeOut = (p: number) => 1 - (1 - p) ** 3;

const drawHeart: Draw = (ctx, t, _w, _h, theme) => {
  const sprite = glowSprite(theme);
  // A slow breath, centred like the old CSS transform-origin (50% 55%).
  const breath = 1 + 0.025 * (1 - Math.cos((t / 5) * Math.PI * 2));
  const cx = PAD + 130;
  const cy = PAD + 104.5;
  for (const d of HEART) {
    const p = easeOut(Math.min(1, Math.max(0, (t - d.gd) / 2.8)));
    const scale = 0.5 + 0.5 * p;
    const x = PAD + d.x + d.s / 2 + d.dx * (1 - p);
    const y = PAD + d.y + d.s / 2 + d.dy * (1 - p);
    const size = d.s * 4 * scale;
    ctx.globalAlpha = Math.min(1, p * 1.6) * blink(t, d.bd, d.bl / d.bd);
    ctx.drawImage(sprite, cx + (x - cx) * breath - size / 2, cy + (y - cy) * breath - size / 2, size, size);
  }
  ctx.globalAlpha = 1;
};

/** Fireflies flying in and settling into a breathing heart; occupies a 260×190 box. */
export function HeartCanvas() {
  const ref = useCanvas(drawHeart);
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none absolute" style={{ left: -PAD, top: -PAD, width: 260 + PAD * 2, height: 190 + PAD * 2 }} />;
}
