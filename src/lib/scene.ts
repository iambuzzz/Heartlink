// Deterministic layouts for the firefly scenery. Seeded so server and client render identical markup.

export function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const f1 = (n: number) => Math.round(n * 10) / 10;
const f2 = (n: number) => Math.round(n * 100) / 100;

export type HeartDot = { x: number; y: number; s: number; dx: number; dy: number; gd: number; bd: number; bl: number };

// Fireflies on three nested heart curves, centred in a 260×190 box.
export function heartDots(seed = 20240214, cx = 130, cy = 95): HeartDot[] {
  const rand = rng(seed);
  const r = (a: number, b: number) => a + (b - a) * rand();
  const dots: HeartDot[] = [];
  const ring = (n: number, scale: number, smin: number, smax: number, phase: number) => {
    for (let q = 0; q < n; q++) {
      const t = phase + (q / n) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(t), 3);
      const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) - 2.5;
      const sz = r(smin, smax);
      dots.push({
        x: f1(cx + hx * scale - sz / 2),
        y: f1(cy + hy * scale - sz / 2),
        s: f1(sz),
        dx: f1(r(-150, 150)),
        dy: f1(r(-110, 110)),
        gd: f2(r(0, 1.3)),
        bd: f2(r(2.2, 4.6)),
        bl: f2(r(0, 3)),
      });
    }
  };
  ring(30, 5.6, 4.5, 7, 0);
  ring(17, 3.5, 3.5, 5.5, 0.18);
  ring(8, 1.6, 3, 4.5, 0.4);
  return dots;
}

export type Wanderer = {
  x: number; // percent of the layer
  y: number;
  s: number;
  ax: number; ay: number; bx: number; by: number; cx: number; cy: number;
  dur: number; delay: number; bd: number; bl: number;
};

export function wanderers(count: number, seed: number): Wanderer[] {
  const rand = rng(seed);
  const r = (a: number, b: number) => a + (b - a) * rand();
  return Array.from({ length: count }, (_, i) => ({
    // Keep more of them near the edges so they don't sit on top of text.
    x: f1(i % 3 === 0 ? r(2, 98) : i % 2 ? r(84, 98) : r(2, 16)),
    y: f1(r(3, 97)),
    s: f1(r(3, 6)),
    ax: f1(r(-40, 40)), ay: f1(r(-30, 30)),
    bx: f1(r(-50, 50)), by: f1(r(-40, 40)),
    cx: f1(r(-40, 40)), cy: f1(r(-30, 30)),
    dur: f1(r(14, 28)),
    delay: f1(-r(0, 24)),
    bd: f2(r(2, 5)),
    bl: f2(r(0, 4)),
  }));
}

export type Seed = { x: number; y: number; sx: number; sy: number; dur: number; delay: number; w: number; h: number };

export function dandelionSeeds(count: number, seed: number): Seed[] {
  const rand = rng(seed);
  const r = (a: number, b: number) => a + (b - a) * rand();
  return Array.from({ length: count }, () => {
    const sc = r(0.7, 1.15);
    return {
      x: f1(r(2, 90)),
      y: f1(r(5, 92)),
      sx: f1(r(50, 130)),
      sy: f1(r(-170, -70)),
      dur: f1(r(16, 26)),
      delay: f1(-r(0, 22)),
      w: f1(18 * sc),
      h: f1(28 * sc),
    };
  });
}

// Grass and fern silhouettes for a strip `width` wide and 80 tall. Ferns sit near the
// centre so the 390px slice a phone shows still has them.
export function meadow(width = 1440, seed = 7) {
  const rand = rng(seed);
  const r = (a: number, b: number) => a + (b - a) * rand();
  const B = 80;
  const blades = (n: number, hmin: number, hmax: number, w: number) => {
    let d = `M0 80L0 74L${width} 74L${width} 80Z`;
    for (let b = 0; b < n; b++) {
      const x0 = (b / n) * width + r(-3, 3);
      const h = r(hmin, hmax);
      const lean = r(-12, 12);
      d +=
        `M${f1(x0 - w / 2)} ${B}Q${f1(x0 + lean * 0.3 - w / 4)} ${f1(B - h * 0.55)} ${f1(x0 + lean)} ${f1(B - h)}` +
        `Q${f1(x0 + lean * 0.3 + w / 4)} ${f1(B - h * 0.55)} ${f1(x0 + w / 2)} ${B}Z`;
    }
    return d;
  };
  const fern = (bx: number, h: number, lean: number, scale: number) => {
    const p0x = bx, p0y = B, c0x = bx + lean * 0.15, c0y = B - h * 0.75, p1x = bx + lean, p1y = B - h;
    const stem = `M${bx} ${B}Q${f1(c0x)} ${f1(c0y)} ${f1(p1x)} ${f1(p1y)}`;
    let leaves = "";
    for (let t = 0.12; t < 0.97; t += 0.075) {
      const mt = 1 - t;
      const px = mt * mt * p0x + 2 * mt * t * c0x + t * t * p1x;
      const py = mt * mt * p0y + 2 * mt * t * c0y + t * t * p1y;
      let tx = 2 * mt * (c0x - p0x) + 2 * t * (p1x - c0x);
      let ty = 2 * mt * (c0y - p0y) + 2 * t * (p1y - c0y);
      const len = Math.hypot(tx, ty);
      tx /= len;
      ty /= len;
      const L = (14 * (1 - t) + 3) * scale;
      for (const side of [-1, 1]) {
        const nx = -ty * side, ny = tx * side;
        const qx = px + nx * L + tx * L * 0.35, qy = py + ny * L + ty * L * 0.35;
        const c1x = px + nx * L * 0.5 + tx * L * 0.5, c1y = py + ny * L * 0.5 + ty * L * 0.5;
        const c2x = px + nx * L * 0.55 - tx * L * 0.05, c2y = py + ny * L * 0.55 - ty * L * 0.05;
        leaves += `M${f1(px)} ${f1(py)}Q${f1(c1x)} ${f1(c1y)} ${f1(qx)} ${f1(qy)}Q${f1(c2x)} ${f1(c2y)} ${f1(px)} ${f1(py)}Z`;
      }
    }
    return { stem, leaves };
  };
  const c = width / 2;
  const ferns = [fern(c - 161, 70, 26, 1), fern(c + 163, 66, -24, 1), fern(c + 37, 40, 10, 0.7), fern(c - 520, 62, 20, 0.95), fern(c + 530, 58, -18, 0.9)];
  let puff = "";
  const puffball = (pcx: number, pcy: number, rad: number, n: number) => {
    for (let p = 0; p < n; p++) {
      const a = (p / n) * Math.PI * 2;
      puff += `M${f1(pcx + Math.cos(a) * 2.2)} ${f1(pcy + Math.sin(a) * 2.2)}L${f1(pcx + Math.cos(a) * rad)} ${f1(pcy + Math.sin(a) * rad)}`;
    }
  };
  puffball(c + 109, 30, 10, 18);
  puffball(c - 77, 46, 7, 13);
  return {
    width,
    back: blades(Math.round((64 * width) / 390), 22, 58, 6),
    front: blades(Math.round((44 * width) / 390), 12, 36, 5),
    fernStems: ferns.map((f) => f.stem).join(""),
    fernLeaves: ferns.map((f) => f.leaves).join(""),
    puff,
    puffStem: `M${c + 109} 80Q${c + 105} 56 ${c + 109} 38M${c - 77} 80Q${c - 74} 66 ${c - 77} 52`,
  };
}
