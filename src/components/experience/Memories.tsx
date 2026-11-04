"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Photo } from "@/lib/draft";
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon } from "../Icons";
import { vars } from "../scenery";

const GAP = 22;
const TILTS = [-3, 2.4, -1.6, 3.2, -2.4, 1.6];

/**
 * Polaroids clipped to a string of fairy lights that runs the full width of the screen.
 * Swipe or drag along it; tap the photo in front to open it.
 */
export function Memories({ photos, onDone }: { photos: Photo[]; onDone: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [big, setBig] = useState<number | null>(null);
  const slides = photos.length ? photos : null;
  const count = slides?.length ?? 3;
  const last = active === count - 1;

  const step = () => {
    const first = track.current?.firstElementChild as HTMLElement | null;
    return first ? first.offsetWidth + GAP : 1;
  };
  const go = useCallback((i: number, behavior: ScrollBehavior = "smooth") => {
    const first = track.current?.firstElementChild as HTMLElement | null;
    if (!track.current || !first) return;
    track.current.scrollTo({ left: Math.max(0, Math.min(count - 1, i)) * (first.offsetWidth + GAP), behavior });
  }, [count]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const first = el.firstElementChild as HTMLElement | null;
        if (first) setActive(Math.round(el.scrollLeft / (first.offsetWidth + GAP)));
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Mouse users can drag the string like a finger would; touch already scrolls natively.
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !track.current) return;
    drag.current = { x: e.clientX, left: track.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = track.current;
    if (!d || !el) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      el.style.scrollSnapType = "none";
    }
    if (d.moved) el.scrollLeft = d.left - dx;
  };
  const endDrag = () => {
    const d = drag.current;
    const el = track.current;
    drag.current = null;
    if (!d?.moved || !el) return;
    el.style.scrollSnapType = "";
    go(Math.round(el.scrollLeft / step()));
    // Swallow the click that ends a drag, so it doesn't open a photo.
    el.addEventListener("click", (ev) => ev.stopPropagation(), { capture: true, once: true });
  };

  return (
    <>
      <h1 className="font-display text-[26px] font-light">Little lights we made</h1>
      <p className="mt-1 text-sm text-muted">{slides ? "Swipe along the string · tap a photo to open it" : "Your photos will hang here. Add them now or after you pay."}</p>

      {/* Full-bleed: the string runs edge to edge, whatever the column width. */}
      <div className="relative mt-2 w-screen" style={{ marginInline: "calc(50% - 50vw)" }}>
        <div
          ref={track}
          className="memory-track no-scrollbar flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain pb-4 pt-2"
          style={{ gap: GAP }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerLeave={endDrag}
        >
          {Array.from({ length: count }, (_, i) => {
            const p = slides?.[i];
            const isActive = i === active;
            return (
              <div key={i} className="memory-slide relative shrink-0 snap-center">
                <FairyString />
                <div className="memory-card relative mx-auto mt-[22px]" style={vars({ "--r": `${TILTS[i % TILTS.length]}deg`, animationDelay: `${-i * 1.3}s` })}>
                  <span className="absolute -top-[9px] left-1/2 z-10 h-[22px] w-[9px] -translate-x-1/2 rounded-[2px] bg-[#c99a62] shadow-[inset_-2px_0_0_rgba(0,0,0,0.15)]" aria-hidden="true" />
                  <button
                    type="button"
                    disabled={!p}
                    onClick={() => (isActive ? setBig(i) : go(i))}
                    aria-label={p ? (isActive ? `Open photo ${i + 1}` : `Go to photo ${i + 1}`) : undefined}
                    className="block w-full cursor-pointer select-none rounded-[4px] p-2.5 pb-1 text-left transition-[transform,opacity] duration-500"
                    style={{ background: "var(--paper)", color: "var(--paper-ink)", boxShadow: "0 14px 30px -12px rgba(0,0,0,0.45)", transform: `scale(${isActive ? 1 : 0.88})`, opacity: isActive ? 1 : 0.72 }}
                  >
                    {p ? <Print src={p.src} alt={p.caption || `Memory ${i + 1}`} eager={i < 3} index={i} /> : <div className="photo-fill flex aspect-[4/5] items-center justify-center rounded-[2px] text-sm font-bold">Photo {i + 1}</div>}
                    <span className="block min-h-9 truncate py-1 text-center font-hand text-[23px] leading-tight">{p?.caption}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" disabled={active === 0} onClick={() => go(active - 1)} aria-label="Previous photo" className="btn-sec flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-30">
          <ArrowLeftIcon size={17} />
        </button>
        <div className="flex gap-1.5" aria-hidden="true">
          {Array.from({ length: count }, (_, i) => (
            <span key={i} className="h-1.5 rounded-full transition-all duration-300" style={{ width: i === active ? 18 : 6, background: i === active ? "var(--gold-text)" : "var(--divider)" }} />
          ))}
        </div>
        <button type="button" disabled={last} onClick={() => go(active + 1)} aria-label="Next photo" className="btn-sec flex h-11 w-11 items-center justify-center rounded-full disabled:opacity-30">
          <ArrowRightIcon size={17} />
        </button>
      </div>
      <button type="button" onClick={onDone} className={`${last ? "btn-cta" : "btn-sec"} mt-5 rounded-full px-8 py-3.5 font-extrabold`}>
        {last ? "Keep going" : "Skip ahead"}
      </button>

      {big !== null && slides && (
<Lightbox photos={slides} start={big} onIndex={(i) => go(i, "auto")} onClose={() => setBig(null)} />
      )}
    </>
  );
}

/** The photo fades up out of warm white once it has actually loaded, like a print developing. */
function Print({ src, alt, eager, index }: { src: string; alt: string; eager: boolean; index: number }) {
  const [ready, setReady] = useState(false);
  return (
    <span className="relative block aspect-[4/5] overflow-hidden rounded-[2px] bg-[#e9e2cf]">
      {!ready && <span className="anim-pulse-soft absolute inset-0 bg-[#f4efe2]" aria-hidden="true" />}
      {/* eslint-disable-next-line @next/next/no-img-element -- user photo from a signed storage URL */}
      <img
        src={src}
        alt={alt}
        data-photo={index}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
        ref={(img) => {
          if (img?.complete && img.naturalWidth) setReady(true);
        }}
        onLoad={() => setReady(true)}
        className="h-full w-full object-cover transition-opacity duration-700"
        style={{ opacity: ready ? 1 : 0 }}
      />
    </span>
  );
}

function FairyString() {
  return (
    <span className="pointer-events-none absolute -top-1 block h-[30px]" style={{ left: -GAP / 2, right: -GAP / 2 }} aria-hidden="true">
      <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M0 6Q50 30 100 6" stroke="var(--twine)" strokeWidth={1.4} fill="none" vectorEffect="non-scaling-stroke" />
      </svg>
      {[0.16, 0.84].map((u) => (
        <span key={u} className="fairy-bulb" style={{ left: `${u * 100}%`, top: (1 - u) * (1 - u) * 6 + 2 * u * (1 - u) * 30 + u * u * 6 + 4 }} />
      ))}
    </span>
  );
}

type Rect = { x: number; y: number; w: number; h: number };
const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";

/** Where the image sits when open: as large as fits above the caption and thumbnails. */
function fitRect(nw: number, nh: number): Rect {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const maxW = Math.min(vw - 24, 900);
  const maxH = vh - (vh < 600 ? 150 : 210);
  const s = Math.min(maxW / nw, maxH / nh);
  const w = nw * s;
  const h = nh * s;
  return { x: (vw - w) / 2, y: Math.max(56, (vh - 150 - h) / 2 + 20), w, h };
}

/** The polaroid's photo on screen, if that card is visible, so open and close can zoom from it. */
function cardRect(i: number): Rect | null {
  const img = document.querySelector<HTMLImageElement>(`img[data-photo="${i}"]`);
  if (!img) return null;
  const r = img.getBoundingClientRect();
  if (r.right < 0 || r.left > window.innerWidth) return null;
  return { x: r.left, y: r.top, w: r.width, h: r.height };
}

/** Places the open photo over `from`, scaled evenly (no stretching) and centred on it. */
function toTransform(from: Rect, to: Rect) {
  const s = from.w / to.w;
  const tx = from.x + from.w / 2 - (to.x + (to.w * s) / 2);
  const ty = from.y + from.h / 2 - (to.y + (to.h * s) / 2);
  return `translate(${tx}px, ${ty}px) scale(${s})`;
}

function Lightbox({ photos, start, onIndex, onClose }: { photos: Photo[]; start: number; onIndex: (i: number) => void; onClose: () => void }) {
  const [index, setIndex] = useState(start);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const frame = useRef<HTMLDivElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const chrome = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ x: number; y: number; axis: "x" | "y" | null } | null>(null);
  const closing = useRef(false);
  const p = photos[index];
  const rect = size ? fitRect(size.w, size.h) : null;

  // Lock the page behind, and learn the photo's real shape before laying it out.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);
  useEffect(() => {
    let alive = true;
    const img = new Image();
    img.onload = () => alive && setSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = p.src;
    if (img.complete && img.naturalWidth) setSize({ w: img.naturalWidth, h: img.naturalHeight });
    return () => {
      alive = false;
    };
  }, [p.src]);

  const setStyle = (el: HTMLElement | null, transform: string, transition = "none", opacity?: number) => {
    if (!el) return;
    el.style.transition = transition;
    el.style.transform = transform;
    if (opacity !== undefined) el.style.opacity = String(opacity);
  };

  // Zoom open from the polaroid the first time; later photos slide in from the side.
  const opened = useRef(false);
  const enterFrom = useRef<"left" | "right" | null>(null);
  useLayoutEffect(() => {
    if (!rect || !frame.current) return;
    const from = !opened.current ? cardRect(start) : null;
    const dir = enterFrom.current;
    if (from) setStyle(frame.current, toTransform(from, rect));
    else if (dir) setStyle(frame.current, `translateX(${dir === "right" ? 100 : -100}vw)`);
    else setStyle(frame.current, "scale(0.92)", "none", 0);
    void frame.current.offsetWidth;
    setStyle(frame.current, "none", `transform 0.42s ${EASE}, opacity 0.3s`, 1);
    if (!opened.current) {
      setStyle(backdrop.current, "none", "opacity 0.35s", 1);
      setStyle(chrome.current, "none", "opacity 0.4s 0.15s", 1);
    }
    opened.current = true;
    enterFrom.current = null;
    // rect is derived from size; re-running on size or index is what we want.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, index]);

  const show = (i: number) => {
    if (i < 0 || i >= photos.length || i === index) return;
    const dir = i > index ? "right" : "left";
    setStyle(frame.current, `translateX(${dir === "right" ? -100 : 100}vw)`, `transform 0.3s ${EASE}`);
    window.setTimeout(() => {
      enterFrom.current = dir;
      setSize(null);
      setIndex(i);
      onIndex(i);
    }, 220);
  };

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const to = rect && cardRect(index);
    if (to && rect) setStyle(frame.current, toTransform(to, rect), `transform 0.36s ${EASE}`);
    else setStyle(frame.current, "scale(0.9)", "transform 0.3s, opacity 0.3s", 0);
    setStyle(backdrop.current, "none", "opacity 0.32s", 0);
    setStyle(chrome.current, "none", "opacity 0.2s", 0);
    window.setTimeout(onClose, 340);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // The photo follows the finger: sideways to change photo, downwards to close.
  const onDown = (e: React.PointerEvent) => {
    gesture.current = { x: e.clientX, y: e.clientY, axis: null };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.axis && Math.hypot(dx, dy) > 8) g.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
    if (g.axis === "x") {
      const edge = (dx > 0 && index === 0) || (dx < 0 && index === photos.length - 1);
      setStyle(frame.current, `translateX(${edge ? dx / 3 : dx}px)`);
    } else if (g.axis === "y" && dy > 0) {
      setStyle(frame.current, `translateY(${dy}px) scale(${1 - Math.min(dy, 400) / 1600})`);
      if (backdrop.current) backdrop.current.style.opacity = String(1 - Math.min(dy, 300) / 450);
    }
  };
  const onUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    if (!g.axis) {
      // A still tap on the photo or the dark around it closes.
      close();
      return;
    }
    if (g.axis === "x" && Math.abs(dx) > 70 && ((dx < 0 && index < photos.length - 1) || (dx > 0 && index > 0))) show(index + (dx < 0 ? 1 : -1));
    else if (g.axis === "y" && dy > 110) close();
    else {
      setStyle(frame.current, "none", `transform 0.3s ${EASE}`);
      setStyle(backdrop.current, "none", "opacity 0.3s", 1);
    }
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={p.caption || `Photo ${index + 1}`} className="fixed inset-0 z-50 select-none">
      <div ref={backdrop} className="absolute inset-0 opacity-0" style={{ background: "radial-gradient(120% 90% at 50% 40%, rgba(16,32,34,0.96), rgba(4,10,12,0.98))" }} />
      <div className="absolute inset-0 touch-none" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}>
        {rect && (
          <div ref={frame} className="absolute overflow-hidden rounded-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]" style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, transformOrigin: "0 0", willChange: "transform" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- user photo from a signed storage URL */}
            <img src={p.src} alt={p.caption || `Photo ${index + 1}`} className="h-full w-full object-cover" draggable={false} />
          </div>
        )}
      </div>

      <div ref={chrome} className="pointer-events-none absolute inset-0 opacity-0">
        <button type="button" onClick={close} aria-label="Close" className="pointer-events-auto absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/12 text-white">
          <CloseIcon size={20} />
        </button>
        <p className="absolute left-4 top-6 text-xs font-extrabold tracking-widest text-white/60">
          {index + 1} / {photos.length}
        </p>
        {index > 0 && (
          <button type="button" onClick={() => show(index - 1)} aria-label="Previous photo" className="pointer-events-auto absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white md:flex">
            <ArrowLeftIcon size={20} />
          </button>
        )}
        {index < photos.length - 1 && (
          <button type="button" onClick={() => show(index + 1)} aria-label="Next photo" className="pointer-events-auto absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/12 text-white md:flex">
            <ArrowRightIcon size={20} />
          </button>
        )}
        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 px-4 pb-6">
          <p key={index} className="anim-rise min-h-8 text-center font-hand text-[28px] leading-tight text-[#f6eed8]">
            {p.caption}
          </p>
          {photos.length > 1 && (
            <div className="pointer-events-auto flex max-w-full gap-2 overflow-x-auto px-1 py-1 no-scrollbar">
              {photos.map((ph, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => show(i)}
                  aria-label={`Photo ${i + 1}`}
                  className="h-12 w-12 shrink-0 overflow-hidden rounded-lg transition-[opacity,transform] duration-300"
                  style={{ opacity: i === index ? 1 : 0.5, transform: `scale(${i === index ? 1.08 : 1})`, outline: i === index ? "2px solid #f6d77a" : "none", outlineOffset: 2 }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- thumbnail of a user photo */}
                  <img src={ph.src} alt="" className="h-full w-full object-cover" draggable={false} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
