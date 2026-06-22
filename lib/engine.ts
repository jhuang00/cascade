import type { EngineGameState, GameDisplayState, GameObject } from '@/lib/types';
import { LEVELS } from '@/data/levels';
import { createStarLayers, createNebulae, createEarth, createOrbitArcs, drawBackground, flushBackgroundCaches } from '@/lib/background';
import { spawnJunk, spawnActive, spawnActiveDense, spawnRare, spawnJunkSplit } from '@/lib/spawn';
import { drawObj, drawCatalogLabel } from '@/lib/render';
import { sliceFx, collectFx, explosionFx, reentryBurnupFx } from '@/lib/fx';
import { attachInput } from '@/lib/input';
import { createL3Manager } from '@/lib/l3Cinematic';
import { createL4Manager } from '@/lib/l4Cinematic';
import { createCascadeManager } from '@/lib/cascade';
import * as Audio from '@/lib/audio';

// World height is locked; world width adapts to the device aspect ratio so the
// game fills the screen without stretching its assets (see rebuildForSize).
let W = 680;
const H = 460;
const W_MIN = 560;  // ≈1.22 aspect — safeguard against extreme spreads
const W_MAX = 1200; // ≈2.61 aspect
const HIT_RADIUS_BUFFER = 10;

function makeEngineGameState(): EngineGameState {
  return {
    objs: [], halves: [], particles: [], labels: [], trail: [],
    flashes: [], rings: [], reentries: [],
    score: 0, cleared: 0, missed: 0, collected: 0, destroyed: 0,
    screenFlash: 0, shake: 0,
    junkTimer: 0, activeTimer: 60, rareTimer: 120,
    collectMode: false,
    levelStartMs: 0, timeRemaining: 0,
    currentLevelIdx: 0,
    playing: false, ended: false,
    totalReentries: 0,
    densityMeter: 0,
    survivalTime: 0,
  };
}

interface LevelEndExtras {
  l3Result?: string;
  l4Result?: string;
  survivalTime?: number;
}

interface EngineCallbacks {
  onDisplayUpdate: (state: Partial<GameDisplayState>) => void;
  onLevelEnd: (success: boolean, failReason?: string, extras?: LevelEndExtras) => void;
}

export function createEngine(canvas: HTMLCanvasElement, cbs: EngineCallbacks) {
  const ctx = canvas.getContext('2d')!;
  // Size-dependent background layers — regenerated when W changes (see rebuildForSize).
  let stars = createStarLayers(W, H);
  let nebulae = createNebulae(W, H);
  let earth = createEarth(W, H);
  let orbitArcs = createOrbitArcs(W, H);
  const l3 = createL3Manager();
  const l4 = createL4Manager();
  const cascade = createCascadeManager();

  // Pre-render static scanlines; recomposited only when W changes.
  const scanlineCanvas = document.createElement('canvas');
  scanlineCanvas.height = H;
  function buildScanlines(): void {
    scanlineCanvas.width = W;
    const sc = scanlineCanvas.getContext('2d')!;
    sc.clearRect(0, 0, W, H);
    sc.fillStyle = '#000000';
    for (let y = 0; y < H; y += 4) sc.fillRect(0, y, W, 1.5);
  }
  buildScanlines();

  // Recompute world width from the canvas buffer aspect (height locked at H),
  // regenerating size-dependent assets only when the width actually changes.
  let lastBufW = 0;
  let lastBufH = 0;
  function rebuildForSize(): void {
    const bw = canvas.width, bh = canvas.height;
    if (bw === lastBufW && bh === lastBufH) return;
    lastBufW = bw; lastBufH = bh;
    if (bh === 0) return;
    const newW = Math.max(W_MIN, Math.min(W_MAX, Math.round(H * bw / bh)));
    if (newW === W) return;
    W = newW;
    stars = createStarLayers(W, H);
    nebulae = createNebulae(W, H);
    earth = createEarth(W, H);
    orbitArcs = createOrbitArcs(W, H);
    buildScanlines();
    flushBackgroundCaches();
    l3.setWidth(W);
    l4.setWidth(W);
    cascade.setWidth(W);
  }

  let gs = makeEngineGameState();
  let rafId = 0;
  let frameCount = 0;
  let levelEnded = false;
  let paused = false;
  let pauseStartMs = 0;

  function pushDisplay(): void {
    const lv = LEVELS[gs.currentLevelIdx];
    let trackingCount = gs.objs.length;
    if (gs.currentLevelIdx === 2) trackingCount += l3.getFragments().length;
    if (gs.currentLevelIdx === 3) trackingCount += l4.getFragments().length;

    cbs.onDisplayUpdate({
      score: gs.score,
      timeRemaining: gs.timeRemaining,
      cleared: gs.cleared,
      missed: gs.missed,
      destroyed: gs.destroyed,
      collected: gs.collected,
      trackingCount,
      reentryCount: gs.totalReentries,
      currentLevelIdx: gs.currentLevelIdx,
      isMuted: Audio.isMuted(),
      fy1cSaved: lv?.isL3 ? l3.isSaved() : false,
      densityMeter: gs.densityMeter,
      survivalTime: gs.survivalTime,
    });
  }

  function endLevel(success: boolean, failReason?: string, extras?: LevelEndExtras): void {
    if (levelEnded) return;
    levelEnded = true;
    gs.playing = false;
    gs.ended = true;
    if (success) Audio.playLevelWin(); else Audio.playLevelLose();
    cbs.onLevelEnd(success, failReason, extras);
  }

  function checkWinLoss(): void {
    const lv = LEVELS[gs.currentLevelIdx];
    if (!lv || !gs.playing || levelEnded) return;

    // L6 — cascade survival, no win/fail, ends when density saturates
    if (lv.isL6) {
      if (cascade.isDead()) {
        endLevel(true, undefined, { survivalTime: cascade.getSurvivalTime() });
      }
      return;
    }

    // L4 — collision cinematic
    if (lv.isL4) {
      if (lv.hardFails.destroyed && gs.destroyed >= lv.hardFails.destroyed) {
        const result = l4.getResult(gs.score, lv.passScore);
        endLevel(false, 'too many active satellites destroyed', { l4Result: result });
        return;
      }
      if (gs.timeRemaining <= 0) {
        const result = l4.getResult(gs.score, lv.passScore);
        const passed = result !== 'fail-score';
        endLevel(passed, passed ? undefined : 'score threshold not reached', { l4Result: result });
      }
      return;
    }

    // L3 — cinematic event
    if (lv.isL3) {
      if (gs.destroyed >= (lv.hardFails.destroyed ?? 999)) {
        const result = l3.getResult(gs.score, lv.passScore, gs.destroyed, lv.hardFails.destroyed ?? 3);
        endLevel(false, 'too many active satellites destroyed', { l3Result: result ?? undefined });
      } else if (gs.timeRemaining <= 0) {
        const result = l3.getResult(gs.score, lv.passScore, gs.destroyed, lv.hardFails.destroyed ?? 3);
        const passed = result === 'pass' || result === 'alternate';
        endLevel(passed, passed ? undefined : 'score threshold not reached', { l3Result: result ?? undefined });
      }
      return;
    }

    // L5 — score-drops-below-zero hard fail
    if (lv.isL5 && gs.score < 0) {
      endLevel(false, 'net score fell below zero');
      return;
    }

    // Standard L1/L2/L5 logic
    if (lv.hardFails.missed && gs.missed >= lv.hardFails.missed) {
      endLevel(false, 'too many pieces missed — gross inattention');
      return;
    }
    if (lv.hardFails.destroyed && gs.destroyed >= lv.hardFails.destroyed) {
      endLevel(false, 'too many active satellites destroyed');
      return;
    }
    if (!lv.isL6 && gs.score >= lv.passScore) {
      endLevel(true);
      return;
    }
    if (gs.timeRemaining <= 0) {
      endLevel(false, 'time ran out before reaching the score threshold');
    }
  }

  function addTrail(x: number, y: number): void {
    gs.trail.push({ x, y, life: 14 });
    if (gs.trail.length > 14) gs.trail.shift();
  }

  function checkSliceHits(x1: number, y1: number, x2: number, y2: number): void {
    if (!gs.playing || levelEnded) return;
    const dx = x2 - x1, dy = y2 - y1;
    if (dx * dx + dy * dy < 6) return;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const lv = LEVELS[gs.currentLevelIdx];

    if (lv?.isL3) {
      const l3sliced = l3.checkSliceFragments(mx, my, gs);
      if (l3sliced) pushDisplay();
    }

    if (lv?.isL4) {
      const l4cosmoSliced = l4.checkSliceCosmos(mx, my, gs);
      if (l4cosmoSliced) { pushDisplay(); return; }
      const l4fragSliced = l4.checkSliceFragments(mx, my, gs);
      if (l4fragSliced) pushDisplay();
    }

    for (let i = gs.objs.length - 1; i >= 0; i--) {
      const o = gs.objs[i];
      const ddx = o.x - mx, ddy = o.y - my;
      if (ddx * ddx + ddy * ddy >= (o.r + HIT_RADIUS_BUFFER) ** 2) continue;

      sliceFx(gs, o);
      gs.objs.splice(i, 1);

      if (o.type === 'junk') {
        gs.score += 10;
        gs.cleared++;
        gs.labels.push({ x: o.x, y: o.y - 18, text: o.label, life: 50, maxLife: 50, color: '#9fd6f5' });
        Audio.playSlice();
      } else if (o.type === 'active') {
        gs.score -= 25;
        gs.destroyed++;
        gs.screenFlash = 20;
        gs.labels.push({ x: o.x, y: o.y - 18, text: o.label + ' DESTROYED', life: 60, maxLife: 60, color: '#ff7a7a' });
        gs.labels.push({ x: o.x, y: o.y + 2, text: '−25 / infrastructure damaged', life: 55, maxLife: 55, color: '#ff5a5a' });
        gs.flashes.push({ x: o.x, y: o.y, r: 5, life: 20, maxLife: 20, color: '#ff5050' });
        Audio.playActiveHit();
        // L6: destroying active spawns 3 fragments and raises density
        if (lv?.isL6) {
          cascade.onActiveDestroyed();
          gs.densityMeter = cascade.getDensity();
          for (let j = 0; j < 3; j++) {
            const ang = Math.random() * Math.PI * 2;
            const spd = 2 + Math.random() * 3;
            const r = 7 + Math.random() * 4;
            gs.objs.push({
              type: 'junk',
              x: o.x, y: o.y,
              vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd - 1,
              rot: Math.random() * Math.PI * 2,
              vrot: (Math.random() - 0.5) * 0.15,
              r,
              verts: makePolyLocal(r),
              color: o.color,
              label: 'cascade fragment · 2026',
              fragmented: true,
            });
          }
        }
      } else if (o.type === 'rare') {
        gs.score += 5;
        gs.labels.push({ x: o.x, y: o.y - 18, text: o.label + ' lost', life: 55, maxLife: 55, color: '#ffb070' });
        Audio.playSlice();
      }
      pushDisplay();
    }
  }

  // Inline poly helper (avoids importing spawn just for the poly function)
  function makePolyLocal(baseR: number) {
    const sides = 5 + Math.floor(Math.random() * 3);
    const verts = [];
    for (let i = 0; i < sides; i++) {
      const ang = (i / sides) * Math.PI * 2;
      const r = baseR * (0.65 + Math.random() * 0.55);
      verts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
    }
    return verts;
  }

  function handleTap(x: number, y: number): void {
    if (!gs.playing || levelEnded) return;
    Audio.initAudio();
    const lv = LEVELS[gs.currentLevelIdx];

    if (lv?.isL3) {
      if (l3.handleTap(x, y, gs)) { pushDisplay(); return; }
    }

    if (lv?.isL4) {
      if (l4.handleTap(x, y, gs)) { pushDisplay(); return; }
    }

    // L6 collect: collecting an active reduces density
    for (let i = gs.objs.length - 1; i >= 0; i--) {
      const o = gs.objs[i];
      if (o.type !== 'rare' && !(lv?.isL6 && o.type === 'active')) continue;
      const ddx = o.x - x, ddy = o.y - y;
      if (ddx * ddx + ddy * ddy >= (o.r + 16) ** 2) continue;

      if (o.type === 'rare') {
        collectFx(gs, o);
        gs.objs.splice(i, 1);
        gs.score += 100;
        gs.collected++;
        gs.labels.push({ x: o.x, y: o.y - 18, text: o.label, life: 65, maxLife: 65, color: '#ffe0a8' });
        gs.labels.push({ x: o.x, y: o.y + 2, text: '+100 preserved', life: 60, maxLife: 60, color: '#ffd080' });
        Audio.playCollect();
        pushDisplay();
        return;
      }

      if (lv?.isL6 && o.type === 'active') {
        collectFx(gs, o);
        gs.objs.splice(i, 1);
        gs.score += 50;
        gs.collected++;
        cascade.onActiveCollected();
        gs.densityMeter = cascade.getDensity();
        gs.labels.push({ x: o.x, y: o.y - 18, text: o.label, life: 65, maxLife: 65, color: '#ffe0a8' });
        gs.labels.push({ x: o.x, y: o.y + 2, text: '+50 · density relieved', life: 60, maxLife: 60, color: '#ffd080' });
        Audio.playCollect();
        pushDisplay();
        return;
      }
    }
  }

  function spawnForPhase(): void {
    const lv = LEVELS[gs.currentLevelIdx];
    if (!lv) return;

    // L6 delegates entirely to cascade manager
    if (lv.isL6) {
      cascade.tick(gs);
      gs.densityMeter = cascade.getDensity();
      gs.survivalTime = cascade.getSurvivalTime();
      return;
    }

    let spawnCfg = lv.spawn;
    if (lv.isL3) spawnCfg = l3.getSpawnConfig();
    if (lv.isL4) spawnCfg = l4.getSpawnConfig();

    const withFrag = gs.currentLevelIdx >= 1; // L2+ have fragmentation

    gs.junkTimer++;
    gs.activeTimer++;
    gs.rareTimer++;
    if (spawnCfg.junk > 0 && gs.junkTimer > spawnCfg.junk) {
      gs.objs.push(spawnJunk(W, H, withFrag));
      gs.junkTimer = 0;
    }
    if (spawnCfg.active > 0 && gs.activeTimer > spawnCfg.active) {
      const sat = lv.isL5 ? spawnActiveDense(W, H) : spawnActive(W, H);
      gs.objs.push(sat);
      gs.activeTimer = 0;
    }
    if (spawnCfg.rare > 0 && gs.rareTimer > spawnCfg.rare) {
      gs.objs.push(spawnRare(W, H));
      gs.rareTimer = 0;
    }
  }

  function updateObjects(): void {
    const toAdd: GameObject[] = [];

    for (let i = gs.objs.length - 1; i >= 0; i--) {
      const o: GameObject = gs.objs[i];
      if (o.type === 'junk') {
        o.x += o.vx; o.y += o.vy; o.vy += 0.18; o.rot += o.vrot;

        // Mid-flight fragmentation (L2+)
        if (o.fragmentsAt !== undefined && !o.fragmented && o.vy < 0 && o.y <= o.fragmentsAt) {
          const [a, b] = spawnJunkSplit(o);
          toAdd.push(a, b);
          gs.objs.splice(i, 1);
          gs.flashes.push({ x: o.x, y: o.y, r: 3, life: 8, maxLife: 8, color: '#c0c8d0' });
          continue;
        }
      } else if (o.type === 'active') {
        o.x += (o.direction ?? 1) * (o.speed ?? 1.3);
        const span = Math.abs((o.xEnd ?? W) - (o.xStart ?? 0));
        const progress = span > 0 ? Math.max(0, Math.min(1, Math.abs(o.x - (o.xStart ?? 0)) / span)) : 0;
        o.y = (o.yBaseline ?? H / 2) - (o.arcHeight ?? 100) * Math.sin(progress * Math.PI);
        o.rot += o.vrot;
      } else if (o.type === 'rare') {
        o.x += o.vx;
        o.bobPhase = (o.bobPhase ?? 0) + 0.03;
        o.y = (o.baseY ?? o.y) + Math.sin(o.bobPhase) * 8;
        o.rot += o.vrot;
      }

      drawObj(ctx, o, 1, gs.collectMode);

      if (o.type === 'junk' && o.y > H + 60) {
        gs.objs.splice(i, 1);
        gs.missed++;
        gs.score -= 5;
        gs.totalReentries++;
        reentryBurnupFx(gs, o.x, H);
        // L6 cascade rule on miss
        if (LEVELS[gs.currentLevelIdx]?.isL6) {
          cascade.onMiss();
          gs.densityMeter = cascade.getDensity();
        }
        pushDisplay();
      } else if (o.type !== 'junk' && (o.x < -60 || o.x > W + 60)) {
        gs.objs.splice(i, 1);
      }
    }

    if (toAdd.length) {
      gs.objs.push(...toAdd);
    }
  }

  function renderFX(): void {
    for (let i = gs.halves.length - 1; i >= 0; i--) {
      const h = gs.halves[i];
      h.x += h.vx; h.y += h.vy; h.vy += 0.18; h.rot += h.vrot; h.life--;
      if (h.verts) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, h.life / h.maxLife);
        ctx.translate(h.x, h.y);
        ctx.rotate(h.rot);
        ctx.fillStyle = h.color;
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        h.verts.forEach((v, vi) => vi === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y));
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      if (h.life <= 0) gs.halves.splice(i, 1);
    }

    for (let i = gs.particles.length - 1; i >= 0; i--) {
      const p = gs.particles[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.1; p.life--;
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
      ctx.globalAlpha = 1;
      if (p.life <= 0) gs.particles.splice(i, 1);
    }

    for (let i = gs.flashes.length - 1; i >= 0; i--) {
      const f = gs.flashes[i];
      f.r += 2.5; f.life--;
      ctx.globalAlpha = Math.max(0, f.life / f.maxLife) * 0.5;
      ctx.strokeStyle = f.color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      if (f.life <= 0) gs.flashes.splice(i, 1);
    }

    for (let i = gs.rings.length - 1; i >= 0; i--) {
      const ring = gs.rings[i];
      ring.life--;
      const t = 1 - (ring.life / ring.maxLife);
      const r = ring.r + (ring.targetR - ring.r) * t;
      ctx.globalAlpha = Math.max(0, ring.life / ring.maxLife) * 0.85;
      ctx.strokeStyle = ring.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      if (ring.life <= 0) gs.rings.splice(i, 1);
    }

    for (let i = gs.reentries.length - 1; i >= 0; i--) {
      const re = gs.reentries[i];
      re.y += re.vy; re.life--;
      const a = Math.max(0, re.life / re.maxLife);
      const seg = re.streakLen / 4;
      ctx.fillStyle = `rgba(255,180,80,${a * 0.05})`;  ctx.fillRect(re.x - 2, re.y,         4, seg);
      ctx.fillStyle = `rgba(255,150,60,${a * 0.55})`;  ctx.fillRect(re.x - 2, re.y + seg,   4, seg);
      ctx.fillStyle = `rgba(255,90,40,${a * 0.75})`;   ctx.fillRect(re.x - 2, re.y + seg*2, 4, seg);
      ctx.fillStyle = `rgba(255,200,100,${a * 0.2})`;  ctx.fillRect(re.x - 2, re.y + seg*3, 4, seg);
      if (re.life <= 0) gs.reentries.splice(i, 1);
    }

    for (let i = gs.labels.length - 1; i >= 0; i--) {
      const l = gs.labels[i];
      l.y -= 0.5; l.life--;
      drawCatalogLabel(ctx, l.x, l.y, l.text, Math.max(0, l.life / l.maxLife), l.color);
      if (l.life <= 0) gs.labels.splice(i, 1);
    }
  }

  function renderTrail(): void {
    for (let i = gs.trail.length - 1; i >= 0; i--) {
      gs.trail[i].life--;
      if (gs.trail[i].life <= 0) gs.trail.splice(i, 1);
    }
    if (gs.collectMode || gs.trail.length < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Soft outer glow — single batched path (diffuse haze, uniform width is fine).
    // One stroke call instead of N individual paths.
    ctx.strokeStyle = 'rgba(95,179,255,0.10)';
    ctx.lineWidth = gs.trail.length * 1.2 + 14;
    ctx.beginPath();
    for (let i = 1; i < gs.trail.length; i++) {
      const p1 = gs.trail[i - 1], p2 = gs.trail[i];
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();

    // Main outer pass
    for (let i = 1; i < gs.trail.length; i++) {
      const p1 = gs.trail[i - 1], p2 = gs.trail[i];
      const t = i / gs.trail.length;
      const a = t * (p1.life / 14) * 0.35;
      ctx.strokeStyle = `rgba(120,190,255,${a})`;
      ctx.lineWidth = i * 1.4 + 3;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Inner bright core
    for (let i = 1; i < gs.trail.length; i++) {
      const p1 = gs.trail[i - 1], p2 = gs.trail[i];
      const t = i / gs.trail.length;
      const a = t * (p1.life / 14);
      ctx.strokeStyle = `rgba(210,235,255,${a * 0.95})`;
      ctx.lineWidth = i * 0.5 + 0.8;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function renderCollectMode(): void {
    if (!gs.collectMode) return;
    const lv = LEVELS[gs.currentLevelIdx];
    ctx.strokeStyle = 'rgba(255,200,116,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);
    ctx.font = '11px ui-monospace, "SF Mono", Menlo, monospace';
    ctx.fillStyle = 'rgba(255,200,116,0.85)';
    ctx.textAlign = 'center';
    const hint = lv?.isL3
      ? 'COLLECT MODE — click FY-1C or gold pulses'
      : lv?.isL4
      ? 'COLLECT MODE — click IRIDIUM 33 to deflect, or gold pulses'
      : lv?.isL6
      ? 'COLLECT MODE — click active satellites to reduce density, or gold pulses'
      : 'COLLECT MODE — click gold pulses';
    ctx.fillText(hint, W / 2, 50);
  }

  function renderScanLines(): void {
    ctx.save();
    ctx.globalAlpha = 0.032;
    ctx.drawImage(scanlineCanvas, 0, 0, W, H);
    ctx.restore();
  }

  function renderScreenFlash(): void {
    if (gs.screenFlash <= 0) return;
    ctx.fillStyle = `rgba(255,40,40,${(gs.screenFlash / 20) * 0.15})`;
    ctx.fillRect(0, 0, W, H);
    gs.screenFlash--;
  }

  let lastTrailX: number | null = null;
  let lastTrailY: number | null = null;

  function loop(): void {
    frameCount++;
    // Adapt world width to the current canvas buffer (only reallocates on change).
    rebuildForSize();
    ctx.save();
    // Uniform, centered scale: never stretch the world even if the canvas
    // buffer's aspect ratio drifts from W:H — letterbox inside it instead.
    const s = Math.min(canvas.width / W, canvas.height / H);
    ctx.translate((canvas.width - W * s) / 2, (canvas.height - H * s) / 2);
    ctx.scale(s, s);
    if (gs.shake > 0) {
      ctx.translate((Math.random() - 0.5) * gs.shake, (Math.random() - 0.5) * gs.shake);
      gs.shake *= 0.85;
      if (gs.shake < 0.4) gs.shake = 0;
    }

    drawBackground(ctx, W, H, stars, nebulae, earth, orbitArcs);
    renderScreenFlash();

    if (gs.playing && !paused) {
      const lv = LEVELS[gs.currentLevelIdx];
      if (lv && !lv.isL6) {
        const elapsed = Math.floor((Date.now() - gs.levelStartMs) / 1000);
        gs.timeRemaining = Math.max(0, lv.duration - elapsed);
      }

      spawnForPhase();

      if (LEVELS[gs.currentLevelIdx]?.isL3) {
        l3.tick(gs, ctx, H);
      }

      if (LEVELS[gs.currentLevelIdx]?.isL4) {
        l4.tick(gs, ctx);
      }

      // L6 density meter overlay (rendered inside canvas)
      if (LEVELS[gs.currentLevelIdx]?.isL6) {
        cascade.drawMeter(ctx);
      }

      updateObjects();
      renderFX();
      renderTrail();
      renderCollectMode();

      if (frameCount % 3 === 0) pushDisplay();
      checkWinLoss();
    } else {
      renderFX();
      renderTrail();
    }

    renderScanLines();
    ctx.restore();
    rafId = requestAnimationFrame(loop);
  }

  const removeInput = attachInput(canvas, () => ({ w: W, h: H }), {
    onMove(x, y) {
      if (!gs.playing || gs.collectMode) {
        lastTrailX = null; lastTrailY = null; return;
      }
      addTrail(x, y);
      if (lastTrailX !== null && lastTrailY !== null) {
        checkSliceHits(lastTrailX, lastTrailY, x, y);
      }
      lastTrailX = x; lastTrailY = y;
    },
    onTap(x, y) { handleTap(x, y); },
    onLeave() { gs.trail.length = 0; lastTrailX = null; lastTrailY = null; },
    onCollectStart() {
      gs.collectMode = true;
      canvas.style.cursor = 'pointer';
      gs.trail.length = 0;
      lastTrailX = null; lastTrailY = null;
    },
    onCollectEnd() {
      gs.collectMode = false;
      canvas.style.cursor = 'crosshair';
    },
  });

  rafId = requestAnimationFrame(loop);

  return {
    startLevel(levelIdx: number): void {
      gs = makeEngineGameState();
      gs.currentLevelIdx = levelIdx;
      gs.levelStartMs = Date.now();
      gs.playing = true;
      levelEnded = false;
      frameCount = 0;
      const lv = LEVELS[levelIdx];
      if (lv) gs.timeRemaining = lv.duration;
      if (lv?.isL3) l3.start(gs.levelStartMs);
      if (lv?.isL4) l4.start(gs.levelStartMs);
      if (lv?.isL6) cascade.start(gs.levelStartMs);
      cbs.onDisplayUpdate({ screen: 'playing', currentLevelIdx: levelIdx });
    },

    setMuted(m: boolean): void {
      Audio.setMuted(m);
    },

    // Freeze gameplay + clocks (e.g. while the portrait rotate-gate is shown).
    setPaused(p: boolean): void {
      if (p === paused) return;
      paused = p;
      if (p) {
        pauseStartMs = Date.now();
      } else {
        const d = Date.now() - pauseStartMs;
        gs.levelStartMs += d;
        l3.pauseShift(d);
        l4.pauseShift(d);
        cascade.pauseShift(d);
      }
    },

    destroy(): void {
      cancelAnimationFrame(rafId);
      removeInput();
    },
  };
}
