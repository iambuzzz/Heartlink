"use client";

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

// The homepage shows a demo a couple of days out, so it reads like a real birthday countdown.
function demoTarget() {
  const target = new Date();
  target.setHours(24, 0, 0, 0);
  target.setDate(target.getDate() + 2);
  return target.getTime();
}

function split(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60];
}

const UNITS = ["days", "hrs", "min", "sec"];

/** Days/hours/minutes/seconds until `target` (epoch ms); calls onDone once when it reaches zero. */
export function Countdown({ target, onDone, large = false }: { target?: number; onDone?: () => void; large?: boolean }) {
  const [parts, setParts] = useState<number[] | null>(null);

  useEffect(() => {
    const goal = target ?? demoTarget();
    let fired = false;
    const tick = () => {
      const left = goal - Date.now();
      setParts(split(left));
      if (left <= 0 && !fired) {
        fired = true;
        onDone?.();
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target, onDone]);

  return (
    <div className="grid grid-cols-4 gap-2" role="timer" aria-label="Time until the gift opens">
      {UNITS.map((u, i) => (
        <div key={u} className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl border border-glass-line bg-cell ${large ? "h-[78px]" : "h-[62px]"}`}>
          <span className={`font-display leading-none text-num tabular-nums ${large ? "text-[32px]" : "text-2xl"}`}>{parts ? pad(parts[i]) : "--"}</span>
          <span className="text-[10.5px] font-bold uppercase tracking-[0.08em] text-muted">{u}</span>
        </div>
      ))}
    </div>
  );
}
