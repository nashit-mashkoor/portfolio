import { useEffect, useState } from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function useStoredBool(key: string, fallback: boolean): [boolean, (v: boolean) => void] {
  const [value, setValue] = useState<boolean>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : raw === "1";
    } catch {
      return fallback;
    }
  });
  const set = (v: boolean) => {
    setValue(v);
    try {
      window.localStorage.setItem(key, v ? "1" : "0");
    } catch {
      // storage unavailable (private mode etc.) — session-only is fine
    }
  };
  return [value, set];
}

export function useStoredString(key: string, fallback: string): [string, (v: string) => void] {
  const [value, setValue] = useState<string>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null || raw === "" ? fallback : raw;
    } catch {
      return fallback;
    }
  });
  const set = (v: string) => {
    setValue(v);
    try {
      window.localStorage.setItem(key, v);
    } catch {
      // storage unavailable — session-only is fine
    }
  };
  return [value, set];
}

/** Synthesized UI sounds via WebAudio. No audio assets. */
export class SoundEngine {
  private enabled = false;

  setEnabled(on: boolean) {
    this.enabled = on;
  }

  private ensure(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    return this.ctx;
  }

  private blip(freq: number, durationMs: number, gain: number, type: OscillatorType) {
    const ctx = this.ensure();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = ctx.currentTime;
    amp.gain.setValueAtTime(gain, t);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + durationMs / 1000);
    osc.connect(amp).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + durationMs / 1000);
  }

  /** short tick per keypress */
  tick() {
    this.blip(1350 + Math.random() * 250, 28, 0.022, "square");
  }

  /** two-tone confirmation */
  beep() {
    this.blip(720, 70, 0.05, "sine");
    window.setTimeout(() => this.blip(1080, 90, 0.05, "sine"), 70);
  }

  /** low denial buzz */
  buzz() {
    this.blip(150, 160, 0.06, "sawtooth");
  }

  private ctx: AudioContext | null = null;
}

/** App-wide singleton — audio state is intentionally global. */
export const soundEngine = new SoundEngine();
