"use client";

import { useEffect, useRef, useState } from "react";
import { sound } from "@/lib/sound";
import type { ChatLine, GiftContent } from "@/lib/templates/types";
import { Story } from "./Story";

export function ChatExperience({ content, preview = false, slug }: { content: GiftContent; preview?: boolean; slug?: string }) {
  const v = content.values;
  const lines = (Array.isArray(v.messages) ? (v.messages as ChatLine[]) : []).filter((l) => l.text?.trim());
  return (
    <Story
      content={content}
      preview={preview}
      slug={slug}
      scenes={["chat"]}
      renderScene={(scene, next) => scene === "chat" && <Chat lines={lines} title={typeof v.title === "string" ? v.title.trim() : ""} ps={typeof v.ps === "string" ? v.ps.trim() : ""} you={content.you} onDone={next} />}
    />
  );
}

/** Replays the chat one bubble at a time, with the sender "typing" before each of their messages. */
function Chat({ lines, title, ps, you, onDone }: { lines: ChatLine[]; title: string; ps: string; you: string; onDone: () => void }) {
  const total = lines.length + (ps ? 1 : 0);
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const done = shown >= total;

  useEffect(() => {
    if (done) {
      setTyping(false);
      return;
    }
    const nextLine = shown < lines.length ? lines[shown] : { from: "you" as const, text: ps };
    const fromSender = nextLine.from === "you";
    // The sender types (longer messages take longer); the recipient's own lines just appear.
    const wait = fromSender ? Math.min(1900, 550 + nextLine.text.length * 28) : 650;
    setTyping(fromSender);
    const t = window.setTimeout(() => {
      setTyping(false);
      setShown((n) => n + 1);
      if (fromSender) sound.chime("found");
    }, shown === lines.length ? wait + 900 : wait);
    return () => window.clearTimeout(t);
  }, [shown, done, lines, ps]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [shown, typing]);

  const initial = (you.trim()[0] ?? "♥").toUpperCase();
  return (
    <>
      <div className="glass flex h-[min(68dvh,560px)] w-full flex-col overflow-hidden rounded-[26px] text-left">
        <div className="flex items-center gap-3 border-b border-glass-line px-4 py-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full font-display text-lg text-[var(--on-cta)]" style={{ background: "var(--cta)" }} aria-hidden="true">
            {initial}
          </span>
          <div className="min-w-0">
            <p className="truncate font-bold">{you}</p>
            <p className="text-xs text-muted">{typing ? "typing…" : "online"}</p>
          </div>
        </div>
        <div ref={scroller} className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-4" aria-live="polite">
          {title && <p className="mx-auto mb-2 rounded-full bg-cell px-3 py-1 text-[11.5px] font-bold text-muted">{title}</p>}
          {lines.slice(0, shown).map((l, i) => (
            <Bubble key={i} line={l} />
          ))}
          {ps && shown > lines.length && (
            <>
              <p className="mx-auto my-3 rounded-full bg-cell px-3 py-1 text-[11.5px] font-extrabold uppercase tracking-wider text-gold">Today</p>
              <Bubble line={{ from: "you", text: ps }} glow />
            </>
          )}
          {typing && (
            <span className="chat-bubble flex w-fit items-center gap-1 rounded-2xl rounded-bl-md bg-cell px-3.5 py-3" aria-label={`${you} is typing`}>
              {[0, 1, 2].map((d) => (
                <span key={d} className="chat-dot h-1.5 w-1.5 rounded-full bg-current opacity-60" style={{ animationDelay: `${d * 0.18}s` }} />
              ))}
            </span>
          )}
        </div>
      </div>
      <div className="mt-5 flex min-h-14 items-center">
        {done ? (
          <button type="button" onClick={onDone} className="btn-cta anim-rise h-14 rounded-full px-8 font-extrabold">
            Keep going
          </button>
        ) : (
          <button type="button" onClick={() => setShown(total)} className="text-sm font-bold text-muted underline underline-offset-4">
            Show it all
          </button>
        )}
      </div>
    </>
  );
}

function Bubble({ line, glow = false }: { line: ChatLine; glow?: boolean }) {
  const mine = line.from === "them";
  return (
    <p
      className={`chat-bubble max-w-[80%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-[15px] leading-snug ${mine ? "ml-auto rounded-br-md text-[var(--on-cta)]" : "rounded-bl-md bg-cell"} ${glow ? "font-hand text-[21px]" : ""}`}
      style={{ background: mine ? "var(--cta)" : undefined, boxShadow: glow ? "0 0 0 1px var(--gold-text), 0 0 18px -4px var(--gold-text)" : undefined }}
    >
      {line.text}
    </p>
  );
}
