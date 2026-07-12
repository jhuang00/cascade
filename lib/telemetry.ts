// Playtest telemetry — dev-only instrumentation behind ?debug=1.
// Records one RunRecord per level attempt (1s samples of score/miss/density)
// into localStorage so difficulty tuning works from data instead of vibes.
// Zero cost in normal play: every hook no-ops unless the flag is present.

const STORAGE_KEY = 'cascade-telemetry';
const MAX_RUNS = 40;      // ring buffer — oldest runs drop off
const SAMPLE_MS = 1000;

export interface RunSample {
  t: number;        // seconds since level start
  score: number;
  cleared: number;
  missed: number;
  density?: number; // L6 only
}

export interface RunRecord {
  level: number;           // 1-based level id
  startedAt: string;       // ISO timestamp
  durationS: number;
  result: 'pass' | 'fail' | 'abandoned';
  failReason?: string;
  finalScore: number;
  cleared: number;
  missed: number;
  destroyed: number;
  collected: number;
  survivalTime?: number;   // L6
  samples: RunSample[];
}

interface RunStats {
  score: number;
  cleared: number;
  missed: number;
  destroyed: number;
  collected: number;
  densityMeter: number;
}

export function telemetryEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return new URLSearchParams(window.location.search).get('debug') === '1';
}

let current: RunRecord | null = null;
let runStartMs = 0;
let lastSampleMs = 0;

export function startRun(levelIdx: number): void {
  if (!telemetryEnabled()) return;
  // A run that never ended (level exited mid-play) is still worth keeping.
  if (current) finalize('abandoned');
  runStartMs = Date.now();
  lastSampleMs = 0;
  current = {
    level: levelIdx + 1,
    startedAt: new Date().toISOString(),
    durationS: 0,
    result: 'abandoned',
    finalScore: 0,
    cleared: 0,
    missed: 0,
    destroyed: 0,
    collected: 0,
    samples: [],
  };
}

// Called every frame from the engine loop; self-throttles to 1 Hz.
export function sample(gs: RunStats, isL6: boolean): void {
  if (!current) return;
  const now = Date.now();
  if (now - lastSampleMs < SAMPLE_MS) return;
  lastSampleMs = now;
  const s: RunSample = {
    t: Math.round((now - runStartMs) / 1000),
    score: gs.score,
    cleared: gs.cleared,
    missed: gs.missed,
  };
  if (isL6) s.density = Math.round(gs.densityMeter);
  current.samples.push(s);
}

export function endRun(success: boolean, gs: RunStats, failReason?: string, survivalTime?: number): void {
  if (!current) return;
  current.finalScore = gs.score;
  current.cleared = gs.cleared;
  current.missed = gs.missed;
  current.destroyed = gs.destroyed;
  current.collected = gs.collected;
  if (survivalTime !== undefined) current.survivalTime = survivalTime;
  if (failReason) current.failReason = failReason;
  finalize(success ? 'pass' : 'fail');
}

function finalize(result: RunRecord['result']): void {
  if (!current) return;
  current.result = result;
  current.durationS = Math.round((Date.now() - runStartMs) / 1000);
  const runs = getRuns();
  runs.push(current);
  while (runs.length > MAX_RUNS) runs.shift();
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(runs)); } catch { /* full/blocked — drop */ }
  current = null;
}

export function getRuns(): RunRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RunRecord[]) : [];
  } catch {
    return [];
  }
}

export function clearRuns(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

export function downloadRuns(): void {
  const blob = new Blob([JSON.stringify(getRuns(), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cascade-telemetry-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
