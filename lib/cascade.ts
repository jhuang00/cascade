import type { EngineGameState } from '@/lib/types';
import { spawnCascadeJunk } from '@/lib/spawn';
import { drawDensityMeter } from '@/lib/render';
import * as Audio from '@/lib/audio';

let W = 680;
const H = 460;

interface CascadeState {
  density: number;        // 0–100
  pendingSpawns: number;  // cascade queue: pieces to spawn from missed debris
  frameCount: number;
  levelStartMs: number;
}

function makeCascadeState(): CascadeState {
  return { density: 0, pendingSpawns: 0, frameCount: 0, levelStartMs: 0 };
}

export type CascadeManager = ReturnType<typeof createCascadeManager>;

export function createCascadeManager() {
  let s = makeCascadeState();

  function currentSpawnInterval(): number {
    // Start at 42 frames (~0.7s), accelerate every 10s until floored at 18
    const speedupSteps = Math.floor(s.frameCount / 600);
    return Math.max(18, 42 - speedupSteps * 2);
  }

  return {
    start(levelStartMs: number): void {
      s = makeCascadeState();
      s.levelStartMs = levelStartMs;
    },

    setWidth(w: number): void { W = w; },

    pauseShift(ms: number): void { s.levelStartMs += ms; },

    getDensity(): number { return s.density; },

    getSurvivalTime(): number {
      return Math.floor((Date.now() - s.levelStartMs) / 1000);
    },

    // Called by engine when junk falls off-screen (miss event)
    onMiss(): void {
      s.density = Math.min(100, s.density + 0.8);
      if (Math.random() < 0.4) {
        s.pendingSpawns += 2;
        s.density = Math.min(100, s.density + 0.3);
      }
    },

    // Called by engine when player slices an active satellite in L6
    onActiveDestroyed(): void {
      s.density = Math.min(100, s.density + 3.5);
      s.pendingSpawns += 3;
    },

    // Called by engine when player collects an active satellite in L6 (reduces density)
    onActiveCollected(): void {
      s.density = Math.max(0, s.density - 2);
    },

    isDead(): boolean { return s.density >= 100; },

    tick(gs: EngineGameState): void {
      s.frameCount++;

      // Base spawn — accelerating
      const interval = currentSpawnInterval();
      if (s.frameCount % interval === 0) {
        gs.objs.push(spawnCascadeJunk(W, H));
      }

      // Cascade queue — drip in pending spawns to avoid sudden bursts
      if (s.pendingSpawns > 0 && s.frameCount % 10 === 0) {
        gs.objs.push(spawnCascadeJunk(W, H));
        s.pendingSpawns = Math.max(0, s.pendingSpawns - 1);
      }

      // Passive density creep from sheer volume
      if (s.frameCount % 180 === 0 && s.density < 100) {
        s.density = Math.min(100, s.density + 0.3);
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
