import type { EngineGameState, GameObject, Half, Vertex } from '@/lib/types';

function makePoly(baseR: number): Vertex[] {
  const sides = 5 + Math.floor(Math.random() * 3);
  const verts: Vertex[] = [];
  for (let i = 0; i < sides; i++) {
    const ang = (i / sides) * Math.PI * 2;
    const r = baseR * (0.65 + Math.random() * 0.55);
    verts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
  }
  return verts;
}

function pickOne<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function sliceFx(gs: EngineGameState, o: GameObject): void {
  const ang = Math.random() * Math.PI;
  const burst = 1.8;
  const half: Half = {
    x: o.x, y: o.y, rot: o.rot,
    vx: Math.cos(ang) * burst + (o.vx || 0) * 0.6,
    vy: Math.sin(ang) * burst + (o.vy || 0) * 0.6,
    vrot: 0.12, verts: makePoly(o.r * 0.55), color: o.color, life: 45, maxLife: 45,
  };
  const half2: Half = {
    x: o.x, y: o.y, rot: o.rot,
    vx: -Math.cos(ang) * burst + (o.vx || 0) * 0.6,
    vy: -Math.sin(ang) * burst + (o.vy || 0) * 0.6,
    vrot: -0.12, verts: makePoly(o.r * 0.55), color: o.color, life: 45, maxLife: 45,
  };
  gs.halves.push(half, half2);
  for (let i = 0; i < 14; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 1.2 + Math.random() * 3.5;
    gs.particles.push({ x: o.x, y: o.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 25 + Math.random() * 20, maxLife: 45, color: o.color });
  }
  gs.flashes.push({ x: o.x, y: o.y, r: 4, life: 12, maxLife: 12, color: '#ffffff' });
}

export function collectFx(gs: EngineGameState, o: GameObject): void {
  gs.rings.push({ x: o.x, y: o.y, r: o.r, targetR: o.r * 2.8, life: 30, maxLife: 30, color: '#ffc874' });
  gs.rings.push({ x: o.x, y: o.y, r: o.r * 0.5, targetR: o.r * 1.6, life: 22, maxLife: 22, color: '#ffc874' });
  for (let i = 0; i < 10; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 0.5 + Math.random() * 1.4;
    gs.particles.push({ x: o.x, y: o.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 0.4, life: 40 + Math.random() * 15, maxLife: 55, color: '#ffe0a8' });
  }
}

export function explosionFx(gs: EngineGameState, cx: number, cy: number): void {
  gs.screenFlash = 25;
  gs.shake = 14;
  gs.rings.push({ x: cx, y: cy, r: 8, targetR: 220, life: 40, maxLife: 40, color: 'rgba(255,180,80,0.9)' });
  gs.rings.push({ x: cx, y: cy, r: 4, targetR: 140, life: 30, maxLife: 30, color: 'rgba(255,255,255,0.9)' });
  const palette = ['#ff8a3a', '#ffd070', '#ffffff', '#ff5050', '#ffb070'];
  for (let i = 0; i < 40; i++) {
    const a = Math.random() * Math.PI * 2;
    const s = 3 + Math.random() * 5;
    gs.particles.push({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 40 + Math.random() * 25, maxLife: 65, color: pickOne(palette) });
  }
}

export function reentryBurnupFx(gs: EngineGameState, x: number, H: number): void {
  gs.reentries.push({
    x,
    y: H,
    vy: -1.8,
    life: 50,
    maxLife: 50,
    streakLen: 25 + Math.random() * 15,
    intensity: 1,
  });
  const firePalette = ['#ff8a3a', '#ffb050', '#ffd070', '#ff5050', '#ff7030'];
  for (let i = 0; i < 22; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.4;
    const s = 1.5 + Math.random() * 3;
    gs.particles.push({
      x: x + (Math.random() - 0.5) * 8,
      y: H - 4,
      vx: Math.cos(a) * s * 0.6,
      vy: Math.sin(a) * s,
      life: 30 + Math.random() * 25,
      maxLife: 55,
      color: pickOne(firePalette),
    });
  }
  for (let i = 0; i < 8; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
    const s = 0.8 + Math.random() * 1.5;
    gs.particles.push({
      x: x + (Math.random() - 0.5) * 5,
      y: H - 10,
      vx: Math.cos(a) * s * 0.4,
      vy: Math.sin(a) * s * 0.7,
      life: 50 + Math.random() * 25,
      maxLife: 75,
      color: 'rgba(80, 70, 60, 0.45)',
    });
  }
}
