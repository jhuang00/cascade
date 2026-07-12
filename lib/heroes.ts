// Mission-card hero scenes — static canvases painted ONCE on mount
// (design-refs/cascade-visual.md §13 perf budget: no rAF, repaint only on
// remount). Mood progression per §10: sepia → amber → hot orange →
// blue/amber split → clinical blue → muted cascade red. L1/L2 are ported
// from the reference mockup's drawHero1/drawHero2.

function stars(ctx: CanvasRenderingContext2D, W: number, H: number, n: number, alpha: number, maxY = 0.7): void {
  ctx.fillStyle = `rgba(232,228,212,${alpha})`;
  for (let i = 0; i < n; i++) {
    ctx.fillRect(Math.random() * W, Math.random() * H * maxY, 1, 1);
  }
}

function label(ctx: CanvasRenderingContext2D, H: number, line1: string, line2: string, color1: string): void {
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.fillStyle = color1;
  ctx.fillText(line1, 14, H - 16);
  ctx.fillStyle = 'rgba(160,154,134,0.6)';
  ctx.fillText(line2, 14, H - 4);
}

// L1 — The Quiet: aged archival sepia, sage trace, Vanguard silhouette
function hero1(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0a0d12');
  g.addColorStop(1, '#1a1410');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  const eg = ctx.createRadialGradient(W * 0.7, H + 80, 30, W * 0.7, H + 80, 200);
  eg.addColorStop(0, 'rgba(180, 120, 80, 0.4)');
  eg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = eg; ctx.fillRect(0, 0, W, H);

  stars(ctx, W, H, 24, 0.6);

  const cx = W * 0.45, cy = H * 0.45;
  ctx.strokeStyle = 'rgba(111, 163, 137, 0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(cx, cy, 9, 0, Math.PI * 2); ctx.stroke();
  [0, 90, 180, 270].forEach((deg) => {
    const r = (deg * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(r) * 9, cy + Math.sin(r) * 9);
    ctx.lineTo(cx + Math.cos(r) * 22, cy + Math.sin(r) * 22);
    ctx.stroke();
  });

  ctx.strokeStyle = 'rgba(111, 163, 137, 0.25)';
  ctx.beginPath();
  ctx.ellipse(W / 2, H * 0.55, W * 0.46, 18, -0.1, 0, Math.PI * 2);
  ctx.stroke();

  label(ctx, H, 'VANGUARD 1 · 1958 · USA', 'NORAD 00005', 'rgba(232,228,212,0.7)');
}

// L2 — The Breakup: warm amber, rocket stage fragmenting at the airglow
function hero2(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0d111a');
  g.addColorStop(0.7, '#2a1a14');
  g.addColorStop(1, '#5a2a18');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  const eg = ctx.createRadialGradient(W * 0.6, H + 60, 20, W * 0.6, H + 60, 220);
  eg.addColorStop(0, 'rgba(255, 140, 80, 0.6)');
  eg.addColorStop(0.4, 'rgba(255, 100, 50, 0.2)');
  eg.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = eg; ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(255, 180, 100, 0.5)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(W * 0.6, H + 60, 220, Math.PI, Math.PI * 2);
  ctx.stroke();

  stars(ctx, W, H, 18, 0.7, 0.5);

  const cx = W * 0.4, cy = H * 0.4;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.4);
  ctx.strokeStyle = 'rgba(255, 181, 71, 0.85)';
  ctx.lineWidth = 1.2;
  ctx.strokeRect(-22, -5, 44, 10);
  ctx.beginPath();
  ctx.moveTo(-22, -5); ctx.lineTo(-30, -8);
  ctx.moveTo(-22, 5); ctx.lineTo(-30, 8);
  ctx.stroke();
  ctx.restore();

  ctx.strokeStyle = 'rgba(255, 181, 71, 0.7)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const r1 = 18, r2 = 22 + Math.random() * 18;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255, 181, 71, 0.6)';
  for (let i = 0; i < 12; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 35 + Math.random() * 40;
    ctx.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 1.5, 1.5);
  }

  label(ctx, H, 'SL-8 R/B · 1992 · USSR', 'FRAGMENTATION EVENT', 'rgba(255, 181, 71, 0.95)');
}

// L3 — The Test: hot orange, missile streak to a polar impact, first red
function hero3(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#120d0d');
  g.addColorStop(0.6, '#331410');
  g.addColorStop(1, '#6b2414');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  stars(ctx, W, H, 16, 0.6, 0.5);

  const ix = W * 0.55, iy = H * 0.32;

  // missile streak rising from the limb
  const streak = ctx.createLinearGradient(W * 0.35, H, ix, iy);
  streak.addColorStop(0, 'rgba(255, 160, 90, 0)');
  streak.addColorStop(1, 'rgba(255, 200, 140, 0.9)');
  ctx.strokeStyle = streak;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(W * 0.35, H); ctx.lineTo(ix, iy); ctx.stroke();

  // impact burst
  ctx.strokeStyle = 'rgba(255, 181, 71, 0.85)';
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const r2 = 14 + Math.random() * 22;
    ctx.beginPath();
    ctx.moveTo(ix + Math.cos(a) * 5, iy + Math.sin(a) * 5);
    ctx.lineTo(ix + Math.cos(a) * r2, iy + Math.sin(a) * r2);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255, 220, 170, 0.95)';
  ctx.beginPath(); ctx.arc(ix, iy, 2.5, 0, Math.PI * 2); ctx.fill();

  // the first red traces — debris ring left behind
  ctx.strokeStyle = 'rgba(194, 86, 86, 0.4)';
  ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.ellipse(ix, iy, W * 0.3, 12, -0.5, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(ix, iy, W * 0.2, 26, -0.6, 0, Math.PI * 2); ctx.stroke();

  label(ctx, H, 'FENGYUN-1C · 1999 · CHN', '3,500+ CATALOGUED FRAGMENTS', 'rgba(255, 181, 71, 0.95)');
}

// L4 — The Collision: the only two-color hero — cool blue × warm amber
function hero4(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, '#0c1420');
  g.addColorStop(0.5, '#0d1018');
  g.addColorStop(1, '#2c1a10');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  stars(ctx, W, H, 20, 0.55);

  const mx = W * 0.5, my = H * 0.42;

  // Iridium arc (cool) from upper-left
  ctx.strokeStyle = 'rgba(140, 170, 210, 0.7)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-10, H * 0.15);
  ctx.quadraticCurveTo(W * 0.3, H * 0.28, mx, my);
  ctx.stroke();

  // Cosmos arc (warm) from lower-right
  ctx.strokeStyle = 'rgba(217, 154, 60, 0.7)';
  ctx.beginPath();
  ctx.moveTo(W + 10, H * 0.78);
  ctx.quadraticCurveTo(W * 0.72, H * 0.62, mx, my);
  ctx.stroke();

  // satellites approaching along each arc
  ctx.fillStyle = 'rgba(160, 190, 230, 0.9)';
  ctx.fillRect(W * 0.24 - 3, H * 0.26 - 3, 6, 6);
  ctx.save();
  ctx.translate(W * 0.76, H * 0.63);
  ctx.rotate(0.5);
  ctx.strokeStyle = 'rgba(217, 154, 60, 0.9)';
  ctx.strokeRect(-5, -3, 10, 6);
  ctx.restore();

  // convergence point
  ctx.fillStyle = 'rgba(255, 230, 190, 0.95)';
  ctx.beginPath(); ctx.arc(mx, my, 2.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255, 181, 71, 0.4)';
  ctx.beginPath(); ctx.arc(mx, my, 8, 0, Math.PI * 2); ctx.stroke();

  label(ctx, H, 'IRIDIUM 33 × COSMOS 2251', '11.7 KM/S · 790 KM · SIBERIA', 'rgba(232,228,212,0.8)');
}

// L5 — The Megaconstellation: clinical cold blue, parallel shells
function hero5(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#080d14');
  g.addColorStop(1, '#12202e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  stars(ctx, W, H, 14, 0.4);

  // three constellation shells, evenly populated — infrastructure, not menace
  for (let s = 0; s < 3; s++) {
    const cy = H * (0.3 + s * 0.18);
    ctx.strokeStyle = 'rgba(150, 180, 210, 0.35)';
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.ellipse(W / 2, cy, W * 0.46, 14, -0.08, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(190, 215, 240, 0.8)';
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + s * 0.6;
      ctx.fillRect(
        W / 2 + Math.cos(a) * W * 0.46 - 1,
        cy + Math.sin(a) * 14 - 1,
        2, 2,
      );
    }
  }

  label(ctx, H, 'STARLINK SHELL · 550 KM', '10,400+ OPERATIONAL', 'rgba(190, 215, 240, 0.85)');
}

// L6 — The Cascade: muted cascade red over a faint density grid
function hero6(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#120a0c');
  g.addColorStop(1, '#2a1013');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  // density grid
  ctx.strokeStyle = 'rgba(194, 86, 86, 0.12)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x <= W; x += W / 8) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let y = 0; y <= H; y += H / 6) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // tangled orbits
  ctx.lineWidth = 0.7;
  const orbits: Array<[number, number, number]> = [
    [W * 0.42, 16, -0.5], [W * 0.36, 30, 0.4], [W * 0.3, 44, -1.1],
    [W * 0.45, 22, 0.9], [W * 0.25, 38, 0.1],
  ];
  orbits.forEach(([rx, ry, rot], i) => {
    ctx.strokeStyle = `rgba(194, 86, 86, ${0.45 - i * 0.06})`;
    ctx.beginPath();
    ctx.ellipse(W / 2, H * 0.45, rx, ry, rot, 0, Math.PI * 2);
    ctx.stroke();
  });

  // debris points
  ctx.fillStyle = 'rgba(220, 130, 130, 0.7)';
  for (let i = 0; i < 26; i++) {
    ctx.fillRect(Math.random() * W, Math.random() * H * 0.8, 1.5, 1.5);
  }

  label(ctx, H, 'KESSLER THRESHOLD EXCEEDED', '520 — 1,000 KM · ALL ALTITUDES', 'rgba(194, 86, 86, 0.9)');
}

const HEROES = [hero1, hero2, hero3, hero4, hero5, hero6];

export function drawMissionHero(level: number, canvas: HTMLCanvasElement): void {
  const draw = HEROES[level - 1];
  if (!draw) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = Math.max(1, Math.round(canvas.clientWidth));
  const H = Math.max(1, Math.round(canvas.clientHeight));
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);
  draw(ctx, W, H);
}
