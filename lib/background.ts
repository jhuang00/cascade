interface StarLayer {
  x: number;
  y: number;
  r: number;
  a: number;
  vx: number;
  twinkle: number;
  twinkleSpeed?: number;
}

interface Nebula {
  x: number;
  y: number;
  r1: number;
  r2: number;
  c1: string;
  c2: string;
}

interface OrbitArc {
  tilt: number;
  tiltSpeed: number;
  rx: number;
  ry: number;
  alpha: number;
  dashOffset: number;
  dashSpeed: number;
}

interface Cloud {
  angle: number;
  radialOffset: number;
  w: number;
  alpha: number;
}

interface CityLight {
  angle: number;
  radialOffset: number;
  size: number;
  flicker: number;
}

export interface StarLayers {
  farStars: StarLayer[];
  midStars: StarLayer[];
  nearStars: StarLayer[];
}

export interface EarthState {
  cx: number;
  cy: number;
  r: number;
  rotationOffset: number;
  earthClouds: Cloud[];
  cityLights: CityLight[];
}

export type OrbitArcs = OrbitArc[];

export function createStarLayers(W: number, H: number): StarLayers {
  return {
    farStars: Array.from({ length: 140 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.85,
      r: Math.random() * 0.6 + 0.2,
      a: Math.random() * 0.35 + 0.1,
      vx: -0.012,
      twinkle: Math.random() * Math.PI * 2,
    })),
    midStars: Array.from({ length: 65 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.85,
      r: Math.random() * 0.9 + 0.4,
      a: Math.random() * 0.45 + 0.25,
      vx: -0.04,
      twinkle: Math.random() * Math.PI * 2,
    })),
    nearStars: Array.from({ length: 28 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H * 0.78,
      r: Math.random() * 1.2 + 0.7,
      a: Math.random() * 0.4 + 0.5,
      vx: -0.11,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.02 + Math.random() * 0.03,
    })),
  };
}

export function createOrbitArcs(W: number, H: number): OrbitArcs {
  return [
    { tilt: 0.18,  tiltSpeed: 0.000035, rx: W * 0.46, ry: H * 0.13, alpha: 0.07, dashOffset: 0, dashSpeed: 0.04 },
    { tilt: -0.32, tiltSpeed: 0.000025, rx: W * 0.52, ry: H * 0.17, alpha: 0.05, dashOffset: 20, dashSpeed: -0.03 },
    { tilt: 0.55,  tiltSpeed: 0.000018, rx: W * 0.40, ry: H * 0.10, alpha: 0.04, dashOffset: 5,  dashSpeed: 0.025 },
    { tilt: -0.08, tiltSpeed: 0.000042, rx: W * 0.56, ry: H * 0.20, alpha: 0.035, dashOffset: 12, dashSpeed: -0.05 },
  ];
}

export function createNebulae(W: number, H: number): Nebula[] {
  return [
    { x: W * 0.18, y: H * 0.22, r1: 110, r2: 280, c1: 'rgba(80, 60, 160, 0.18)', c2: 'rgba(40, 30, 100, 0)' },
    { x: W * 0.78, y: H * 0.32, r1: 80, r2: 220, c1: 'rgba(160, 60, 130, 0.12)', c2: 'rgba(100, 40, 100, 0)' },
    { x: W * 0.5, y: H * 0.1, r1: 90, r2: 250, c1: 'rgba(40, 100, 180, 0.10)', c2: 'rgba(20, 60, 120, 0)' },
  ];
}

export function createEarth(W: number, H: number): EarthState {
  return {
    cx: W / 2,
    cy: H + 1100,
    r: 1300,
    rotationOffset: 0,
    earthClouds: Array.from({ length: 22 }, () => ({
      angle: Math.random() * Math.PI * 0.6 + Math.PI * 1.2,
      radialOffset: Math.random() * 30 + 5,
      w: 30 + Math.random() * 80,
      alpha: 0.05 + Math.random() * 0.08,
    })),
    cityLights: Array.from({ length: 45 }, () => ({
      angle: Math.random() * Math.PI * 0.7 + Math.PI * 1.15,
      radialOffset: Math.random() * 18 + 2,
      size: Math.random() * 0.7 + 0.4,
      flicker: Math.random() * Math.PI * 2,
    })),
  };
}

function makeOffscreen(W: number, H: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  return c;
}

function drawOrbitArcs(ctx: CanvasRenderingContext2D, W: number, H: number, arcs: OrbitArcs): void {
  ctx.save();
  ctx.translate(W / 2, H * 0.52);
  for (const arc of arcs) {
    arc.tilt += arc.tiltSpeed;
    arc.dashOffset += arc.dashSpeed;
    ctx.save();
    ctx.rotate(arc.tilt);
    ctx.strokeStyle = `rgba(95,179,255,${arc.alpha})`;
    ctx.lineWidth = 0.8;
    ctx.setLineDash([6, 18]);
    ctx.lineDashOffset = arc.dashOffset;
    ctx.beginPath();
    ctx.ellipse(0, 0, arc.rx, arc.ry, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
  }
  ctx.restore();
}

function drawStars(ctx: CanvasRenderingContext2D, W: number, stars: StarLayers): void {
  for (const s of stars.farStars) {
    s.x += s.vx;
    if (s.x < -2) s.x = W + 2;
    ctx.fillStyle = `rgba(220,230,255,${s.a})`;
    ctx.fillRect(s.x, s.y, s.r, s.r);
  }
  for (const s of stars.midStars) {
    s.x += s.vx;
    if (s.x < -2) s.x = W + 2;
    ctx.fillStyle = `rgba(230,235,255,${s.a})`;
    ctx.fillRect(s.x, s.y, s.r, s.r);
  }
  for (const s of stars.nearStars) {
    s.x += s.vx;
    if (s.x < -2) s.x = W + 2;
    s.twinkle += (s.twinkleSpeed ?? 0.025);
    const tw = 0.65 + Math.sin(s.twinkle) * 0.35;
    ctx.fillStyle = `rgba(240,245,255,${s.a * tw})`;
    ctx.fillRect(s.x, s.y, s.r, s.r);
    if (s.r > 1.4) {
      ctx.fillStyle = `rgba(140,200,255,${s.a * tw * 0.4})`;
      ctx.fillRect(s.x - 1, s.y, 1, s.r);
      ctx.fillRect(s.x + s.r, s.y, 1, s.r);
    }
  }
}

// Renders the static Earth body (haze, atmospheric glow, dark surface gradient).
// Only called once since these gradients never change.
function renderEarthBody(c: HTMLCanvasElement, earth: EarthState): void {
  const ctx = c.getContext('2d')!;
  const W = c.width, H = c.height;
  const { cx, cy, r } = earth;
  ctx.clearRect(0, 0, W, H);

  const hazeGrad = ctx.createRadialGradient(cx, cy, r - 10, cx, cy, r + 90);
  hazeGrad.addColorStop(0, 'rgba(90, 160, 230, 0.18)');
  hazeGrad.addColorStop(0.35, 'rgba(60, 120, 200, 0.10)');
  hazeGrad.addColorStop(1, 'rgba(20, 50, 110, 0)');
  ctx.fillStyle = hazeGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 90, 0, Math.PI * 2);
  ctx.fill();

  const glowGrad = ctx.createRadialGradient(cx, cy, r - 2, cx, cy, r + 28);
  glowGrad.addColorStop(0, 'rgba(140, 200, 255, 0.55)');
  glowGrad.addColorStop(0.3, 'rgba(120, 190, 255, 0.30)');
  glowGrad.addColorStop(1, 'rgba(80, 140, 220, 0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 28, 0, Math.PI * 2);
  ctx.fill();

  const earthGrad = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.35, 0, cx, cy, r);
  earthGrad.addColorStop(0, '#1a3458');
  earthGrad.addColorStop(0.35, '#0c1f3a');
  earthGrad.addColorStop(0.7, '#06122a');
  earthGrad.addColorStop(1, '#020816');
  ctx.fillStyle = earthGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

// Renders city lights and cloud wisps (rotation-dependent, cached every 8 frames).
function renderEarthDynamic(c: HTMLCanvasElement, H: number, earth: EarthState): void {
  const ctx = c.getContext('2d')!;
  const { cx, cy, r } = earth;
  ctx.clearRect(0, 0, c.width, c.height);

  for (const light of earth.cityLights) {
    const a = light.angle + earth.rotationOffset;
    const dist = r - light.radialOffset;
    const x = cx + Math.cos(a) * dist;
    const y = cy + Math.sin(a) * dist;
    if (y < H + 20) {
      light.flicker += 0.05;
      const flick = 0.6 + Math.sin(light.flicker) * 0.3;
      ctx.fillStyle = `rgba(255, 200, 120, ${0.7 * flick})`;
      ctx.fillRect(x, y, light.size, light.size);
    }
  }

  for (const cloud of earth.earthClouds) {
    const a = cloud.angle + earth.rotationOffset * 1.3;
    const dist = r - cloud.radialOffset;
    const x = cx + Math.cos(a) * dist;
    const y = cy + Math.sin(a) * dist;
    if (y < H + 10) {
      const cgrad = ctx.createRadialGradient(x, y, 2, x, y, cloud.w);
      cgrad.addColorStop(0, `rgba(180, 210, 240, ${cloud.alpha * 2})`);
      cgrad.addColorStop(1, `rgba(180, 210, 240, 0)`);
      ctx.fillStyle = cgrad;
      ctx.beginPath();
      ctx.arc(x, y, cloud.w, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Offscreen caches — module-level, created lazily on first drawBackground call.
let _nebulaCache: HTMLCanvasElement | null = null;
let _earthBodyCache: HTMLCanvasElement | null = null;
let _earthDynamicCache: HTMLCanvasElement | null = null;
let _starsCache: HTMLCanvasElement | null = null;
let _bgFrame = 0;

// Drop the cached offscreen layers so they regenerate at the current W/H.
// Called by the engine when the world width changes on resize.
export function flushBackgroundCaches(): void {
  _nebulaCache = null;
  _earthBodyCache = null;
  _earthDynamicCache = null;
  _starsCache = null;
}

export function drawBackground(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  stars: StarLayers,
  nebulae: Nebula[],
  earth: EarthState,
  orbitArcs?: OrbitArcs,
): void {
  _bgFrame++;

  ctx.fillStyle = '#02030a';
  ctx.fillRect(0, 0, W, H);

  // Nebulae: completely static, render once
  if (!_nebulaCache) {
    _nebulaCache = makeOffscreen(W, H);
    const nc = _nebulaCache.getContext('2d')!;
    for (const n of nebulae) {
      const grad = nc.createRadialGradient(n.x, n.y, n.r1 * 0.3, n.x, n.y, n.r2);
      grad.addColorStop(0, n.c1);
      grad.addColorStop(1, n.c2);
      nc.fillStyle = grad;
      nc.fillRect(0, 0, W, H);
    }
  }
  ctx.drawImage(_nebulaCache, 0, 0);

  // Stars: advance all positions every frame (state must always progress).
  // Far + mid stars (205 total) move < 0.1px/frame — cache to offscreen, refresh every 3 frames.
  // Near stars (28) twinkle and drift visibly — drawn live.
  for (const s of stars.farStars) { s.x += s.vx; if (s.x < -2) s.x = W + 2; }
  for (const s of stars.midStars) { s.x += s.vx; if (s.x < -2) s.x = W + 2; }

  if (!_starsCache || _bgFrame % 3 === 0) {
    if (!_starsCache) _starsCache = makeOffscreen(W, H);
    const sc = _starsCache.getContext('2d')!;
    sc.clearRect(0, 0, W, H);
    for (const s of stars.farStars) {
      sc.fillStyle = `rgba(220,230,255,${s.a})`;
      sc.fillRect(s.x, s.y, s.r, s.r);
    }
    for (const s of stars.midStars) {
      sc.fillStyle = `rgba(230,235,255,${s.a})`;
      sc.fillRect(s.x, s.y, s.r, s.r);
    }
  }
  ctx.drawImage(_starsCache, 0, 0);

  for (const s of stars.nearStars) {
    s.x += s.vx;
    if (s.x < -2) s.x = W + 2;
    s.twinkle += (s.twinkleSpeed ?? 0.025);
    const tw = 0.65 + Math.sin(s.twinkle) * 0.35;
    ctx.fillStyle = `rgba(240,245,255,${s.a * tw})`;
    ctx.fillRect(s.x, s.y, s.r, s.r);
    if (s.r > 1.4) {
      ctx.fillStyle = `rgba(140,200,255,${s.a * tw * 0.4})`;
      ctx.fillRect(s.x - 1, s.y, 1, s.r);
      ctx.fillRect(s.x + s.r, s.y, 1, s.r);
    }
  }

  // Orbit arcs: live (they animate)
  if (orbitArcs) drawOrbitArcs(ctx, W, H, orbitArcs);

  // Earth body: static gradients, render once
  earth.rotationOffset += 0.00015;
  if (!_earthBodyCache) {
    _earthBodyCache = makeOffscreen(W, H);
    renderEarthBody(_earthBodyCache, earth);
  }
  ctx.drawImage(_earthBodyCache, 0, 0);

  // Earth dynamic (city lights + clouds): rotation-dependent, update every 8 frames
  if (!_earthDynamicCache || _bgFrame % 8 === 0) {
    if (!_earthDynamicCache) _earthDynamicCache = makeOffscreen(W, H);
    renderEarthDynamic(_earthDynamicCache, H, earth);
  }
  ctx.drawImage(_earthDynamicCache, 0, 0);
}
