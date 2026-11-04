"use client";

import { useState } from "react";
import type { VoiceNote } from "@/lib/draft";
import { sound } from "@/lib/sound";
import { VoiceRecorder } from "../VoiceRecorder";

const MAX_LENGTH = 500;

/** The recipient writes (or says) something back; it folds into a paper plane and flies to the sender. */
export function Reply({ you, slug, preview }: { you: string; slug?: string; preview: boolean }) {
  const [message, setMessage] = useState("");
  const [voice, setVoice] = useState<VoiceNote | null>(null);
  const [stage, setStage] = useState<"writing" | "flying" | "sent">("writing");
  const [error, setError] = useState<string | null>(null);
  const ready = message.trim().length > 0 || voice !== null;

  const send = async () => {
    if (!ready) return;
    setError(null);
    if (!preview && slug) {
      const res = await fetch(`/api/g/${slug}/reply`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: message.trim(), voice }) }).catch(() => null);
      if (!res?.ok) {
        const data = res ? ((await res.json().catch(() => ({}))) as { error?: string }) : {};
        setError(data.error ?? "It didn't fly. Check your connection and try again.");
        return;
      }
    }
    sound.whoosh();
    setStage("flying");
    window.setTimeout(() => setStage("sent"), 1500);
  };

  if (stage === "sent") {
    return (
      <div className="glass anim-rise mt-6 flex w-full flex-col items-center gap-2 rounded-[22px] p-5">
        <PlaneIcon className="text-gold" />
        <p className="font-display text-lg">Your paper plane reached {you}</p>
        <p className="text-sm text-muted">{preview ? "In the real gift, this lands with them." : "They'll see it the next time they check their gifts."}</p>
        <button
          type="button"
          onClick={() => {
            setMessage("");
            setVoice(null);
            setStage("writing");
          }}
          className="mt-1 text-sm font-bold text-muted underline underline-offset-4"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <div className="relative mt-6 w-full">
      <div className={`glass w-full rounded-[22px] p-4 text-left ${stage === "flying" ? "reply-fold" : ""}`}>
        <label htmlFor="reply" className="text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-gold">
          Send {you} a paper plane back
        </label>
        <textarea
          id="reply"
          rows={3}
          maxLength={MAX_LENGTH}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write what you felt…"
          className="mt-2 w-full resize-none rounded-2xl border border-glass-line bg-field px-4 py-3 font-hand text-[21px] outline-none"
        />
        <div className="mt-2">
          <VoiceRecorder maxSeconds={30} value={voice} onChange={setVoice} compact />
        </div>
        <button type="button" disabled={!ready || stage !== "writing"} onClick={send} className="btn-cta mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full font-extrabold disabled:opacity-45">
          <PlaneIcon /> Fold it & send
        </button>
        {error && <p className="mt-2 text-center text-sm font-bold text-heart">{error}</p>}
      </div>
      {stage === "flying" && (
        <span className="plane-flight pointer-events-none absolute left-1/2 top-1/2 text-gold" aria-hidden="true">
          <PlaneIcon size={46} />
        </span>
      )}
    </div>
  );
}

function PlaneIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M21.5 3 2.8 10.6l7 2.6L21.5 3Z" fill="currentColor" fillOpacity={0.18} />
      <path d="M21.5 3 9.8 13.2l1.4 7.6 3.3-4.8L21.5 3Z" fill="currentColor" fillOpacity={0.32} />
      <path d="m9.8 13.2 4.7 2.8" />
    </svg>
  );
}
