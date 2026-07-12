import type { GameObject, Vertex, CatalogEntry } from '@/lib/types';
import { junkCatalog, activeCatalog, rareCatalog, l4CollisionFragment } from '@/data/catalog';

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

function catalogLabel(entry: CatalogEntry): string {
  return `${entry.name} · ${entry.year} · ${entry.flag}`;
}

const JUNK_PALETTE = ['#9aa0aa', '#7c8088', '#a8acb6', '#b89878', '#8a8e98', '#c4956a'];

// withFragmentation=true causes junk to split mid-flight (L2+).
// speedScale multiplies launch velocity — per-level tuning lever (data/levels.ts junkSpeed).
export function spawnJunk(W: number, H: number, withFragmentation = false, speedScale = 1): GameObject {
  const fromLeft = Math.random() > 0.5;
  const x = fromLeft ? 40 + Math.random() * W * 0.25 : W - 40 - Math.random() * W * 0.25;
  const targetX = fromLeft ? W * 0.55 + Math.random() * W * 0.35 : W * 0.1 + Math.random() * W * 0.35;
  const r = 16 + Math.random() * 8;
  const shouldFragment = withFragmentation && Math.random() < 0.3;
  return {
    type: 'junk',
    x,
    y: H + 30,
    vx: ((targetX - x) / 95) * speedScale,
    vy: (-10.5 - Math.random() * 2.5) * speedScale,
    rot: Math.random() * Math.PI * 2,
    vrot: (Math.random() - 0.5) * 0.07,
    verts: makePoly(r),
    color: pickOne(JUNK_PALETTE),
    r,
    label: catalogLabel(pickOne(junkCatalog)),
    fragmentsAt: shouldFragment ? H * 0.35 + Math.random() * H * 0.2 : undefined,
  };
}

// Spawn two child pieces when a junk fragment splits
export function spawnJunkSplit(parent: GameObject): [GameObject, GameObject] {
  const r = parent.r * 0.6;
  // Gentle drift only: children continue at the parent's pace and separate
  // visually — a strong kick here reads as debris suddenly speeding up.
  const spread = 0.2 + Math.random() * 0.15;
  const a = Math.random() * Math.PI * 2;
  const base: Omit<GameObject, 'x' | 'y' | 'vx' | 'vy'> = {
    type: 'junk',
    rot: Math.random() * Math.PI * 2,
    vrot: (Math.random() - 0.5) * 0.12,
    verts: makePoly(r),
    color: parent.color,
    r,
    label: parent.label,
    fragmented: true,
  };
  return [
    {
      ...base,
      x: parent.x,
      y: parent.y,
      vx: parent.vx + Math.cos(a) * spread,
      vy: parent.vy + Math.sin(a) * spread,
    },
    {
      ...base,
      x: parent.x,
      y: parent.y,
      vx: parent.vx - Math.cos(a) * spread,
      vy: parent.vy - Math.sin(a) * spread,
      verts: makePoly(r),
    },
  ];
}

export function spawnFragment(cx: number, cy: number): GameObject {
  const ang = Math.random() * Math.PI * 2;
  const spd = 2.5 + Math.random() * 5;
  const r = 6 + Math.random() * 5;
  return {
    type: 'fragment',
    x: cx,
    y: cy,
    vx: Math.cos(ang) * spd,
    vy: Math.sin(ang) * spd,
    rot: Math.random() * Math.PI * 2,
    vrot: (Math.random() - 0.5) * 0.2,
    verts: makePoly(r),
    color: pickOne(JUNK_PALETTE),
    r,
    label: 'FY-1C fragment · 2007 · CHN',
  };
}

// L4: Iridium 33 (active satellite, enters from right)
export function spawnIridium33(W: number): GameObject {
  return {
    type: 'active',
    x: W + 30,
    y: 270,
    vx: 0,
    vy: 0,
    xStart: W + 30,
    xEnd: -30,
    yBaseline: 270,
    arcHeight: 110,
    direction: -1,
    speed: 0.95,
    rot: 0,
    vrot: 0.003,
    r: 15,
    color: '#5fb3ff',
    label: 'IRIDIUM 33 · 1997 · USA',
    sublabel: 'operational · 560 kg · 790 km altitude',
    glowPhase: 0,
    pulse: 0,
  };
}

// L4: Cosmos 2251 (dead satellite, enters from left)
export function spawnCosmos2251(W: number, H: number): GameObject {
  return {
    type: 'active',
    x: -30,
    y: H * 0.55,
    vx: 0,
    vy: 0,
    xStart: -30,
    xEnd: W + 30,
    yBaseline: 255,
    arcHeight: 88,
    direction: 1,
    speed: 0.95,
    rot: 0.3,
    vrot: 0.012,
    r: 18,
    color: '#7a7880',
    label: 'COSMOS 2251 · 1993 · RUS',
    sublabel: 'defunct since 1995 · 900 kg · 790 km altitude',
    glowPhase: 0,
    pulse: 0,
    isDeadSat: true,
  };
}

// L4: Collision fragment burst
export function spawnCollisionFragment(cx: number, cy: number): GameObject {
  const ang = Math.random() * Math.PI * 2;
  const spd = 2 + Math.random() * 5.5;
  const r = 5 + Math.random() * 6;
  return {
    type: 'fragment',
    x: cx,
    y: cy,
    vx: Math.cos(ang) * spd,
    vy: Math.sin(ang) * spd,
    rot: Math.random() * Math.PI * 2,
    vrot: (Math.random() - 0.5) * 0.18,
    verts: makePoly(r),
    color: pickOne(['#9aa0aa', '#7c8088', '#a8acb6', '#b89878']),
    r,
    label: catalogLabel(l4CollisionFragment),
  };
}

// L6: Cascade fragment — smaller, faster
export function spawnCascadeJunk(W: number, H: number, speedScale = 1): GameObject {
  const j = spawnJunk(W, H, false, speedScale);
  j.r = Math.max(10, j.r * 0.75);
  j.verts = makePoly(j.r);
  return j;
}

export function spawnActive(W: number, H: number): GameObject {
  const fromLeft = Math.random() > 0.5;
  const xStart = fromLeft ? -30 : W + 30;
  const xEnd = fromLeft ? W + 30 : -30;
  const yBaseline = 240 + Math.random() * 90;
  const arcHeight = 90 + Math.random() * 40;
  const speed = 1.3 + Math.random() * 0.5;
  const direction = fromLeft ? 1 : -1;
  return {
    type: 'active',
    x: xStart,
    y: yBaseline,
    vx: 0,
    vy: 0,
    xStart, xEnd, yBaseline, arcHeight, direction, speed,
    rot: 0,
    vrot: 0.005,
    r: 13,
    color: '#5fb3ff',
    label: pickOne(activeCatalog),
    glowPhase: 0,
  };
}

// L5 variant: wider altitude spread for denser constellation feel
export function spawnActiveDense(W: number, H: number): GameObject {
  const sat = spawnActive(W, H);
  sat.yBaseline = 160 + Math.random() * 200;
  sat.arcHeight = 60 + Math.random() * 60;
  return sat;
}

export function spawnRare(W: number, _H: number): GameObject {
  const fromLeft = Math.random() > 0.5;
  const y = 100 + Math.random() * 240;
  const vx = (fromLeft ? 1 : -1) * (0.5 + Math.random() * 0.4);
  const r = 12;
  const entry = pickOne(rareCatalog);
  return {
    type: 'rare',
    x: fromLeft ? -25 : W + 25,
    y,
    vx,
    vy: 0,
    rot: Math.random() * Math.PI * 2,
    vrot: (Math.random() - 0.5) * 0.02,
    verts: makePoly(r),
    color: '#ffc874',
    r,
    label: catalogLabel(entry),
    pulse: 0,
    bobPhase: Math.random() * Math.PI * 2,
    baseY: y,
  };
}

export function spawnFY1C(): GameObject {
  return {
    type: 'fy1c',
    x: -40,
    y: 150,
    vx: 1.0,
    vy: 0,
    rot: 0,
    vrot: 0,
    r: 16,
    color: '#dfe7f2',
    label: 'FY-1C',
    sublabel: 'Fengyun-1C · weather satellite · decommissioned 2002',
    pulse: 0,
  };
}
