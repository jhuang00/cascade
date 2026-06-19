import type { EngineGameState, GameDisplayState, GameObject } from '@/lib/types';
import { LEVELS } from '@/data/levels';
import { createStarLayers, createNebulae, createEarth, drawBackground } from '@/lib/background';
import { spawnJunk, spawnActive, spawnRare } from '@/lib/spawn';
import { drawObj, drawCatalogLabel } from '@/lib/render';
import { sliceFx, collectFx, reentryBurnupFx } from '@/lib/fx';
import { attachInput } from '@/lib/input';
import { createL3Manager } from '@/lib/l3Cinematic';
import * as Audio from '@/lib/audio';

const W = 680;
const H = 460;
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
  };
}

interface EngineCallbacks {
  onDisplayUpdate: (state: Partial<GameDisplayState>) => void;
  onLevelEnd: (success: boolean, failReason?: string, l3Result?: string) => void;
}

export function createEngine(canvas: HTMLCanvasElement, cbs: EngineCallbacks) {
  const ctx = canvas.getContext('2d')!;
  const stars = createStarLayers(W, H);
  const nebulae = createNebulae(W, H);
  const earth = createEarth(W, H);
  const l3 = createL3Manager();

  let gs = makeEngineGameState();
  let rafId = 0;
  let frameCount = 0;
  let levelEnded = false;

  function pushDisplay(): void {
    const lv = LEVELS[gs.currentLevelIdx];
    cbs.onDisplayUpdate({
      score: gs.score,
      timeRemaining: gs.timeRemaining,
      cleared: gs.cleared,
      missed: gs.missed,
      destroyed: gs.destroyed,
      collected: gs.collected,
      trackingCount: gs.objs.length + (gs.currentLevelIdx === 2 ? l3.getFragments().length : 0),
      reentryCount: gs.totalReentries,
      currentLevelIdx: gs.currentLevelIdx,
      isMuted: Audio.isMuted(),
      fy1cSaved: lv?.isL3 ? l3.isSaved() : false,
    });
  }

  function endLevel(success: boolean, failReason?: string, l3Result?: string): void {
    if (levelEnded) return;
    levelEnded = true;
    gs.playing = false;
    gs.ended = true;
    if (success) Audio.playLevelWin(); else Audio.playLevelLose();
    cbs.onLevelEnd(success, failReason, l3Result);
  }

  function checkWinLoss(): void {
    const lv = LEVELS[gs.currentLevelIdx];
    if (!lv || !gs.playing || levelEnded) return;

    if (lv.isL3) {
      if (gs.destroyed >= (lv.hardFails.destroyed ?? 999)) {
        const result = l3.getResult(gs.score, lv.passScore, gs.destroyed, lv.hardFails.destroyed ?? 3);
        endLevel(false, 'too many active satellites destroyed', result ?? 'fail-destroyed');
      } else if (gs.timeRemaining <= 0) {
        const result = l3.getResult(gs.score, lv.passScore, gs.destroyed, lv.hardFails.destroyed ?? 3);
        const passed = result === 'pass' || result === 'alternate';
        endLevel(passed, passed ? undefined : 'score threshold not reached', result ?? 'fail');
      }
      return;
    }

    if (lv.hardFails.missed && gs.missed >= lv.hardFails.missed) {
      endLevel(false, 'too many pieces missed — gross inattention');
      return;
    }
    if (lv.hardFails.destroyed && gs.destroyed >= lv.hardFails.destroyed) {
      endLevel(false, 'too many active satellites destroyed');
      return;
    }
    if (gs.score >= lv.passScore) {
      endLevel(true);
      return;
    }
    if (gs.timeRemaining <= 0) {
      endLevel(false, 'time ran out before reaching the score threshold');
    }
  }

  function addTrail(x: number, y: number): void {
    gs.trail.push({ x, y, life: 14 });
    if (gs.trail.length > 22) gs.trail.shift();
  }

  function checkSliceHits(x1: number, y1: number, x2: number, y2: number): void {
    if (!gs.playing || levelEnded) return;
    const dx = x2 - x1, dy = y2 - y1;
    if (dx * dx + dy * dy < 6) return;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;

    if (LEVELS[gs.currentLevelIdx]?.isL3) {
      const l3sliced = l3.checkSliceFragments(mx, my, gs);
      if (l3sliced) pushDisplay();
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
      } else if (o.type === 'rare') {
        gs.score += 5;
        gs.labels.push({ x: o.x, y: o.y - 18, text: o.label + ' lost', life: 55, maxLife: 55, color: '#ffb070' });
        Audio.playSlice();
      }
      pushDisplay();
    }
  }

  function handleTap(x: number, y: number): void {
    if (!gs.playing || levelEnded) return;
    Audio.initAudio();

    if (LEVELS[gs.currentLevelIdx]?.isL3) {
      if (l3.handleTap(x, y, gs)) { pushDisplay(); return; }
    }

    for (let i = gs.objs.length - 1; i >= 0; i--) {
      const o = gs.objs[i];
      if (o.type !== 'rare') continue;
      const ddx = o.x - x, ddy = o.y - y;
      if (ddx * ddx + ddy * ddy >= (o.r + 16) ** 2) continue;
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
  }

  function spawnForPhase(): void {
    const lv = LEVELS[gs.currentLevelIdx];
    if (!lv) return;

    let spawnCfg = lv.spawn;
    if (lv.isL3) {
      spawnCfg = l3.getSpawnConfig();
    }

    gs.junkTimer++;
    gs.activeTimer++;
    gs.rareTimer++;
    if (spawnCfg.junk > 0 && gs.junkTimer > spawnCfg.junk) {
      gs.objs.push(spawnJunk(W, H));
      gs.junkTimer = 0;
    }
    if (spawnCfg.active > 0 && gs.activeTimer > spawnCfg.active) {
      gs.objs.push(spawnActive(W, H));
      gs.activeTimer = 0;
    }
    if (spawnCfg.rare > 0 && gs.rareTimer > spawnCfg.rare) {
      gs.objs.push(spawnRare(W, H));
      gs.rareTimer = 0;
    }
  }

  function updateObjects(): void {
    for (let i = gs.objs.length - 1; i >= 0; i--) {
      const o: GameObject = gs.objs[i];
      if (o.type === 'junk') {
        o.x += o.vx; o.y += o.vy; o.vy += 0.18; o.rot += o.vrot;
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
        pushDisplay();
      } else if (o.type !== 'junk' && (o.x < -60 || o.x > W + 60)) {
        gs.objs.splice(i, 1);
      }
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
      const grad = ctx.createLinearGradient(re.x, re.y, re.x, re.y + re.streakLen);
      grad.addColorStop(0, `rgba(255,180,80,${a * 0.05})`);
      grad.addColorStop(0.4, `rgba(255,150,60,${a * 0.55})`);
      grad.addColorStop(0.8, `rgba(255,90,40,${a * 0.75})`);
      grad.addColorStop(1, `rgba(255,200,100,${a * 0.2})`);
      ctx.fillStyle = grad;
      ctx.fillRect(re.x - 2, re.y, 4, re.streakLen);
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
    for (let i = 1; i < gs.trail.length; i++) {
      const p1 = gs.trail[i - 1], p2 = gs.trail[i];
      const a = (i / gs.trail.length) * (p1.life / 14);
      ctx.strokeStyle = `rgba(180,220,255,${a * 0.9})`;
      ctx.lineWidth = i * 0.45 + 0.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  }

  function renderCollectMode(): void {
    if (!gs.collectMode) return;
    ctx.strokeStyle = 'rgba(255,200,116,0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, W - 2, H - 2);
    ctx.font = '11px ui-monospace, "SF Mono", Menlo, monospace';
    ctx.fillStyle = 'rgba(255,200,116,0.85)';
    ctx.textAlign = 'center';
    const isL3 = LEVELS[gs.currentLevelIdx]?.isL3;
    ctx.fillText(
      isL3 ? 'COLLECT MODE — click FY-1C or gold pulses' : 'COLLECT MODE — click gold pulses',
      W / 2,
      50,
    );
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
    ctx.save();
    ctx.scale(canvas.width / W, canvas.height / H);
    if (gs.shake > 0) {
      ctx.translate((Math.random() - 0.5) * gs.shake, (Math.random() - 0.5) * gs.shake);
      gs.shake *= 0.85;
      if (gs.shake < 0.4) gs.shake = 0;
    }

    drawBackground(ctx, W, H, stars, nebulae, earth);
    renderScreenFlash();

    if (gs.playing) {
      const lv = LEVELS[gs.currentLevelIdx];
      if (lv) {
        const elapsed = Math.floor((Date.now() - gs.levelStartMs) / 1000);
        gs.timeRemaining = Math.max(0, lv.duration - elapsed);
      }

      spawnForPhase();

      if (LEVELS[gs.currentLevelIdx]?.isL3) {
        l3.tick(gs, ctx, H);
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

    ctx.restore();
    rafId = requestAnimationFrame(loop);
  }

  const removeInput = attachInput(canvas, W, H, {
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
      cbs.onDisplayUpdate({ screen: 'playing', currentLevelIdx: levelIdx });
    },

    setMuted(m: boolean): void {
      Audio.setMuted(m);
    },

    destroy(): void {
      cancelAnimationFrame(rafId);
      removeInput();
    },
  };
}
