import type { GameObject, Vertex, CatalogEntry } from '@/lib/types';
import { junkCatalog, activeCatalog, rareCatalog } from '@/data/catalog';

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

export function spawnJunk(W: number, H: number): GameObject {
  const fromLeft = Math.random() > 0.5;
  const x = fromLeft ? 40 + Math.random() * W * 0.25 : W - 40 - Math.random() * W * 0.25;
  const targetX = fromLeft ? W * 0.55 + Math.random() * W * 0.35 : W * 0.1 + Math.random() * W * 0.35;
  const r = 16 + Math.random() * 8;
  return {
    type: 'junk',
    x,
    y: H + 30,
    vx: (targetX - x) / 95,
    vy: -10.5 - Math.random() * 2.5,
    rot: Math.random() * Math.PI * 2,
    vrot: (Math.random() - 0.5) * 0.07,
    verts: makePoly(r),
    color: pickOne(JUNK_PALETTE),
    r,
    label: catalogLabel(pickOne(junkCatalog)),
  };
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
