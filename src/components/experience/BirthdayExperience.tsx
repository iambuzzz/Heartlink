"use client";

import { useEffect, useState } from "react";
import type { Photo, VoiceNote } from "@/lib/draft";
import { sound } from "@/lib/sound";
import type { GiftContent } from "@/lib/templates/types";
import { FireflyHeart, vars } from "../scenery";
import { Cake } from "./Cake";
import { Letter } from "./Letter";
import { Memories } from "./Memories";
import { Story } from "./Story";
import { VoiceJar } from "./VoiceJar";

// Fixed spots inside the 320×340 catching field, so fireflies never overlap the counter.
const SPOTS = [
  [60, 60], [220, 48], [140, 130], [40, 200], [250, 180], [150, 250],
];

export function BirthdayExperience({ content, preview = false, slug }: { content: GiftContent; preview?: boolean; slug?: string }) {
  const v = content.values;
  const reasons = (Array.isArray(v.reasons) ? (v.reasons as string[]) : []).filter((r) => r.trim());
  const photos = Array.isArray(v.photos) ? (v.photos as Photo[]) : [];
  const age = typeof v.age === "number" ? v.age : undefined;
  const letter = typeof v.letter === "string" ? v.letter : "";
  const voice = v.voice && typeof (v.voice as VoiceNote).src === "string" ? (v.voice as VoiceNote) : null;
  const scenes = ["cake", ...(reasons.length ? ["fireflies"] : []), ...(photos.length || preview ? ["memories"] : []), "letter", ...(voice ? ["voice"] : [])];
  usePreloadPhotos(photos);

  return (
    <Story
      content={content}
      preview={preview}
      slug={slug}
      scenes={scenes}
      secret={typeof v.secret === "string" ? v.secret : ""}
      renderScene={(scene, next, seen) => (
        <>
          {scene === "cake" && <Cake them={content.them} age={age} flavour={typeof v.cake === "string" ? v.cake : "chocolate"} done={seen} onDone={next} />}
          {scene === "fireflies" && <Fireflies them={content.them} reasons={reasons} done={seen} onDone={next} />}
          {scene === "memories" && <Memories photos={photos} onDone={next} />}
          {scene === "letter" && <Letter text={letter} them={content.them} you={content.you} done={seen} onDone={next} />}
          {scene === "voice" && voice && <VoiceJar note={voice} you={content.you} onDone={next} />}
        </>
      )}
    />
  );
}

/** Fetch every photo up front, so each one is ready by the time its scene opens. */
export function usePreloadPhotos(photos: Photo[]) {
  // Builder previews use in-memory data URLs; only remote photos need fetching.
  const photoKey = photos.map((p) => p.src).filter((src) => src.startsWith("http")).join("\n");
  useEffect(() => {
    for (const src of photoKey.split("\n").filter(Boolean)) {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    }
  }, [photoKey]);
}

function Fireflies({ them, reasons, done: seen, onDone }: { them: string; reasons: string[]; done: boolean; onDone: () => void }) {
  // Caught in the order they were caught; each one stays as a light below to read again.
  const [caught, setCaught] = useState<number[]>(() => (seen ? reasons.map((_, i) => i) : []));
  const [open, setOpen] = useState<number | null>(seen ? 0 : null);
  const done = caught.length === reasons.length;

  const catchOne = (i: number) => {
    setOpen(i);
    if (caught.includes(i)) return;
    sound.chime("catch", caught.length);
    setCaught((c) => [...c, i]);
  };

  return (
    <>
      <h1 className="font-display text-[26px] font-light leading-tight">Catch the fireflies</h1>
      <p className="mt-1.5 text-[15px] text-muted">Each one holds a reason you&apos;re loved, {them}.</p>
      <div className="relative mt-4 h-[300px] w-[320px]">
        {reasons.map((_, i) => {
          if (caught.includes(i)) return null;
          const [x, y] = SPOTS[i % SPOTS.length];
          return (
            <span key={i} className="anim-wander" style={vars({ left: x, top: y, "--ax": "18px", "--ay": "-14px", "--bx": "-16px", "--by": "12px", "--cx": "10px", "--cy": "18px", animationDuration: `${9 + i * 1.7}s` })}>
              <button type="button" onClick={() => catchOne(i)} aria-label={`Catch firefly ${i + 1}`} className="relative flex h-14 w-14 items-center justify-center rounded-full">
                <span className="anim-halo absolute inset-0 rounded-full" style={{ background: "var(--halo)", animationDelay: `${i * 0.5}s` }} aria-hidden="true" />
                <span className="firefly relative h-4 w-4" />
              </button>
            </span>
          );
        })}
        {done && (
          <div className="absolute inset-0 flex items-center justify-center">
            <FireflyHeart label="All the fireflies, gathered into a heart" />
          </div>
        )}
      </div>
      <div className="flex items-center" role="group" aria-label="Caught fireflies">
        {reasons.map((_, slot) => {
          const i = caught[slot];
          if (i === undefined) {
            return (
              <span key={slot} className="flex h-9 w-8 items-center justify-center" aria-hidden="true">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--divider)]" />
              </span>
            );
          }
          const active = open === i;
          return (
            <button key={slot} type="button" onClick={() => setOpen(i)} aria-label={`Read reason ${slot + 1} again`} aria-pressed={active} className="flex h-9 w-8 items-center justify-center">
              <span className={`firefly transition-transform duration-300 ${active ? "scale-150" : ""}`} style={{ width: 8, height: 8 }} />
            </button>
          );
        })}
      </div>
      <p className="text-sm font-bold text-gold" aria-live="polite">
        {caught.length} of {reasons.length} caught
        {caught.length > 1 && <span className="font-semibold text-muted"> · tap a light to read it again</span>}
      </p>
      <div className="mt-3 min-h-[92px] w-full">
        {open !== null && (
          <p key={open} className="glass anim-rise rounded-[22px] px-5 py-4 font-hand text-[24px] leading-snug">
            {reasons[open]}
          </p>
        )}
      </div>
      {done && (
        <button type="button" onClick={onDone} className="btn-cta mt-4 h-14 rounded-full px-8 font-extrabold">
          Keep going
        </button>
      )}
    </>
  );
}
