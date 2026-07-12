// Cascade audio engine — zero-dependency Web Audio API synthesis.
// Signal graph:
//   sources → [StereoPanner] → sfxGain ─┬→ master (mute) → limiter → destination
//                                       └→ reverbSend → convolver → reverbReturn → master
//   music sequencer ────────→ musicGain ─┴ (smaller reverb send)

let ctx: AudioContext | null = null;
let master: GainNode | null = null;        // mute control point (0 or 1)
let sfxGain: GainNode | null = null;       // all one-shot SFX
let musicGain: GainNode | null = null;     // BGM sequencer bus
let noiseBuffer: AudioBuffer | null = null; // reusable white noise, built once
let reverb: ConvolverNode | null = null;   // shared space, generated impulse
let muted = false;
let resumeBound = false;

// Bus levels (master stays at 1/0 for instant mute). SFX level here matches the
// old master gain of 0.5 so existing per-sound gains keep their tuned loudness.
const SFX_LEVEL = 0.5;
const MUSIC_LEVEL = 0.6;
const SFX_REVERB_SEND = 0.16;
const MUSIC_REVERB_SEND = 0.10;

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

  // Shared reverb: generated stereo impulse (decaying noise burst) gives the
  // dry synths a sense of space without any audio assets.
  reverb = ctx.createConvolver();
  reverb.buffer = makeImpulse(ctx, 1.5, 2.8);
  const reverbReturn = ctx.createGain();
  reverbReturn.gain.value = 1;
  reverb.connect(reverbReturn);
  reverbReturn.connect(master);

  const sfxSend = ctx.createGain();
  sfxSend.gain.value = SFX_REVERB_SEND;
  sfxGain.connect(sfxSend);
  sfxSend.connect(reverb);

  const musicSend = ctx.createGain();
  musicSend.gain.value = MUSIC_REVERB_SEND;
  musicGain.connect(musicSend);
  musicSend.connect(reverb);

  // Suspended contexts (tab backgrounding, iOS interruptions) resume on return.
  void ctx.resume();
  if (!resumeBound && typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && ctx && ctx.state === 'suspended') void ctx.resume();
    });
    resumeBound = true;
  }
}

// Stereo impulse response: white noise with an exponential decay tail.
function makeImpulse(c: AudioContext, seconds: number, decay: number): AudioBuffer {
  const len = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
  }
  return buf;
}

// Music patterns need the shared noise buffer for ambient beds.
export function getNoiseBuffer(): AudioBuffer | null {
  return noiseBuffer;
}

export function setMuted(m: boolean): void {
  muted = m;
  if (master) master.gain.value = muted ? 0 : 1;
  if (muted) stopMusic();
}

export function isMuted(): boolean {
  return muted;
}

// Pan helper: world x → stereo position, clamped so nothing sits hard L/R.
export function panFromX(x: number, worldW: number): number {
  const p = (x / worldW) * 2 - 1;
  return Math.max(-0.85, Math.min(0.85, p));
}

// Returns the node a voice should connect into: a per-voice panner routed to
// the SFX bus, or the bus itself when no pan is requested.
function sfxOut(pan?: number): AudioNode {
  if (pan !== undefined && pan !== 0 && ctx && typeof ctx.createStereoPanner === 'function') {
    const p = ctx.createStereoPanner();
    p.pan.value = pan;
    p.connect(sfxGain!);
    return p;
  }
  return sfxGain!;
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
  stopCascadeLayer();
}

// --- L6 cascade layer — continuous "control is slipping" drone ---
// Intensity follows the density meter (0–100). Silent below the onset band,
// then two beating saws + rising hiss open up as density climbs. Smoothed
// with setTargetAtTime so meter jitter never causes zipper noise.

const CASCADE_ONSET = 20; // density where the layer becomes audible

interface CascadeLayer {
  oscA: OscillatorNode;
  oscB: OscillatorNode;
  hiss: AudioBufferSourceNode;
  gain: GainNode;
  hissGain: GainNode;
  lpf: BiquadFilterNode;
}
let cascadeLayer: CascadeLayer | null = null;

export function setCascadeIntensity(density: number): void {
  if (!ctx || !musicGain || !noiseBuffer || muted) return;
  const t = Math.max(0, Math.min(1, (density - CASCADE_ONSET) / (100 - CASCADE_ONSET)));

  if (!cascadeLayer) {
    if (t <= 0) return; // nothing to hear yet — don't build the graph
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    const lpf = ctx.createBiquadFilter();
    lpf.type = 'lowpass';
    lpf.frequency.value = 300;
    lpf.connect(gain);
    gain.connect(musicGain);

    const oscA = ctx.createOscillator();
    oscA.type = 'sawtooth';
    oscA.frequency.value = 55; // A1 — same root as the score
    const oscB = ctx.createOscillator();
    oscB.type = 'sawtooth';
    oscB.frequency.value = 55.6;
    oscA.connect(lpf);
    oscB.connect(lpf);
    oscA.start();
    oscB.start();

    const hiss = ctx.createBufferSource();
    hiss.buffer = noiseBuffer;
    hiss.loop = true;
    const hp = ctx.createBiquadFilter();
    hp.type = 'highpass';
    hp.frequency.value = 1200;
    const hissGain = ctx.createGain();
    hissGain.gain.value = 0.0001;
    hiss.connect(hp);
    hp.connect(hissGain);
    hissGain.connect(musicGain);
    hiss.start();

    cascadeLayer = { oscA, oscB, hiss, gain, hissGain, lpf };
  }

  const now = ctx.currentTime;
  const L = cascadeLayer;
  // Loudness, beat rate, and brightness all escalate with density.
  L.gain.gain.setTargetAtTime(0.0001 + t * 0.15, now, 0.4);
  L.hissGain.gain.setTargetAtTime(t * t * 0.05, now, 0.6);
  L.lpf.frequency.setTargetAtTime(300 + t * 1900, now, 0.5);
  L.oscB.frequency.setTargetAtTime(55 * (1.01 + t * 0.05), now, 0.5);
}

export function stopCascadeLayer(): void {
  if (!cascadeLayer || !ctx) {
    cascadeLayer = null;
    return;
  }
  const L = cascadeLayer;
  cascadeLayer = null;
  const now = ctx.currentTime;
  L.gain.gain.setTargetAtTime(0.0001, now, 0.15);
  L.hissGain.gain.setTargetAtTime(0.0001, now, 0.15);
  const stopAt = now + 1;
  try { L.oscA.stop(stopAt); L.oscB.stop(stopAt); L.hiss.stop(stopAt); } catch { /* already stopped */ }
}

// --- Slice SFX ---
// Three candidate designs, selectable at runtime (audio lab A/Bs them; the
// picked variant persists so in-game play uses it too). All variants share
// velocity sensitivity (gesture speed → brighter/louder) and per-object
// flavor (fragments are smaller/higher, rares softer/warmer).

export type SliceVariant = 'A' | 'B' | 'C';
export type SliceFlavor = 'junk' | 'rare' | 'fragment';
export interface SliceOpts {
  pan?: number;      // -1..1
  velocity?: number; // 0..1 gesture speed
  flavor?: SliceFlavor;
}

// Production pick (July 2026 listening session): B — metallic shear.
const SLICE_VARIANT_KEY = 'cascade-slice-variant';
let sliceVariant: SliceVariant = 'B';
if (typeof window !== 'undefined') {
  try {
    const v = localStorage.getItem(SLICE_VARIANT_KEY);
    if (v === 'A' || v === 'B' || v === 'C') sliceVariant = v;
  } catch { /* ignore */ }
}

export function setSliceVariant(v: SliceVariant): void {
  sliceVariant = v;
  try { localStorage.setItem(SLICE_VARIANT_KEY, v); } catch { /* ignore */ }
}

export function getSliceVariant(): SliceVariant {
  return sliceVariant;
}

interface FlavorMods { pitch: number; dur: number; gain: number; lpf: number }
function flavorMods(flavor: SliceFlavor): FlavorMods {
  switch (flavor) {
    case 'fragment': return { pitch: 1.45, dur: 0.7, gain: 0.8, lpf: 1.15 };
    case 'rare':     return { pitch: 0.85, dur: 1.1, gain: 0.75, lpf: 0.7 };
    default:         return { pitch: 1, dur: 1, gain: 1, lpf: 1 };
  }
}

export function playSlice(opts: SliceOpts = {}): void {
  playSliceVariant(sliceVariant, opts);
}

export function playSliceVariant(variant: SliceVariant, opts: SliceOpts = {}): void {
  if (!ctx || !sfxGain || !noiseBuffer || muted) return;
  const out = sfxOut(opts.pan);
  const vel = opts.velocity ?? 0.5;
  const mods = flavorMods(opts.flavor ?? 'junk');
  if (variant === 'A') sliceLayeredKnife(out, vel, mods);
  else if (variant === 'B') sliceMetallicShear(out, vel, mods);
  else sliceWarmCut(out, vel, mods);
}

// Short broadband tick — the instant the blade first bites. Shared by all
// variants; `bright` trades a glassy edge (A/B) for a padded thump (C).
function sliceTransient(out: AudioNode, level: number, bright: boolean): void {
  const now = ctx!.currentTime;
  const src = ctx!.createBufferSource();
  src.buffer = noiseBuffer!;
  const dur = 0.008;
  const filt = ctx!.createBiquadFilter();
  if (bright) {
    filt.type = 'highpass';
    filt.frequency.value = 2000;
  } else {
    filt.type = 'lowpass';
    filt.frequency.value = 3000;
  }
  const g = ctx!.createGain();
  g.gain.setValueAtTime(level, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  src.connect(filt);
  filt.connect(g);
  g.connect(out);
  src.start(now, Math.random() * 1.5, dur);
}

// The current production sound: band-swept noise body ("shhk").
function sliceBody(out: AudioNode, vel: number, mods: FlavorMods, durMul: number, lpfBase: number): number {
  const now = ctx!.currentTime;
  const dur = (0.09 + Math.random() * 0.04) * mods.dur * durMul;
  const src = ctx!.createBufferSource();
  src.buffer = noiseBuffer!;
  const offset = Math.random() * (2 - dur);

  const hp = ctx!.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 350 + Math.random() * 100;

  const bp = ctx!.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 1.2 + Math.random() * 0.6;
  const startF = (2800 + Math.random() * 700) * mods.pitch * (0.9 + vel * 0.3);
  bp.frequency.setValueAtTime(startF, now);
  bp.frequency.exponentialRampToValueAtTime((1200 + Math.random() * 400) * mods.pitch, now + dur);

  const lp = ctx!.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = (lpfBase + Math.random() * 500) * mods.lpf;

  const gain = ctx!.createGain();
  const peak = (0.2 + Math.random() * 0.06 + vel * 0.08) * mods.gain;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(peak, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  src.connect(hp);
  hp.connect(bp);
  bp.connect(lp);
  lp.connect(gain);
  gain.connect(out);
  src.start(now, offset, dur);
  return dur;
}

// Candidate A — layered knife: transient bite + noise body + a fast-decaying
// metallic shimmer (detuned high partials), like a blade ringing off alloy.
function sliceLayeredKnife(out: AudioNode, vel: number, mods: FlavorMods): void {
  const now = ctx!.currentTime;
  sliceTransient(out, (0.22 + vel * 0.1) * mods.gain, true);
  sliceBody(out, vel, mods, 1, 4500);

  const partials = [3150, 4400, 6100];
  const gains = [0.05, 0.035, 0.022];
  for (let i = 0; i < partials.length; i++) {
    const osc = ctx!.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = partials[i] * mods.pitch * (1 + (Math.random() - 0.5) * 0.06);
    const g = ctx!.createGain();
    const decay = 0.05 + Math.random() * 0.07;
    g.gain.setValueAtTime((gains[i] + vel * 0.02) * mods.gain, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + decay);
    osc.connect(g);
    g.connect(out);
    osc.start(now);
    osc.stop(now + decay + 0.02);
  }
}

// Candidate B — metallic shear: noise driven through a comb resonance (short
// feedback delay) so the cut "shings" at a metallic pitch that varies per hit.
function sliceMetallicShear(out: AudioNode, vel: number, mods: FlavorMods): void {
  const now = ctx!.currentTime;
  sliceTransient(out, (0.2 + vel * 0.1) * mods.gain, true);

  const dur = (0.13 + Math.random() * 0.05) * mods.dur;
  const src = ctx!.createBufferSource();
  src.buffer = noiseBuffer!;
  const offset = Math.random() * (2 - dur);

  const bp = ctx!.createBiquadFilter();
  bp.type = 'bandpass';
  bp.Q.value = 0.9;
  bp.frequency.setValueAtTime(1800 * mods.pitch * (0.9 + vel * 0.3), now);
  bp.frequency.exponentialRampToValueAtTime(900 * mods.pitch, now + dur);

  // Comb: delay tuned to a metallic fundamental, feedback ringing it out.
  const f0 = (550 + Math.random() * 300) * mods.pitch;
  const delay = ctx!.createDelay(0.01);
  delay.delayTime.value = 1 / f0;
  const fb = ctx!.createGain();
  fb.gain.value = 0.8;
  delay.connect(fb);
  fb.connect(delay);

  const lp = ctx!.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 5200 * mods.lpf;

  const env = ctx!.createGain();
  const peak = (0.16 + Math.random() * 0.05 + vel * 0.07) * mods.gain;
  env.gain.setValueAtTime(0.0001, now);
  env.gain.linearRampToValueAtTime(peak, now + 0.004);
  env.gain.exponentialRampToValueAtTime(0.0001, now + dur + 0.08);

  src.connect(bp);
  bp.connect(delay);
  bp.connect(lp); // direct path keeps some noise body under the ring
  delay.connect(lp);
  lp.connect(env);
  env.connect(out);
  src.start(now, offset, dur);
}

// Candidate C — enhanced warm cut: the production sound with a soft transient
// and a longer, darkening tail. Closest to the current feel.
function sliceWarmCut(out: AudioNode, vel: number, mods: FlavorMods): void {
  sliceTransient(out, (0.14 + vel * 0.08) * mods.gain, false);
  sliceBody(out, vel, mods, 1.6, 4800);
}

// --- Other one-shot SFX ---

export function playCollect(pan?: number): void {
  if (!ctx || !sfxGain || muted) return;
  const out = sfxOut(pan);
  const notes = [659.25, 987.77]; // E5 → B5, both in A minor
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
    gain.connect(out);
    osc.start(now);
    osc.stop(now + 0.5);
  });
}

export function playActiveHit(pan?: number): void {
  if (!ctx || !sfxGain || muted) return;
  const out = sfxOut(pan);
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.35);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.connect(gain);
  gain.connect(out);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}

export function playClick(): void {
  if (!ctx || !sfxGain || muted) return;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 880; // A5 — in key, soft confirmation
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
  osc.connect(gain);
  gain.connect(sfxGain);
  osc.start();
  osc.stop(ctx.currentTime + 0.06);
}

export function playLevelWin(): void {
  if (!ctx || !sfxGain || muted) return;
  const notes = [440.00, 523.25, 659.25]; // A4 C5 E5 — A minor, matches the score
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
  const notes = [349.23, 329.63, 220.00]; // F4 → E4 → A3 lament, stays in key
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

export function playExplosion(pan?: number): void {
  if (!ctx || !sfxGain || !noiseBuffer || muted) return;
  const out = sfxOut(pan);
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(70, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.6);
  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0.45, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  osc.connect(gain1);
  gain1.connect(out);
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
  gain2.connect(out);
  src.start(now, offset, crackleDur);
}
