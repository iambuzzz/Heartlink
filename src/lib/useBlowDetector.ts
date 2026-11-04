"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type State = "idle" | "asking" | "listening" | "denied" | "unsupported";

/**
 * Listens to the microphone and reports how hard someone is blowing, 0–1, every frame.
 * Blowing at a phone is loud, low-pitched noise; speech and room noise mostly aren't,
 * so the level is measured below ~600 Hz against the room's own noise floor.
 * Audio never leaves the device.
 */
export function useBlowDetector(onLevel: (level: number) => void) {
  const [state, setState] = useState<State>("idle");
  const stopRef = useRef<() => void>(() => {});
  const levelRef = useRef(onLevel);
  useEffect(() => {
    levelRef.current = onLevel;
  });

  const stop = useCallback(() => stopRef.current(), []);
  useEffect(() => stop, [stop]);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setState("unsupported");
      return;
    }
    // Created inside the tap: a context made after the permission prompt can stay
    // suspended and hear nothing, which is what broke the first version.
    const ctx = new AudioContext();
    setState("asking");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
    } catch {
      void ctx.close();
      setState("denied");
      return;
    }
    await ctx.resume().catch(() => {});

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.3;
    ctx.createMediaStreamSource(stream).connect(analyser);
    const bins = new Float32Array(analyser.frequencyBinCount);
    const lowBins = Math.max(4, Math.round((600 / (ctx.sampleRate / 2)) * bins.length));
    let floor = -1000;
    let raf = 0;
    const startedAt = performance.now();

    stopRef.current = () => {
      cancelAnimationFrame(raf);
      stream.getTracks().forEach((t) => t.stop());
      void ctx.close();
      stopRef.current = () => {};
    };

    const tick = () => {
      analyser.getFloatFrequencyData(bins);
      let sum = 0;
      for (let i = 1; i < lowBins; i++) sum += 10 ** (bins[i] / 10);
      const db = 10 * Math.log10(sum / (lowBins - 1) + 1e-12);
      if (performance.now() - startedAt < 400) {
        // Learn the room first.
        floor = floor < -900 ? db : floor * 0.8 + db * 0.2;
        levelRef.current(0);
      } else {
        // Follow the room down quickly and up only slowly, so a long blow doesn't become "normal".
        if (db < floor) floor = floor * 0.9 + db * 0.1;
        else if (db - floor < 8) floor = floor * 0.995 + db * 0.005;
        const over = db - Math.max(floor, -75);
        // ~14 dB over the room starts to count; ~34 dB is a full, strong blow.
        levelRef.current(Math.min(1, Math.max(0, (over - 14) / 20)));
      }
      raf = requestAnimationFrame(tick);
    };
    setState("listening");
    tick();
  }, []);

  return { state, start, stop };
}
