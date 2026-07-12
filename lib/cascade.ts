import type { EngineGameState } from '@/lib/types';
import { spawnCascadeJunk } from '@/lib/spawn';
import { drawDensityMeter } from '@/lib/render';
import { CASCADE } from '@/data/tuning';
import * as Audio from '@/lib/audio';

let W = 680;
const H = 460;

interface CascadeState {
  density: number;        // 0–100
  pendingSpawns: number;  // cascade queue: pieces to spawn from missed debris
  frameCount: number;
  levelStartMs: number;
  junkSpeed: number;      // launch-velocity multiplier from the level config
}

function makeCascadeState(): CascadeState {
  return { density: 0, pendingSpawns: 0, frameCount: 0, levelStartMs: 0, junkSpeed: 1 };
}

export type CascadeManager = ReturnType<typeof createCascadeManager>;

export function createCascadeManager() {
  let s = makeCascadeState();

  function currentSpawnInterval(): number {
    // Start at ~0.7s per spawn, accelerate every 10s until the floor
    const speedupSteps = Math.floor(s.frameCount / 600);
    return Math.max(CASCADE.spawnIntervalFloor, CASCADE.spawnIntervalStart - speedupSteps * CASCADE.spawnIntervalStep);
  }

  return {
    start(levelStartMs: number, junkSpeed = 1): void {
      s = makeCascadeState();
      s.levelStartMs = levelStartMs;
      s.junkSpeed = junkSpeed;
    },

    setWidth(w: number): void { W = w; },

    pauseShift(ms: number): void { s.levelStartMs += ms; },

    getDensity(): number { return s.density; },

    getSurvivalTime(): number {
      return Math.floor((Date.now() - s.levelStartMs) / 1000);
    },

    // Called by engine when junk falls off-screen (miss event)
    onMiss(): void {
      s.density = Math.min(100, s.density + CASCADE.densityPerMiss);
      if (Math.random() < CASCADE.missCascadeChance) {
        s.pendingSpawns += CASCADE.missCascadeSpawns;
        s.density = Math.min(100, s.density + CASCADE.densityPerMissCascade);
      }
    },

    // Called by engine when player slices an active satellite in L6
    onActiveDestroyed(): void {
      s.density = Math.min(100, s.density + CASCADE.densityPerActiveDestroyed);
      s.pendingSpawns += CASCADE.activeDestroyedSpawns;
    },

    // Called by engine when player collects an active satellite in L6 (reduces density)
    onActiveCollected(): void {
      s.density = Math.max(0, s.density + CASCADE.densityPerActiveCollected);
    },

    isDead(): boolean { return s.density >= 100; },

    tick(gs: EngineGameState): void {
      s.frameCount++;

      // Base spawn — accelerating
      const interval = currentSpawnInterval();
      if (s.frameCount % interval === 0) {
        gs.objs.push(spawnCascadeJunk(W, H, s.junkSpeed));
      }

      // Cascade queue — drip in pending spawns to avoid sudden bursts
      if (s.pendingSpawns > 0 && s.frameCount % 10 === 0) {
        gs.objs.push(spawnCascadeJunk(W, H, s.junkSpeed));
        s.pendingSpawns = Math.max(0, s.pendingSpawns - 1);
      }

      // Passive density creep from sheer volume
      if (s.frameCount % 180 === 0 && s.density < 100) {
        s.density = Math.min(100, s.density + CASCADE.densityCreep);
      }

      // Continuous "control is slipping" drone tracks the density meter.
      // Updated every 15 frames — the audio side smooths between values.
      if (s.frameCount % 15 === 0) {
        Audio.setCascadeIntensity(s.density);
      }
    },

    drawMeter(ctx: CanvasRenderingContext2D): void {
      drawDensityMeter(ctx, s.density, W);
    },
  };
}
