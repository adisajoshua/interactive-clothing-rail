import { useRef, useCallback } from 'react';

/**
 * Procedural metallic friction sound synthesizer using the Web Audio API.
 * Simulates a steel hanger sliding and scraping along a steel rail pipe.
 * Zero external audio files or network requests required.
 */
export const usePipeSound = () => {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playFrictionSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Triangle wave provides metallic harmonic warmth
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);

      // Bandpass filter captures the resonant ring of hollow steel tubing
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(850, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      // Rapid envelope avoids listener fatigue
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // AudioContext unavailable or autoplay blocked
    }
  }, []);

  return { playFrictionSound };
};
