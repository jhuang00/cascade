import type { GameObject, L4Phase, L4Result, EngineGameState } from '@/lib/types';
import { spawnIridium33, spawnCosmos2251, spawnCollisionFragment } from '@/lib/spawn';
import { drawCinematicSat } from '@/lib/render';
import { collectFx, explosionFx, sliceFx } from '@/lib/fx';
import * as Audio from '@/lib/audio';
import { tensionBGM } from '@/lib/music';

let W = 680;
const H = 460;
const CONVERGENCE_POINT = { x: W / 2, y: 195 };
const FRAGMENT_COUNT = 50;
const HIT_RADIUS_BUFFER = 12;

const PHASE_TIMINGS = {
  convergence: 14,
  critical: 20,
  impact: 25,
  aftermath: 25.5,
};

interface L4State {
  phase: L4Phase;
  iridium33: GameObject | null;
  cosmos2251: GameObject | null;
  fragments: GameObject[];
  branch: 'saved' | 'deflected' | 'collision' | null;
  levelStartMs: number;
  iridiumSaved: boolean;
  cosmosDeflected: boolean;
  collisionFired: boolean;
  missilePlayed: boolean;
}

function makeL4State(): L4State {
  return {
    phase: 'open',
    iridium33: null,
    cosmos2251: null,
    fragments: [],
    branch: null,
    levelStartMs: 0,
    iridiumSaved: false,
    cosmosDeflected: false,
    collisionFired: false,
    missilePlayed: false,
  };
}

export type L4Manager = ReturnType<typeof createL4Manager>;

export function createL4Manager() {
  let s = makeL4State();

  function elapsed(): number {
    return (Date.now() - s.levelStartMs) / 1000;
  }

  function transitionPhase(newPhase: L4Phase, gs: EngineGameState): void {
    s.phase = newPhase;
    if (newPhase === 'convergence') {
      s.iridium33 = spawnIridium33(W);
      s.cosmos2251 = spawnCosmos2251(W, H);
      if (!s.missilePlayed) {
        // Repurpose missile launch sound as "threat detected" tone
        Audio.playMissileLaunch();
        Audio.startMusic(tensionBGM);
        s.missilePlayed = true;
      }
    } else if (newPhase === 'collision') {
      const cx = CONVERGENCE_POINT.x;
      const cy = CONVERGENCE_POINT.y;
      for (let i = 0; i < FRAGMENT_COUNT; i++) {
        s.fragments.push(spawnCollisionFragment(cx, cy));
      }
      explosionFx(gs, cx, cy);
      Audio.playExplosion();
      s.collisionFired = true;
      s.branch = 'collision';
    } else if (newPhase === 'safe') {
      s.branch = 'saved';
      s.iridium33 = null;
      s.cosmos2251 = null;
    } else if (newPhase === 'deflected') {
      s.branch = 'deflected';
      s.cosmos2251 = null;
    } else if (newPhase === 'aftermath') {
      s.iridium33 = null;
      s.cosmos2251 = null;
    }
  }

  function advanceSatellite(o: GameObject): void {
    o.x += (o.direction ?? 1) * (o.speed ?? 0.95);
    const span = Math.abs((o.xEnd ?? W) - (o.xStart ?? 0));
    const progress = span > 0 ? Math.max(0, Math.min(1, Math.abs(o.x - (o.xStart ?? 0)) / span)) : 0;
    o.y = (o.yBaseline ?? H / 2) - (o.arcHeight ?? 100) * Math.sin(progress * Math.PI);
    o.rot += o.vrot;
  }

  function maybeAdvance(gs: EngineGameState): void {
    const t = elapsed();
    if (s.phase === 'open' && t >= PHASE_TIMINGS.convergence) {
      transitionPhase('convergence', gs);
    } else if (s.phase === 'convergence' && t >= PHASE_TIMINGS.critical) {
      transitionPhase('critical', gs);
    } else if ((s.phase === 'convergence' || s.phase === 'critical') && t >= PHASE_TIMINGS.impact) {
      transitionPhase('collision', gs);
      setTimeout(() => transitionPhase('aftermath', gs), 600);
    } else if (s.phase === 'safe' || s.phase === 'deflected') {
      // branch already resolved — just keep playing
    }
  }

  function spawnConfigForPhase(): { junk: number; active: number; rare: number } {
    if (s.phase === 'open') return { junk: 50, active: 210, rare: 370 };
    if (s.phase === 'convergence' || s.phase === 'critical') return { junk: 100, active: 0, rare: 0 };
    if (s.phase === 'collision') return { junk: 0, active: 0, rare: 0 };
    // aftermath, safe, deflected
    return { junk: 55, active: 200, rare: 360 };
  }

  return {
    start(levelStartMs: number): void {
      s = makeL4State();
      s.levelStartMs = levelStartMs;
    },

    setWidth(w: number): void { W = w; CONVERGENCE_POINT.x = W / 2; },

    pauseShift(ms: number): void { s.levelStartMs += ms; },

    getSpawnConfig() {
      return spawnConfigForPhase();
    },

    getPhase(): L4Phase { return s.phase; },
    isSaved(): boolean { return s.iridiumSaved; },
    isDeflected(): boolean { return s.cosmosDeflected; },
    getFragments(): GameObject[] { return s.fragments; },

    getResult(score: number, passScore: number): L4Result {
      if (score < passScore) return 'fail-score';
      if (s.iridiumSaved) return 'saved';
      if (s.cosmosDeflected) return 'deflected';
      return 'cleaned';
    },

    // Collect Iridium 33 (SPACE+click / tap)
    handleTap(x: number, y: number, gs: EngineGameState): boolean {
      if (!s.iridium33) return false;
      if (s.phase !== 'convergence' && s.phase !== 'critical') return false;
      const ddx = s.iridium33.x - x;
      const ddy = s.iridium33.y - y;
      if (ddx * ddx + ddy * ddy < (s.iridium33.r + 22) ** 2) {
        collectFx(gs, s.iridium33);
        gs.score += 200;
        gs.collected++;
        gs.labels.push({ x: s.iridium33.x, y: s.iridium33.y - 24, text: 'IRIDIUM 33 deflected', life: 70, maxLife: 70, color: '#ffe0a8' });
        gs.labels.push({ x: s.iridium33.x, y: s.iridium33.y - 10, text: '+200 · collision averted', life: 65, maxLife: 65, color: '#ffd080' });
        s.iridiumSaved = true;
        transitionPhase('safe', gs);
        Audio.playCollect();
        return true;
      }
      return false;
    },

    // Slice Cosmos 2251 (deflect the dead satellite)
    checkSliceCosmos(mx: number, my: number, gs: EngineGameState): boolean {
      if (!s.cosmos2251) return false;
      if (s.phase !== 'convergence' && s.phase !== 'critical') return false;
      const ddx = s.cosmos2251.x - mx;
      const ddy = s.cosmos2251.y - my;
      if (ddx * ddx + ddy * ddy < (s.cosmos2251.r + HIT_RADIUS_BUFFER) ** 2) {
        sliceFx(gs, s.cosmos2251);
        gs.score += 50;
        gs.cleared++;
        gs.labels.push({ x: s.cosmos2251.x, y: s.cosmos2251.y - 22, text: 'COSMOS 2251 deflected', life: 65, maxLife: 65, color: '#9fd6f5' });
        gs.labels.push({ x: s.cosmos2251.x, y: s.cosmos2251.y - 8, text: '+50 · dead satellite cleared', life: 60, maxLife: 60, color: '#7ac0e8' });
        s.cosmosDeflected = true;
        transitionPhase('deflected', gs);
        Audio.playSlice();
        return true;
      }
      return false;
    },

    // Slice collision fragments
    checkSliceFragments(mx: number, my: number, gs: EngineGameState): boolean {
      let hit = false;
      for (let i = s.fragments.length - 1; i >= 0; i--) {
        const f = s.fragments[i];
        const ddx = f.x - mx, ddy = f.y - my;
        if (ddx * ddx + ddy * ddy < (f.r + HIT_RADIUS_BUFFER) ** 2) {
          sliceFx(gs, f);
          s.fragments.splice(i, 1);
          gs.cleared++;
          gs.score += 25;
          gs.labels.push({ x: f.x, y: f.y - 14, text: f.label, life: 40, maxLife: 40, color: '#9fd6f5' });
          Audio.playSlice();
          hit = true;
        }
      }
      return hit;
    },

    tick(gs: EngineGameState, ctx: CanvasRenderingContext2D): void {
      maybeAdvance(gs);

      const isCritical = s.phase === 'critical';

      if (isCritical) {
        const intensity = 0.12 + Math.sin(Date.now() / 100) * 0.05;
        ctx.strokeStyle = `rgba(255,80,80,${intensity})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(2, 2, W - 4, H - 4);
      }

      // Draw and advance Iridium 33
      if (s.iridium33 && (s.phase === 'convergence' || s.phase === 'critical')) {
        advanceSatellite(s.iridium33);
        drawCinematicSat(ctx, s.iridium33, CONVERGENCE_POINT, isCritical);
        // If it exits the frame without being acted on, let it go
        if (s.iridium33.x < -60 || s.iridium33.x > W + 60) {
          s.iridium33 = null;
        }
      }

      // Draw and advance Cosmos 2251
      if (s.cosmos2251 && (s.phase === 'convergence' || s.phase === 'critical')) {
        advanceSatellite(s.cosmos2251);
        drawCinematicSat(ctx, s.cosmos2251, CONVERGENCE_POINT, isCritical);
        if (s.cosmos2251.x < -60 || s.cosmos2251.x > W + 60) {
          s.cosmos2251 = null;
        }
      }

      // If deflected: Iridium continues its path (already removed from cinematic control)
      if (s.phase === 'deflected' && s.iridium33) {
        advanceSatellite(s.iridium33);
        drawCinematicSat(ctx, s.iridium33, CONVERGENCE_POINT, false);
        if (s.iridium33.x < -60 || s.iridium33.x > W + 60) {
          s.iridium33 = null;
        }
      }

      // Draw and update collision fragments
      for (let i = s.fragments.length - 1; i >= 0; i--) {
        const f = s.fragments[i];
        f.x += f.vx; f.y += f.vy;
        f.vy += 0.07;
        f.vx *= 0.996; f.vy *= 0.996;
        f.rot += f.vrot;
        ctx.save();
        ctx.translate(f.x, f.y);
        ctx.rotate(f.rot);
        if (f.verts) {
          ctx.fillStyle = f.color;
          ctx.strokeStyle = 'rgba(0,0,0,0.35)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          f.verts.forEach((v, vi) => vi === 0 ? ctx.moveTo(v.x, v.y) : ctx.lineTo(v.x, v.y));
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
        if (f.y > H + 50 || f.x < -60 || f.x > W + 60) {
          s.fragments.splice(i, 1);
        }
      }
    },

    reset(): void {
      s = makeL4State();
    },
  };
}
