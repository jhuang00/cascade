// Difficulty tuning surface — every number playtesting is likely to touch,
// in one place, so calibration is a data edit rather than a code hunt.
// Per-level knobs (duration, spawn intervals, passScore, hardFails) live in
// data/levels.ts; these are the cross-level scoring and L6 cascade constants.

export const SCORING = {
  sliceJunk: 10,        // clear a piece of debris
  sliceRare: 5,         // rare artifact destroyed instead of collected
  sliceActive: -25,     // working satellite destroyed
  collectRare: 100,     // artifact preserved
  collectActiveL6: 50,  // L6 only: removing an active relieves the cascade
  missJunk: -5,         // debris left orbit untouched
} as const;

export const CASCADE = {
  // Base spawn: starts at one piece per `spawnIntervalStart` frames,
  // tightening by `spawnIntervalStep` every 10s down to the floor.
  spawnIntervalStart: 42,
  spawnIntervalFloor: 18,
  spawnIntervalStep: 2,

  // Density meter (0–100; 100 = loss)
  densityPerMiss: 0.8,
  missCascadeChance: 0.4,   // missed junk may seed new debris…
  missCascadeSpawns: 2,     // …this many pieces…
  densityPerMissCascade: 0.3, // …and this much extra density
  densityPerActiveDestroyed: 3.5,
  activeDestroyedSpawns: 3,
  densityPerActiveCollected: -2,
  densityCreep: 0.3,        // passive rise every 3s from sheer volume
} as const;
