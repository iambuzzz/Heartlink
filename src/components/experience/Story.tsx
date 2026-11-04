"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { sound } from "@/lib/sound";
import type { GiftContent } from "@/lib/templates/types";
import { HeartIcon, ReplayIcon, SpeakerIcon, SpeakerOffIcon } from "../Icons";
import { FireflyHeart } from "../scenery";
import { Reply } from "./Reply";

// Every gift is a story: the intro, the template's own scenes, then the same warm ending
// (jhappi, paper-plane reply). A hidden firefly sits on each screen for curious thumbs.

const HIDDEN_SPOTS: React.CSSProperties[] = [
  { right: -8, top: "8%" },
  { left: -10, bottom: "14%" },
  { right: -6, bottom: "6%" },
  { left: -8, top: "18%" },
  { right: -10, top: "46%" },
];
const DEFAULT_SECRET = "You found every hidden light. Of course you did. You always find the good in everything.";

export function Story({
  content,
  preview = false,
  slug,
  scenes: middle,
  secret = "",
  renderScene,
}: {
  content: GiftContent;
  preview?: boolean;
  slug?: string;
  scenes: string[];
  secret?: string;
  renderScene: (scene: string, next: () => void) => React.ReactNode;
}) {
  const scenes = ["intro", ...middle, "end"];
  const [index, setIndex] = useState(0);
  const [found, setFound] = useState<string[]>([]);
  const scene = scenes[Math.min(index, scenes.length - 1)];
  const next = () => setIndex((i) => Math.min(i + 1, scenes.length - 1));
  const hideable = scenes.filter((s) => s !== "end");
  const spot = HIDDEN_SPOTS[index % HIDDEN_SPOTS.length];
  useEffect(() => () => sound.stop(), []);

  return (
    <div className={`mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pt-5 ${preview ? "pb-32" : "pb-10"}`}>
      <div className="relative flex justify-center gap-1.5">
        <SoundToggle />
        {scenes.map((s, i) => (
          <span key={s} aria-hidden="true" className="h-1.5 rounded-full transition-all duration-500" style={{ width: i === index ? 22 : 6, background: i <= index ? "var(--gold-text)" : "var(--divider)" }} />
        ))}
        {found.length > 0 && (
          <span className="absolute right-0 -top-1 flex items-center gap-1 text-xs font-extrabold text-gold" aria-live="polite">
            <span className="firefly h-1.5 w-1.5" aria-hidden="true" />
            {found.length}/{hideable.length} hidden
          </span>
        )}
      </div>
      <div key={scene} className="anim-rise relative flex flex-1 flex-col items-center justify-center py-6 text-center">
        {scene === "intro" && (
          <Intro
            them={content.them}
            onOpen={() => {
              sound.start();
              next();
            }}
          />
        )}
        {scene !== "intro" && scene !== "end" && renderScene(scene, next)}
        {scene === "end" && <End content={content} preview={preview} slug={slug} secret={found.length === hideable.length ? secret.trim() || DEFAULT_SECRET : null} onReplay={() => setIndex(0)} />}
        {scene !== "end" && !found.includes(scene) && (
          <button
            type="button"
            onClick={() => {
              sound.chime("found");
              setFound((f) => [...f, scene]);
            }}
            aria-label="A hidden firefly"
            className="absolute flex h-11 w-11 items-center justify-center"
            style={spot}
          >
            <span className="firefly anim-blink h-[5px] w-[5px]" style={{ animationDuration: "3.8s" }} />
          </button>
        )}
      </div>
    </div>
  );
}

function SoundToggle() {
  const started = useSyncExternalStore(sound.subscribe, sound.isStarted, () => false);
  const muted = useSyncExternalStore(sound.subscribe, sound.isMuted, () => false);
  if (!started) return null;
  return (
    <button type="button" onClick={sound.toggle} aria-label={muted ? "Turn music on" : "Turn music off"} aria-pressed={!muted} className="absolute -left-2 -top-3.5 flex h-9 w-9 items-center justify-center rounded-full text-muted">
      {muted ? <SpeakerOffIcon size={18} /> : <SpeakerIcon size={18} />}
    </button>
  );
}

function Intro({ them, onOpen }: { them: string; onOpen: () => void }) {
  return (
    <>
      <FireflyHeart label="Fireflies gathering into a heart" />
      <p className="mt-4 text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-gold">Someone made you something</p>
      <h1 className="mt-2 font-hand text-[52px] leading-none">For {them}</h1>
      <button type="button" onClick={onOpen} className="btn-cta mt-8 h-14 rounded-full px-9 text-base font-extrabold">
        Tap to open
      </button>
    </>
  );
}

const HEARTBEAT = [70, 110, 70, 650];

function Jhappi({ you, slug, preview }: { you: string; slug?: string; preview: boolean }) {
  const [holding, setHolding] = useState(false);
  const [sent, setSent] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const begin = () => {
    if (sent || holding) return;
    setHolding(true);
    navigator.vibrate?.(Array.from({ length: 4 }, () => HEARTBEAT).flat());
    timer.current = window.setTimeout(() => {
      setHolding(false);
      setSent(true);
      navigator.vibrate?.(0);
      sound.chime("hug");
      if (!preview && slug) void fetch(`/api/g/${slug}/hug`, { method: "POST" }).catch(() => {});
    }, 2600);
  };
  const end = () => {
    window.clearTimeout(timer.current);
    setHolding(false);
    navigator.vibrate?.(0);
  };
  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <>
      {holding && <div className="anim-hug pointer-events-none fixed inset-0 z-10" style={{ background: "radial-gradient(circle at 50% 62%, rgba(255,190,120,0.5), transparent 62%)" }} aria-hidden="true" />}
      <button
        type="button"
        onPointerDown={begin}
        onPointerUp={end}
        onPointerLeave={end}
        onPointerCancel={end}
        onKeyDown={(e) => (e.key === " " || e.key === "Enter") && !e.repeat && begin()}
        onKeyUp={end}
        onContextMenu={(e) => e.preventDefault()}
        className={`relative z-20 mt-6 flex h-16 w-full select-none items-center justify-center gap-2.5 rounded-full font-extrabold transition-transform ${holding ? "scale-95" : ""} ${sent ? "btn-sec" : "btn-cta"}`}
        style={{ touchAction: "none", WebkitTouchCallout: "none" }}
      >
        <span className={holding ? "anim-beat" : ""}>
          <HeartIcon size={20} />
        </span>
        {sent ? (preview ? "That's how a jhappi feels" : `Jhappi sent to ${you}`) : holding ? "Hold… hold…" : `Hold for a jhappi from ${you}`}
      </button>
    </>
  );
}

function End({ content, preview, slug, secret, onReplay }: { content: GiftContent; preview: boolean; slug?: string; secret: string | null; onReplay: () => void }) {
  return (
    <>
      <FireflyHeart />
      <h1 className="font-display text-[28px] font-light leading-tight">
        Made with love for <span className="text-shine font-medium">{content.them}</span>
      </h1>
      {secret && (
        <div className="glass anim-rise mt-5 w-full rounded-[22px] px-5 py-4">
          <p className="text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-gold">You found every hidden firefly</p>
          <p className="mt-1.5 font-hand text-[24px] leading-snug">{secret}</p>
        </div>
      )}
      <Jhappi you={content.you} slug={slug} preview={preview} />
      <Reply you={content.you} slug={slug} preview={preview} />
      <button type="button" onClick={onReplay} className="btn-sec mt-4 inline-flex h-12 items-center gap-2 rounded-full px-6 font-bold">
        <ReplayIcon size={16} /> Watch again
      </button>
      {!preview && (
        <Link href="/" className="mt-6 text-sm font-bold text-muted">
          Made with heartlink · make one for someone you love
        </Link>
      )}
    </>
  );
}
