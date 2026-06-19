let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

export function initAudio(): void {
  if (ctx) return;
  ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 0.5;
  master.connect(ctx.destination);
}

export function setMuted(m: boolean): void {
  muted = m;
  if (master) master.gain.value = muted ? 0 : 0.5;
}

export function isMuted(): boolean {
  return muted;
}

export function playSlice(): void {
  if (!ctx || !master || muted) return;
  const dur = 0.12;
  const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate;
    data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 28);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 3500;
  filter.Q.value = 1.2;
  const gain = ctx.createGain();
  gain.gain.value = 0.35;
  src.connect(filter);
  filter.connect(gain);
  gain.connect(master);
  src.start();
}

export function playCollect(): void {
  if (!ctx || !master || muted) return;
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
    gain.connect(master!);
    osc.start(now);
    osc.stop(now + 0.5);
  });
}

export function playActiveHit(): void {
  if (!ctx || !master || muted) return;
  const osc = ctx.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.35);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.18, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.connect(gain);
  gain.connect(master);
  osc.start();
  osc.stop(ctx.currentTime + 0.4);
}

export function playClick(): void {
  if (!ctx || !master || muted) return;
  const osc = ctx.createOscillator();
  osc.type = 'square';
  osc.frequency.value = 800;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.05, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
  osc.connect(gain);
  gain.connect(master);
  osc.start();
  osc.stop(ctx.currentTime + 0.05);
}

export function playLevelWin(): void {
  if (!ctx || !master || muted) return;
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
    gain.connect(master!);
    osc.start(now);
    osc.stop(now + 0.6);
  });
}

export function playLevelLose(): void {
  if (!ctx || !master || muted) return;
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
    gain.connect(master!);
    osc.start(now);
    osc.stop(now + 0.7);
  });
}

export function playMissileLaunch(): void {
  if (!ctx || !master || muted) return;
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
  gain.connect(master);
  osc.start();
  osc.stop(ctx.currentTime + dur);
}

export function playExplosion(): void {
  if (!ctx || !master || muted) return;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(70, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 0.6);
  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0.45, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  osc.connect(gain1);
  gain1.connect(master);
  osc.start();
  osc.stop(ctx.currentTime + 0.6);

  const buf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / ctx.sampleRate;
    data[i] = (Math.random() * 2 - 1) * Math.exp(-t * 6);
  }
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 600;
  const gain2 = ctx.createGain();
  gain2.gain.value = 0.32;
  src.connect(filter);
  filter.connect(gain2);
  gain2.connect(master);
  src.start();
}
