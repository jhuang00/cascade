// BGM patterns — look-ahead step sequencer over the Web Audio API.
// Schedules notes ~100ms ahead on a 25ms timer for sample-accurate, drift-free
// timing. Patterns route into the music bus (musicGain) passed by lib/audio.ts.

import { getNoiseBuffer } from '@/lib/audio';

const NOTES: Record<string, number> = {
  C2: 65.41, E2: 82.41, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99,
  R: 0, // R = rest
};

interface Note {
  freq: number;
  type?: OscillatorType;
  gain?: number;
  duration?: number; // seconds; defaults to stepDuration
  attack?: number;   // seconds of fade-in (ambient pads); default = quick
  lpf?: number;
  freqEnd?: number;
}

interface Layer {
  notes: Note[];
  // Anti-repetition (see game-audio skill, sequencer-pattern.md):
  variants?: Note[][];  // phrase bank — cycles per full pass instead of `notes`
  skipChance?: number;  // 0..1 random note omission for organic variation
  humanize?: number;    // 0..1 per-note jitter on gain / filter / pitch
  lpfDrift?: number;    // 0..1 slow sinusoidal filter sweep depth
  type?: OscillatorType;
  gain?: number;
  duration?: number;
  attack?: number;
  lpf?: number;
}

/**
 * Step sequencer. Returns { stop() } to cancel the loop.
 * Layers may have different lengths — they realign only after LCM(lengths)
 * steps, which keeps the loop from sounding repetitive.
 */
function sequencer(ctx: AudioContext, dest: GainNode, layers: Layer[], bpm: number, stepsPerBeat = 2): { stop: () => void } {
  const stepDuration = 60 / bpm / stepsPerBeat;
  let nextStepTime = ctx.currentTime + 0.05;
  let stepIndex = 0;
  let stopped = false;
  let timerId: ReturnType<typeof setTimeout> | null = null;

  function scheduleStep() {
    if (stopped) return;
    while (nextStepTime < ctx.currentTime + 0.1) {
      for (const layer of layers) {
        // Phrase bank: swap in a different variation of the line each pass.
        const base = layer.variants
          ? layer.variants[Math.floor(stepIndex / layer.notes.length) % layer.variants.length]
          : layer.notes;
        const n = base[stepIndex % layer.notes.length];
        const freq = n.freq;
        if (freq > 0 && !(layer.skipChance && Math.random() < layer.skipChance)) {
          const h = layer.humanize ?? 0;
          const dur = n.duration ?? layer.duration ?? stepDuration;
          const peak = (n.gain ?? layer.gain ?? 0.12) * (1 + (Math.random() - 0.5) * h * 0.5);
          const attack = n.attack ?? layer.attack ?? 0.01;
          const t = nextStepTime;

          const osc = ctx.createOscillator();
          osc.type = n.type ?? layer.type ?? 'sine';
          osc.frequency.setValueAtTime(freq * (1 + (Math.random() - 0.5) * h * 0.008), t);
          if (n.freqEnd) osc.frequency.exponentialRampToValueAtTime(n.freqEnd, t + dur);

          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(peak, t + Math.min(attack, dur * 0.5));
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

          const f = ctx.createBiquadFilter();
          f.type = 'lowpass';
          // Slow timbral movement: the cutoff breathes over ~64 steps.
          const drift = layer.lpfDrift
            ? 1 + layer.lpfDrift * 0.45 * Math.sin((stepIndex / 64) * Math.PI * 2)
            : 1;
          const jitter = 1 + (Math.random() - 0.5) * h * 0.4;
          f.frequency.setValueAtTime((n.lpf ?? layer.lpf ?? 2000) * drift * jitter, t);

          osc.connect(f).connect(g).connect(dest);
          osc.start(t);
          osc.stop(t + dur);
        }
      }
      stepIndex++;
      nextStepTime += stepDuration;
    }
    timerId = setTimeout(scheduleStep, 25);
  }

  scheduleStep();
  return {
    stop() {
      stopped = true;
      if (timerId !== null) clearTimeout(timerId);
    },
  };
}

function parse(str: string): Note[] {
  return str.split(/\s+/).filter(Boolean).map((s) => ({ freq: NOTES[s] ?? 0 }));
}

// Ambient noise bed — the "room tone" of orbit: a lowpassed rumble felt more
// than heard, plus a faint high hiss. Looped from the shared noise buffer.
function noiseBed(ctx: AudioContext, dest: GainNode): { stop: () => void } {
  const buf = getNoiseBuffer();
  if (!buf) return { stop() { /* nothing started */ } };
  const now = ctx.currentTime;

  const rumble = ctx.createBufferSource();
  rumble.buffer = buf;
  rumble.loop = true;
  const rumbleLpf = ctx.createBiquadFilter();
  rumbleLpf.type = 'lowpass';
  rumbleLpf.frequency.value = 110;
  const rumbleGain = ctx.createGain();
  rumbleGain.gain.setValueAtTime(0.0001, now);
  rumbleGain.gain.linearRampToValueAtTime(0.09, now + 2.5); // slow fade-in
  rumble.connect(rumbleLpf).connect(rumbleGain).connect(dest);
  rumble.start(now);

  const hiss = ctx.createBufferSource();
  hiss.buffer = buf;
  hiss.loop = true;
  const hissBpf = ctx.createBiquadFilter();
  hissBpf.type = 'bandpass';
  hissBpf.frequency.value = 4500;
  hissBpf.Q.value = 0.5;
  const hissGain = ctx.createGain();
  hissGain.gain.setValueAtTime(0.0001, now);
  hissGain.gain.linearRampToValueAtTime(0.012, now + 4);
  hiss.connect(hissBpf).connect(hissGain).connect(dest);
  hiss.start(now);

  return {
    stop() {
      const t = ctx.currentTime;
      rumbleGain.gain.setTargetAtTime(0.0001, t, 0.2);
      hissGain.gain.setTargetAtTime(0.0001, t, 0.2);
      try { rumble.stop(t + 1); hiss.stop(t + 1); } catch { /* already stopped */ }
    },
  };
}

// Ambient gameplay bed: slow, sparse, lots of rests. Layer lengths 7 / 5 / 11
// are mutually coprime, so the full pattern only repeats after 385 steps.
export function ambientBGM(ctx: AudioContext, dest: GainNode) {
  const bed = noiseBed(ctx, dest);
  const seq = sequencer(ctx, dest, [
    // Pad chord movement — long sine swells (Am → C → F → G feel)
    { notes: parse('A3 C4 F3 E4 G3 D4 C4'), type: 'sine', gain: 0.13, duration: 3.2, attack: 1.0, lpf: 1400 },
    // Sub bass foundation
    { notes: parse('A2 R E2 R G2'), type: 'triangle', gain: 0.16, duration: 2.6, attack: 0.4, lpf: 500 },
    // Sparse high texture — most steps rest
    { notes: parse('R R E5 R R G5 R C5 R R A4'), type: 'sine', gain: 0.05, duration: 1.6, attack: 0.05, lpf: 3000 },
  ], 56, 1); // 56 cpm, 1 step per beat ≈ one event per second
  return {
    stop() {
      seq.stop();
      bed.stop();
    },
  };
}

// Cinematic tension: faster pulse, dissonant minor, building. For L3/L4/L6.
// Anti-repetition: the ostinato cycles through 3 phrase variants (24-step
// effective line), the lead is 13 steps (coprime with 24 and 3 → the full
// texture only realigns after 312 steps ≈ 111s), notes are randomly dropped
// and humanized, and the ostinato's filter breathes over ~23s. Only the
// heartbeat stays rigid — it's the anchor the rest drifts against.
export function tensionBGM(ctx: AudioContext, dest: GainNode) {
  return sequencer(ctx, dest, [
    // Pulsing low ostinato — three variations of the same figure
    {
      notes: parse('A2 A2 A2 B2 A2 A2 G2 A2'),
      variants: [
        parse('A2 A2 A2 B2 A2 A2 G2 A2'),
        parse('A2 A2 C3 A2 B2 A2 G2 B2'),
        parse('A2 E2 A2 B2 C3 A2 G2 A2'),
      ],
      type: 'sawtooth', gain: 0.10, duration: 0.35, attack: 0.01, lpf: 700,
      skipChance: 0.10, humanize: 0.4, lpfDrift: 0.6,
    },
    // Slow ominous lead — 13 steps, wanders instead of circling
    {
      notes: parse('E4 R F4 R D4 R R E4 R C4 R R B3'),
      type: 'triangle', gain: 0.10, duration: 1.4, attack: 0.3, lpf: 1600,
      skipChance: 0.15, humanize: 0.3,
    },
    // Heartbeat-ish sub pulse, length 3 — steady on purpose
    { notes: parse('A2 R R'), type: 'sine', gain: 0.20, duration: 0.5, attack: 0.01, lpf: 300, humanize: 0.15 },
  ], 84, 2);
}
