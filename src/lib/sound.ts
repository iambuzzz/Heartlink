"use client";

// Gift music and chimes, synthesised with Web Audio: nothing to download, and no two
// openings sound exactly alike. Browsers only allow audio after a tap, so start()
// is called from the "Tap to open" button.

const PREF_KEY = "heartlink:sound";
const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);

// A slow, warm loop (C – Am – F – G) with a music box humming over it.
const CHORDS = [
  [48, 55, 64, 71],
  [45, 52, 60, 67],
  [41, 53, 60, 69],
  [43, 50, 59, 67],
];
const MELODY = [72, 74, 76, 79, 81, 84];
const CHORD_SECONDS = 8;

type Engine = { ac: AudioContext; master: GainNode; music: GainNode; fx: GainNode };

let engine: Engine | null = null;
let started = false;
let muted = false;
let ducked = false;
let loop: number | undefined;
let chord = 0;
const listeners = new Set<() => void>();

try {
  muted = typeof localStorage !== "undefined" && localStorage.getItem(PREF_KEY) === "off";
} catch {}

function build(): Engine | null {
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const ac = new AC();
  const master = ac.createGain();
  master.gain.value = 0;
  // Overlapping bells can stack up; a gentle limiter keeps cheap phone speakers from crackling.
  const limiter = ac.createDynamicsCompressor();
  limiter.threshold.value = -10;
  limiter.knee.value = 8;
  limiter.ratio.value = 6;
  master.connect(limiter).connect(ac.destination);

  // A feedback delay through a lowpass reads as a soft room without a reverb file.
  const delay = ac.createDelay(1);
  delay.delayTime.value = 0.34;
  const feedback = ac.createGain();
  feedback.gain.value = 0.36;
  const damp = ac.createBiquadFilter();
  damp.type = "lowpass";
  damp.frequency.value = 2400;
  const wet = ac.createGain();
  wet.gain.value = 0.32;
  delay.connect(damp).connect(feedback).connect(delay);
  damp.connect(wet).connect(master);

  const bus = ac.createGain();
  bus.connect(master);
  bus.connect(delay);
  const music = ac.createGain();
  music.gain.value = 0.55;
  music.connect(bus);
  const fx = ac.createGain();
  fx.gain.value = 0.8;
  fx.connect(bus);

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) void ac.suspend();
    else if (started && !muted) void ac.resume();
  });
  return { ac, master, music, fx };
}

function pad(e: Engine, notes: number[], at: number, length: number) {
  const filter = e.ac.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 900;
  filter.connect(e.music);
  for (const n of notes) {
    for (const detune of [-6, 6]) {
      const osc = e.ac.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = midi(n);
      osc.detune.value = detune;
      const g = e.ac.createGain();
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(0.028, at + 2.5);
      g.gain.setValueAtTime(0.028, at + length - 1);
      g.gain.linearRampToValueAtTime(0, at + length + 2);
      osc.connect(g).connect(filter);
      osc.start(at);
      osc.stop(at + length + 2.1);
    }
  }
}

/** A small bell: a sine with a faint octave, struck and left to ring. */
function bell(e: Engine, note: number, at: number, { level = 0.16, ring = 1.6, out = e.fx } = {}) {
  for (const [ratio, gain] of [
    [1, 1],
    [2.01, 0.28],
    [3, 0.08],
  ]) {
    const osc = e.ac.createOscillator();
    osc.type = "sine";
    osc.frequency.value = midi(note) * ratio;
    const g = e.ac.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(level * gain, at + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, at + ring / ratio);
    osc.connect(g).connect(out);
    osc.start(at);
    osc.stop(at + ring + 0.05);
  }
}

function scheduleChord() {
  const e = engine;
  if (!e || e.ac.state !== "running") return;
  const at = e.ac.currentTime + 0.1;
  pad(e, CHORDS[chord % CHORDS.length], at, CHORD_SECONDS);
  // A few music-box notes per chord, unhurried and never on a strict grid.
  for (let t = 0.6 + Math.random(); t < CHORD_SECONDS - 0.5; t += 1.1 + Math.random() * 1.6) {
    if (Math.random() < 0.7) bell(e, MELODY[Math.floor(Math.random() * MELODY.length)], at + t, { level: 0.07, ring: 2.4, out: e.music });
  }
  chord++;
}

function applyLevel(seconds = 1.2) {
  const e = engine;
  if (!e) return;
  const now = e.ac.currentTime;
  e.master.gain.cancelScheduledValues(now);
  e.master.gain.setTargetAtTime(started && !muted ? 1 : 0, now, seconds / 3);
  e.music.gain.cancelScheduledValues(now);
  e.music.gain.setTargetAtTime(ducked ? 0 : 0.55, now, 0.15);
}

const emit = () => listeners.forEach((l) => l());

export const sound = {
  /** Call from a tap. Fades the music in, unless the viewer muted it before. */
  start() {
    engine ??= build();
    if (!engine) return;
    started = true;
    void engine.ac.resume().then(() => {
      applyLevel(2.5);
      if (loop === undefined) {
        scheduleChord();
        loop = window.setInterval(scheduleChord, CHORD_SECONDS * 1000);
      }
    });
    emit();
  },
  stop() {
    started = false;
    window.clearInterval(loop);
    loop = undefined;
    applyLevel(0.6);
    emit();
  },
  toggle() {
    muted = !muted;
    try {
      localStorage.setItem(PREF_KEY, muted ? "off" : "on");
    } catch {}
    if (!muted && engine) void engine.ac.resume();
    applyLevel(0.8);
    emit();
  },
  /** Silences the music (chimes still play) while the mic is listening for a blow. */
  duck(on: boolean) {
    ducked = on;
    applyLevel();
  },
  chime(kind: "catch" | "found" | "blow" | "open" | "hug", step = 0) {
    const e = engine;
    if (!e || !started || muted || e.ac.state !== "running") return;
    const at = e.ac.currentTime + 0.02;
    const notes = {
      // Each caught firefly rings one step higher, so the last catch feels like an arrival.
      catch: [[76, 79, 81, 84, 86, 88][step % 6], [83, 86, 88, 91, 93, 95][step % 6]],
      found: [91, 96],
      blow: [72, 76, 79, 84, 88, 91, 96],
      open: [60, 64, 67, 72, 76],
      hug: [64, 67, 72, 76],
    }[kind];
    const gap = kind === "catch" ? 0.09 : kind === "hug" ? 0.18 : 0.07;
    notes.forEach((n, i) => bell(e, n, at + i * gap, { level: kind === "found" ? 0.1 : 0.15, ring: kind === "open" || kind === "hug" ? 2.6 : 1.6 }));
  },
  /** A breath of filtered noise, for blowing out candles by tap. */
  whoosh() {
    const e = engine;
    if (!e || !started || muted || e.ac.state !== "running") return;
    const at = e.ac.currentTime + 0.01;
    const length = 0.9;
    const buffer = e.ac.createBuffer(1, Math.round(e.ac.sampleRate * length), e.ac.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = e.ac.createBufferSource();
    src.buffer = buffer;
    const band = e.ac.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 0.8;
    band.frequency.setValueAtTime(1400, at);
    band.frequency.exponentialRampToValueAtTime(380, at + length);
    const g = e.ac.createGain();
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(0.35, at + 0.12);
    g.gain.exponentialRampToValueAtTime(0.0001, at + length);
    src.connect(band).connect(g).connect(e.fx);
    src.start(at);
  },
  isStarted: () => started,
  isMuted: () => muted,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
