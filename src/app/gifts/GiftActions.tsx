"use client";

import { useMemo, useRef, useState } from "react";
import { PlayIcon } from "@/components/Icons";

export function LinkActions({ url, them }: { url: string; them: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const message = `${them}, I made something for you. Open it when you have a quiet minute: ${url}`;
  return (
    <div className="flex gap-2">
      <button type="button" onClick={copy} className="btn-sec h-11 flex-1 rounded-full text-sm font-extrabold">
        {copied ? "Copied" : "Copy link"}
      </button>
      <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="btn-cta flex h-11 flex-1 items-center justify-center rounded-full text-sm font-extrabold no-underline">
        WhatsApp
      </a>
    </div>
  );
}

/** A made-up but steady waveform, so each voice reply has its own shape. */
function waveform(seed: string, n: number) {
  let h = 2166136261;
  for (const ch of seed.split("?")[0]) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return Array.from({ length: n }, (_, i) => {
    h = Math.imul(h ^ (h >>> 15), 2246822507) ^ i;
    const swell = Math.sin((i / (n - 1)) * Math.PI);
    return Math.round(22 + 78 * (0.35 + 0.65 * swell) * (0.45 + 0.55 * ((h >>> 0) % 100) / 100));
  });
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, "0")}`;

export function VoicePlay({ src, seconds }: { src: string; seconds: number }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const bars = useMemo(() => waveform(src, 24), [src]);
  return (
    <div className="flex items-center gap-3">
      <audio
        ref={audio}
        src={src}
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
        }}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          // Recorded webm often reports an endless duration; the length we saved is the fallback.
          const total = Number.isFinite(a.duration) && a.duration > 0 ? a.duration : Math.max(1, seconds);
          setProgress(Math.min(1, a.currentTime / total));
        }}
      />
      <button
        type="button"
        onClick={() => (playing ? audio.current?.pause() : void audio.current?.play())}
        aria-label={playing ? "Pause the voice reply" : "Play the voice reply"}
        className="btn-cta flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
      >
        {playing ? (
          <span className="flex gap-1">
            <span className="h-3.5 w-1 rounded bg-current" />
            <span className="h-3.5 w-1 rounded bg-current" />
          </span>
        ) : (
          <PlayIcon size={14} />
        )}
      </button>
      <span className="flex h-8 min-w-0 flex-1 items-center gap-[2px] overflow-hidden" aria-hidden="true">
        {bars.map((h, i) => (
          <span key={i} className="w-[3px] shrink-0 rounded-full transition-colors duration-200" style={{ height: `${h}%`, background: (i + 0.5) / bars.length <= progress ? "var(--gold-text)" : "color-mix(in srgb, currentColor 22%, transparent)" }} />
        ))}
      </span>
      <span className="text-xs font-bold tabular-nums text-muted">{clock(playing || progress ? progress * seconds : seconds)}</span>
    </div>
  );
}
