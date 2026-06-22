import type { GameObject, MissileObj, L3Phase, L3Result, EngineGameState } from '@/lib/types';
import { spawnFY1C, spawnFragment } from '@/lib/spawn';
import { drawFY1C, drawMissile } from '@/lib/render';
import { collectFx, explosionFx, sliceFx } from '@/lib/fx';
import * as Audio from '@/lib/audio';

const PHASE_TIMINGS = {
  appear: 10,
  approach: 13,
  impact: 16,
  aftermath: 16.6,
  outcome: 60,
};

const FRAGMENT_COUNT = 40;
const HIT_RADIUS_BUFFER = 10;

let W = 680;

interface L3State {
  phase: L3Phase;
  fy1c: GameObject | null;
  missile: MissileObj | null;
  fragments: GameObject[];
  fy1cSaved: boolean;
  fy1cImpacted: boolean;
  missilePlayed: boolean;
  levelStartMs: number;
  phaseIndicator: string;
  phaseWarning: boolean;
}

function makeL3State(): L3State {
  return {
    phase: 'open',
    fy1c: null,
    missile: null,
    fragments: [],
    fy1cSaved: false,
    fy1cImpacted: false,
    missilePlayed: false,
    levelStartMs: 0,
    phaseIndicator: '',
    phaseWarning: false,
  };
}

export type L3Manager = ReturnType<typeof createL3Manager>;

export function createL3Manager() {
  let s = makeL3State();

  function elapsed(): number {
    return (Date.now() - s.levelStartMs) / 1000;
  }

  function transitionPhase(newPhase: L3Phase, gs: EngineGameState): void {
    s.phase = newPhase;
    if (newPhase === 'appear') {
      s.phaseIndicator = 'Tracking target';
      s.phaseWarning = false;
      s.fy1c = spawnFY1C();
    } else if (newPhase === 'approach') {
      s.phaseIndicator = 'Incoming — target acquired';
      s.phaseWarning = true;
      if (s.fy1c && !s.missile) {
        s.missile = { x: W * 0.32 + Math.random() * W * 0.35, y: 999, speed: 4.2, trail: [] };
        if (!s.missilePlayed) { Audio.playMissileLaunch(); s.missilePlayed = true; }
      }
    } else if (newPhase === 'impact') {
      s.phaseIndicator = '';
      s.phaseWarning = false;
      if (s.fy1c) {
        for (let i = 0; i < FRAGMENT_COUNT; i++) {
          s.fragments.push(spawnFragment(s.fy1c.x, s.fy1c.y));
        }
        explosionFx(gs, s.fy1c.x, s.fy1c.y);
        Audio.playExplosion();
        s.fy1cImpacted = true;
      }
    } else if (newPhase === 'aftermath') {
      s.phaseIndicator = '';
      s.phaseWarning = false;
      s.fy1c = null;
      s.missile = null;
    } else if (newPhase === 'outcome') {
      s.phaseIndicator = '';
      s.phaseWarning = false;
    }
  }

  function spawnConfigForPhase(): { junk: number; active: number; rare: number } {
    if (s.phase === 'open') return { junk: 55, active: 220, rare: 400 };
    if (s.phase === 'appear') return { junk: 90, active: 0, rare: 0 };
    if (s.phase === 'approach') return { junk: 130, active: 0, rare: 0 };
    if (s.phase === 'impact') return { junk: 0, active: 0, rare: 0 };
    if (s.phase === 'aftermath') return { junk: 65, active: 240, rare: 420 };
    return { junk: 0, active: 0, rare: 0 };
  }

  function maybeAdvance(gs: EngineGameState): void {
    const t = elapsed();
    if (s.phase === 'open' && t >= PHASE_TIMINGS.appear) {
      transitionPhase('appear', gs);
    } else if (s.phase === 'appear' && t >= PHASE_TIMINGS.approach) {
      if (s.fy1cSaved) transitionPhase('aftermath', gs);
      else transitionPhase('approach', gs);
    } else if (s.phase === 'approach' && t >= PHASE_TIMINGS.impact) {
      if (s.fy1cSaved) transitionPhase('aftermath', gs);
      else transitionPhase('impact', gs);
    } else if (s.phase === 'impact' && t >= PHASE_TIMINGS.aftermath) {
      transitionPhase('aftermath', gs);
    }
  }

  return {
    start(levelStartMs: number): void {
      s = makeL3State();
      s.levelStartMs = levelStartMs;
    },

    setWidth(w: number): void { W = w; },

    pauseShift(ms: number): void { s.levelStartMs += ms; },

    getSpawnConfig() {
      return spawnConfigForPhase();
    },

    isPlaying(): boolean {
      return s.phase === 'open' || s.phase === 'appear' || s.phase === 'approach' || s.phase === 'aftermath';
    },

    getPhase(): L3Phase { return s.phase; },
    isSaved(): boolean { return s.fy1cSaved; },
    isImpacted(): boolean { return s.fy1cImpacted; },
    getPhaseIndicator(): { text: string; warning: boolean } {
      return { text: s.phaseIndicator, warning: s.phaseWarning };
    },

    getFragments(): GameObject[] { return s.fragments; },

    getResult(score: number, passScore: number, destroyed: number, destroyLimit: number): L3Result | null {
      if (destroyed >= destroyLimit) return 'fail-destroyed';
      if (score < passScore) return 'fail';
      return s.fy1cSaved ? 'alternate' : 'pass';
    },

    handleTap(x: number, y: number, gs: EngineGameState): boolean {
      if (!s.fy1c) return false;
      if (s.phase !== 'appear' && s.phase !== 'approach') return false;
      const ddx = s.fy1c.x - x;
      const ddy = s.fy1c.y - y;
      if (ddx * ddx + ddy * ddy < (s.fy1c.r + 20) ** 2) {
        collectFx(gs, s.fy1c);
        gs.score += 200;
        gs.collected++;
        gs.labels.push({ x: s.fy1c.x, y: s.fy1c.y - 22, text: 'FY-1C preserved', life: 70, maxLife: 70, color: '#ffe0a8' });
        gs.labels.push({ x: s.fy1c.x, y: s.fy1c.y - 8, text: '+200', life: 70, maxLife: 70, color: '#ffd080' });
        s.fy1cSaved = true;
        s.fy1c = null;
        s.missile = null;
        Audio.playCollect();
        return true;
      }
      return false;
    },

    tick(gs: EngineGameState, ctx: CanvasRenderingContext2D, H: number): void {
      maybeAdvance(gs);

      if (s.phase === 'approach') {
        const intensity = 0.15 + Math.sin(Date.now() / 100) * 0.05;
        ctx.strokeStyle = `rgba(255,80,80,${intensity})`;
        ctx.lineWidth = 3;
        ctx.strokeRect(2, 2, ctx.canvas.width - 4, ctx.canvas.height - 4);
      }

      if (s.fy1c && (s.phase === 'appear' || s.phase === 'approach')) {
        const speedMult = s.phase === 'approach' ? 0.6 : 1.0;
        s.fy1c.x += s.fy1c.vx * speedMult;
        drawFY1C(ctx, s.fy1c, s.phase);
      }

      if (s.missile && s.phase === 'approach') {
        if (s.missile.y > H) {
          s.missile.y = H + 20;
        }
        if (s.fy1c) {
          const dx = s.fy1c.x - s.missile.x;
          const dy = s.fy1c.y - s.missile.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 8) {
            transitionPhase('impact', gs);
          } else {
            s.missile.x += (dx / dist) * s.missile.speed;
            s.missile.y += (dy / dist) * s.missile.speed;
            s.missile.trail.push({ x: s.missile.x, y: s.missile.y });
            if (s.missile.trail.length > 14) s.missile.trail.shift();
          }
        }
        if (s.missile) drawMissile(ctx, s.missile, s.fy1c ? { x: s.fy1c.x, y: s.fy1c.y } : null);
      }

      for (let i = s.fragments.length - 1; i >= 0; i--) {
        const f = s.fragments[i];
        f.x += f.vx; f.y += f.vy;
        f.vy += 0.06;
        f.vx *= 0.995; f.vy *= 0.995;
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
        if (f.y > H + 50 || f.x < -50 || f.x > ctx.canvas.width + 50) {
          s.fragments.splice(i, 1);
          gs.score += -2;
        }
      }
    },

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

    reset(): void {
      s = makeL3State();
    },
  };
}
