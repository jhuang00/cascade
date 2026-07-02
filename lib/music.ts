// BGM patterns — look-ahead step sequencer over the Web Audio API.
// Schedules notes ~100ms ahead on a 25ms timer for sample-accurate, drift-free
// timing. Patterns route into the music bus (musicGain) passed by lib/audio.ts.

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
        const n = layer.notes[stepIndex % layer.notes.length];
        const freq = n.freq;
        if (freq > 0) {
          const dur = n.duration ?? layer.duration ?? stepDuration;
          const peak = n.gain ?? layer.gain ?? 0.12;
          const attack = n.attack ?? layer.attack ?? 0.01;
          const t = nextStepTime;

          const osc = ctx.createOscillator();
          osc.type = n.type ?? layer.type ?? 'sine';
          osc.frequency.setValueAtTime(freq, t);
          if (n.freqEnd) osc.frequency.exponentialRampToValueAtTime(n.freqEnd, t + dur);

          const g = ctx.createGain();
          g.gain.setValueAtTime(0.0001, t);
          g.gain.linearRampToValueAtTime(peak, t + Math.min(attack, dur * 0.5));
          g.gain.exponentialRampToValueAtTime(0.0001, t + dur);

          const f = ctx.createBiquadFilter();
          f.type = 'lowpass';
          f.frequency.setValueAtTime(n.lpf ?? layer.lpf ?? 2000, t);

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

// Ambient gameplay bed: slow, sparse, lots of rests. Layer lengths 7 / 5 / 11
// are mutually coprime, so the full pattern only repeats after 385 steps.
export function ambientBGM(ctx: AudioContext, dest: GainNode) {
  return sequencer(ctx, dest, [
    // Pad chord movement — long sine swells (Am → C → F → G feel)
    { notes: parse('A3 C4 F3 E4 G3 D4 C4'), type: 'sine', gain: 0.13, duration: 3.2, attack: 1.0, lpf: 1400 },
    // Sub bass foundation
    { notes: parse('A2 R E2 R G2'), type: 'triangle', gain: 0.16, duration: 2.6, attack: 0.4, lpf: 500 },
    // Sparse high texture — most steps rest
    { notes: parse('R R E5 R R G5 R C5 R R A4'), type: 'sine', gain: 0.05, duration: 1.6, attack: 0.05, lpf: 3000 },
  ], 56, 1); // 56 cpm, 1 step per beat ≈ one event per second
}

// Cinematic tension: faster pulse, dissonant minor, building. For L3/L4/L6.
export function tensionBGM(ctx: AudioContext, dest: GainNode) {
  return sequencer(ctx, dest, [
    // Pulsing low ostinato
    { notes: parse('A2 A2 A2 B2 A2 A2 G2 A2'), type: 'sawtooth', gain: 0.10, duration: 0.35, attack: 0.01, lpf: 700 },
    // Slow ominous lead, different length (5) for drift
    { notes: parse('E4 R F4 R D4'), type: 'triangle', gain: 0.10, duration: 1.4, attack: 0.3, lpf: 1600 },
    // Heartbeat-ish sub pulse, length 3
    { notes: parse('A2 R R'), type: 'sine', gain: 0.20, duration: 0.5, attack: 0.01, lpf: 300 },
  ], 84, 2);
}
