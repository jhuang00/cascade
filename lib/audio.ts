// Cascade audio engine — zero-dependency Web Audio API synthesis.
// Signal graph:  sources → sfxGain / musicGain → master (mute) → limiter → destination

let ctx: AudioContext | null = null;
let master: GainNode | null = null;        // mute control point (0 or 1)
let sfxGain: GainNode | null = null;       // all one-shot SFX
let musicGain: GainNode | null = null;     // BGM sequencer bus
let noiseBuffer: AudioBuffer | null = null; // reusable white noise, built once
let muted = false;
let resumeBound = false;

// Bus levels (master stays at 1/0 for instant mute). SFX level here matches the
// old master gain of 0.5 so existing per-sound gains keep their tuned loudness.
const SFX_LEVEL = 0.5;
const MUSIC_LEVEL = 0.6;

export function initAudio(): void {
  if (ctx) {
    void ctx.resume();
    return;
  }
  ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();

  // Limiter catches stacked-explosion peaks before they clip the output.
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -6;
  limiter.knee.value = 0;
  limiter.ratio.value = 14;
  limiter.attack.value = 0.003;
  limiter.release.value = 0.25;
  limiter.connect(ctx.destination);

  master = ctx.createGain();
  master.gain.value = muted ? 0 : 1;
  master.connect(limiter);

  sfxGain = ctx.createGain();
  sfxGain.gain.value = SFX_LEVEL;
  sfxGain.connect(master);

  musicGain = ctx.createGain();
  musicGain.gain.value = MUSIC_LEVEL;
  musicGain.connect(master);

  // One reusable 2s white-noise buffer for slice/explosion textures —
  // avoids allocating + filling a fresh buffer on every cut.
  const len = Math.floor(ctx.sampleRate * 2);
  noiseBuffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;

  // Suspended contexts (tab backgrounding, iOS interruptions) resume on return.
  void ctx.resume();
  if (!resumeBound && typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && ctx && ctx.state === 'suspended') void ctx.resume();
    });
    resumeBound = true;
  }
}

export function setMuted(m: boolean): void {
  muted = m;
  if (master) master.gain.value = muted ? 0 : 1;
  if (muted) stopMusic();
}

export function isMuted(): boolean {
  return muted;
}

// --- Music bus (BGM sequencer lives in lib/music.ts) ---

export type MusicPattern = (ctx: AudioContext, dest: GainNode) => { stop: () => void };
let currentMusic: { stop: () => void } | null = null;

export function startMusic(patternFn: MusicPattern): void {
  if (!ctx || !musicGain || muted) return;
  stopMusic();
  try {
    currentMusic = patternFn(ctx, musicGain);
  } catch (e) {
    console.warn('[audio] BGM error:', e);
  }
}

export function stopMusic(): void {
  if (currentMusic) {
    try { currentMusic.stop(); } catch { /* already stopped */ }
    currentMusic = null;
  }
}

// --- One-shot SFX ---

// Slice — a soft knife cut ("shhk"): pure filtered noise, no tonal layer. A
// modest downward bandpass sweep gives the "shng" of a blade pulling through;
// a lowpass tames the harsh top so it doesn't read as too sharp. Soft attack
// avoids the slap-click. Every parameter jitters so no two slices match.
export function playSlice(): void {
  if (!ctx || !sfxGain || !noiseBuffer || muted) return;
  const now = ctx.currentTime;
  const dur = 0.09 + Math.random() * 0.04;

  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const offset = Math.random() * (2 - dur);

  // Gentle highpass thins the low thump but leaves some body.
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 350 + Math.random() * 100;

  // Focused-but-not-whistly bandpass, swept modestly downward.
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 1.2 + Math.random() * 0.6;
  bp.frequency.setValueAtTime(2800 + Math.random() * 700, now);
  bp.frequency.exponentialRampToValueAtTime(1200 + Math.random() * 400, now + dur);

  // Lowpass removes the sharp "tss" so the cut stays warm.
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 4500 + Math.random() * 500;

  const gain = ctx.createGain();
  const peak = 0.22 + Math.random() * 0.08;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  src.connect(hp);
  hp.connect(bp);
  bp.connect(lp);
  lp.connect(gain);
  gain.connect(sfxGain);
  src.start(now, offset, dur);
}

export function playCollect(): void {
  if (!ctx || !sfxGain || muted) return;
  const notes = [659.25, 987.77];
  notes.forEach((freq, i) => {
    const delay = i * 0.045;
    const osc = ctx!.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ctx!.createGain();
    const now = ctx!.currentTime + delay;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc.connect(gain);
    gain.connect(sfxGain!);
    osc.start(now);
    osc.stop(now + 0.5);
  });
}

export function playActiveHit(): void {
  if (!ctx || !sfxGain || muted) return;
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.35);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}

export function playClick(): void {
  if (!ctx || !sfxGain || muted) return;
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = 800;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

export function playLevelWin(): void {
  if (!ctx || !sfxGain || muted) return;
  const notes = [523.25, 659.25, 783.99];
  notes.forEach((freq, i) => {
    const delay = i * 0.1;
    const osc = ctx!.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ctx!.createGain();
    const now = ctx!.currentTime + delay;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
    osc.connect(gain);
    gain.connect(sfxGain!);
    osc.start(now);
    osc.stop(now + 0.6);
  });
}

export function playLevelLose(): void {
  if (!ctx || !sfxGain || muted) return;
  const notes = [392.00, 311.13];
  notes.forEach((freq, i) => {
    const delay = i * 0.18;
    const osc = ctx!.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const gain = ctx!.createGain();
    const now = ctx!.currentTime + delay;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
    osc.connect(gain);
    gain.connect(sfxGain!);
    osc.start(now);
    osc.stop(now + 0.7);
  });
}

export function playMissileLaunch(): void {
  if (!ctx || !sfxGain || muted) return;
  const dur = 2.8;
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(180, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + dur);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + dur * 0.9);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 2000;
  filter.Q.value = 2;
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain);
  osc.start();
  osc.stop(ctx.currentTime + dur);
}

export function playExplosion(): void {
  if (!ctx || !sfxGain || !noiseBuffer || muted) return;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(70, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.6);
  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0.45, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  osc.connect(gain1);
  gain1.connect(sfxGain);
  osc.start();
  osc.stop(ctx.currentTime + 0.6);

  // High crackle from the shared noise buffer.
  const now = ctx.currentTime;
  const crackleDur = 0.5;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const offset = Math.random() * (2 - crackleDur);
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 600;
  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.32, now);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + crackleDur);
  src.connect(filter);
  filter.connect(gain2);
  gain2.connect(sfxGain);
  src.start(now, offset, crackleDur);
}

// L6 cascade — a dissonant, swelling "control is slipping" drone.
export function playCascade(): void {
  if (!ctx || !sfxGain || muted) return;
  const dur = 2.2;
  const now = ctx.currentTime;
  // Two detuned low sawtooths beating against each other for unease.
  [88, 92.5].forEach((freq) => {
    const osc = ctx!.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + dur);
    const gain = ctx!.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.22, now + dur * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    const filter = ctx!.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);
    filter.frequency.exponentialRampToValueAtTime(1400, now + dur);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(sfxGain!);
    osc.start(now);
    osc.stop(now + dur);
  });
}
