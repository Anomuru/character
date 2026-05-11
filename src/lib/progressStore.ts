// Per-job progress: tracks best star rating and play count.
// Persisted to localStorage and broadcast via a CustomEvent so React can react.

const KEY = "kasb-progress-v1";
const EVENT = "progress:change";

export type JobProgress = {
  bestStars: number; // 0-3
  plays: number;
  lastPlayed: number; // epoch ms
};

type Store = Record<string, JobProgress>;

function read(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function write(store: Store) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    // Quota or disabled storage — fail quietly; the UI still works for this session.
  }
  window.dispatchEvent(new Event(EVENT));
}

export function getJobProgress(jobId: string): JobProgress | undefined {
  return read()[jobId];
}

export function getAllProgress(): Store {
  return read();
}

// Records a completed run. Only overwrites bestStars if the new score is higher.
export function recordJobResult(jobId: string, stars: number) {
  const safeStars = Math.max(0, Math.min(3, Math.round(stars)));
  const store = read();
  const prev = store[jobId];
  store[jobId] = {
    bestStars: Math.max(prev?.bestStars ?? 0, safeStars),
    plays: (prev?.plays ?? 0) + 1,
    lastPlayed: Date.now(),
  };
  write(store);
}

export function clearAllProgress() {
  write({});
}

export const PROGRESS_EVENT = EVENT;

// Stars are derived from wrong-pick count: 3 perfect, 2 if 1 mistake, 1 if 2–3 mistakes.
// Higher mistakes still grant 1 star for completion encouragement.
export function starsFromMistakes(wrongCount: number): number {
  if (wrongCount <= 0) return 3;
  if (wrongCount === 1) return 2;
  return 1;
}
