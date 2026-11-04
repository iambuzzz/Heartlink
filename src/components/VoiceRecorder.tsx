"use client";

import { useEffect, useRef, useState } from "react";
import type { VoiceNote } from "@/lib/draft";
import { MicIcon, PlayIcon, ReplayIcon } from "./Icons";
// AAC in MP4 plays everywhere; WebM/Opus is the fallback for browsers that can't record MP4.
const VOICE_TYPES = ["audio/mp4;codecs=mp4a.40.2", "audio/mp4", "audio/webm;codecs=opus", "audio/webm"];
const BARS = 28;

/** Record, listen back, re-record or remove a short voice note. Stores it as a data URL. */
export function VoiceRecorder({ maxSeconds, value: note, onChange, keptNote, compact = false }: { maxSeconds: number; value: VoiceNote | null; onChange: (v: VoiceNote | null) => void; keptNote?: string; compact?: boolean }) {
  const [state, setState] = useState<"idle" | "asking" | "recording" | "denied">("idle");
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const bars = useRef<HTMLDivElement>(null);
  const stopRef = useRef<() => void>(() => {});
  const audio = useRef<HTMLAudioElement>(null);
  useEffect(() => () => stopRef.current(), []);

  const record = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setState("denied");
      return;
    }
    const ac = new AudioContext();
    setState("asking");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch {
      void ac.close();
      setState("denied");
      return;
    }
    await ac.resume().catch(() => {});
    const mimeType = VOICE_TYPES.find((t) => MediaRecorder.isTypeSupported(t));
    const rec = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: 48000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);

    const analyser = ac.createAnalyser();
    analyser.fftSize = 512;
    ac.createMediaStreamSource(stream).connect(analyser);
    const data = new Uint8Array(analyser.fftSize);
    const started = performance.now();
    let raf = 0;
    let level = 0;
    const tick = () => {
      analyser.getByteTimeDomainData(data);
      let peak = 0;
      for (const v of data) peak = Math.max(peak, Math.abs(v - 128));
      level = level * 0.6 + (peak / 128) * 0.4;
      // Live level: the newest bar on the right, the rest shuffle left.
      const el = bars.current;
      if (el) {
        for (let i = 0; i < el.children.length - 1; i++) (el.children[i] as HTMLElement).style.transform = (el.children[i + 1] as HTMLElement).style.transform;
        (el.lastElementChild as HTMLElement | null)?.style.setProperty("transform", `scaleY(${Math.min(1, 0.08 + level * 2.2).toFixed(2)})`);
      }
      const secs = (performance.now() - started) / 1000;
      setElapsed(Math.floor(secs));
      if (secs >= maxSeconds) stopRef.current();
      else raf = requestAnimationFrame(tick);
    };

    rec.onstop = () => {
      const seconds = Math.max(1, Math.round((performance.now() - started) / 1000));
      const blob = new Blob(chunks, { type: rec.mimeType || mimeType || "audio/webm" });
      const reader = new FileReader();
      reader.onload = () => onChange({ src: String(reader.result), seconds: Math.min(seconds, maxSeconds) });
      reader.readAsDataURL(blob);
    };
    stopRef.current = () => {
      cancelAnimationFrame(raf);
      if (rec.state !== "inactive") rec.stop();
      stream.getTracks().forEach((t) => t.stop());
      void ac.close();
      stopRef.current = () => {};
      setState("idle");
    };
    rec.start(250);
    setElapsed(0);
    setState("recording");
    tick();
  };

  const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (state === "recording") {
    return (
      <div className="glass flex flex-col items-center gap-4 rounded-[22px] p-5">
        <div ref={bars} className="flex h-14 w-full items-center justify-center gap-[3px]" aria-hidden="true">
          {Array.from({ length: BARS }, (_, i) => (
            <span key={i} className="h-full w-[5px] origin-center rounded-full bg-[var(--gold-text)] transition-transform duration-75" style={{ transform: "scaleY(0.08)" }} />
          ))}
        </div>
        <p className="font-display text-2xl tabular-nums" aria-live="polite">
          {clock(elapsed)} <span className="text-base text-muted">/ {clock(maxSeconds)}</span>
        </p>
        <button type="button" onClick={() => stopRef.current()} className="btn-cta flex h-14 items-center gap-2 rounded-full px-8 font-extrabold">
          <span className="h-3.5 w-3.5 rounded-[3px] bg-current" aria-hidden="true" /> Done
        </button>
      </div>
    );
  }

  if (note) {
    return (
      <div className="glass flex flex-col gap-3 rounded-[22px] p-4">
        <audio ref={audio} src={note.src} preload="auto" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} onEnded={() => setPlaying(false)} />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => (playing ? audio.current?.pause() : void audio.current?.play())}
            aria-label={playing ? "Pause" : "Play your voice note"}
            className="btn-cta flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
          >
            {playing ? <span className="flex gap-1" aria-hidden="true"><span className="h-4 w-1.5 rounded bg-current" /><span className="h-4 w-1.5 rounded bg-current" /></span> : <PlayIcon size={18} />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="font-bold">Your voice note</p>
            <p className="text-sm text-muted">
              {clock(note.seconds)}
              {keptNote ? ` · ${keptNote}` : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={record} className="btn-sec flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-bold">
            <ReplayIcon size={15} /> Record again
          </button>
          <button type="button" onClick={() => onChange(null)} className="btn-sec flex h-11 items-center justify-center rounded-full px-4 text-sm font-bold">
            Remove
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {compact ? (
        <button type="button" onClick={record} disabled={state === "asking"} className="btn-sec flex h-11 w-full items-center justify-center gap-2 rounded-full text-sm font-bold">
          <MicIcon size={16} /> {state === "asking" ? "Allow the mic…" : "Add a voice note"}
        </button>
      ) : (
        <button type="button" onClick={record} disabled={state === "asking"} className="glass flex w-full flex-col items-center gap-2 rounded-[22px] border-dashed px-4 py-7 text-center">
          <span className="btn-cta flex h-16 w-16 items-center justify-center rounded-full">
            <MicIcon size={26} />
          </span>
          <span className="mt-1 font-bold">{state === "asking" ? "Allow the mic…" : "Tap to record"}</span>
          <span className="text-xs text-muted">Up to {maxSeconds} seconds · you can listen before keeping it</span>
        </button>
      )}
      {state === "denied" && <p className="text-sm font-bold text-heart">We couldn&apos;t use the mic. Check the browser&apos;s mic permission and try again.</p>}
    </div>
  );
}
