const STORAGE_KEY = 'cascade-progress';

export interface Progress {
  unlockedLevel: number;
  bestScores: Record<number, number>;
}

const DEFAULT: Progress = { unlockedLevel: 1, bestScores: {} };

export function loadProgress(): Progress {
  if (typeof window === 'undefined') return { ...DEFAULT };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveProgress(patch: Partial<Progress>): void {
  if (typeof window === 'undefined') return;
  const current = loadProgress();
  const next = { ...current, ...patch };
  if (patch.bestScores) {
    next.bestScores = { ...current.bestScores, ...patch.bestScores };
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function recordLevelPass(levelId: number, score: number): void {
  const p = loadProgress();
  const bestScores = { ...p.bestScores };
  if (!bestScores[levelId] || score > bestScores[levelId]) {
    bestScores[levelId] = score;
  }
  const unlockedLevel = Math.max(p.unlockedLevel, levelId + 1);
  saveProgress({ unlockedLevel, bestScores });
}

export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}
