"use client";

import { useRef, useState } from "react";
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

export function VoicePlay({ src, seconds }: { src: string; seconds: number }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  return (
    <div className="mt-1 flex items-center gap-3">
      <audio ref={audio} src={src} preload="none" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
      <button
        type="button"
        onClick={() => (playing ? audio.current?.pause() : void audio.current?.play())}
        aria-label={playing ? "Pause the voice reply" : "Play the voice reply"}
        className="flex h-10 w-10 items-center justify-center rounded-full text-white"
        style={{ background: "var(--heart)" }}
      >
        {playing ? <span className="flex gap-1"><span className="h-3.5 w-1 rounded bg-current" /><span className="h-3.5 w-1 rounded bg-current" /></span> : <PlayIcon size={14} />}
      </button>
      <span className="text-sm font-bold">Voice reply · {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</span>
    </div>
  );
}
