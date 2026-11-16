import type { Night, SleepSession } from './types.js';

// Our own score, computed from normalised minutes only, so every brand is
// scored the same way. It leans on timing, which wearables measure well:
// duration 0.35, regular lights out 0.25, regular wake-up 0.25, interruptions 0.15.
// Sleep stages are left out on purpose: wrist devices agree poorly with lab
// tests on stages, so scoring them would mostly compare devices, not nights.
// Regularity needs 3 earlier nights; until then those pillars are dropped and
// the remaining weights are rescaled.

/** Bump when the formula changes, so stored breakdowns get recomputed. */
export const SCORE_VERSION = 2;

export const WEIGHTS = { duration: 0.35, bedtime: 0.25, wake: 0.25, interruptions: 0.15 };

export interface ScoreBreakdown {
  v?: number;
  total: number;
  duration: number;
  bedtime: number | null;
  wake: number | null;
  interruptions: number;
}

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

export function asleepMinutes(s: SleepSession): number {
  if (s.sleep_duration_seconds != null) return s.sleep_duration_seconds / 60;
  const awake = s.stages?.awake_minutes ?? 0;
  return s.duration_seconds / 60 - awake;
}

function durationScore(min: number): number {
  const h = min / 60;
  if (h >= 7 && h <= 9) return 100;
  if (h < 7) return clamp(((h - 4) / 3) * 100);
  return clamp(100 - (h - 9) * 25);
}

/** Minutes after 18:00 local time, so 23:30 and 00:30 are comparable. */
export function bedtimeMinutes(iso: string): number {
  const d = new Date(iso);
  let m = d.getHours() * 60 + d.getMinutes() - 18 * 60;
  if (m < 0) m += 24 * 60;
  return m;
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Minutes after midnight local time. */
export function wakeMinutes(iso: string): number {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

/** Distance between two clock times in minutes, across midnight. */
export function clockDiff(a: number, b: number): number {
  const d = Math.abs(a - b) % 1440;
  return Math.min(d, 1440 - d);
}

/** Full marks within 15 minutes of the usual time, zero at 90 minutes off. */
function regularity(value: number, usual: number[]): number {
  const diff = clockDiff(value, median(usual));
  return clamp(100 - (Math.max(0, diff - 15) / 75) * 100);
}

function bedtimeScore(s: SleepSession, previous: SleepSession[]): number | null {
  if (previous.length < 3) return null;
  return regularity(bedtimeMinutes(s.start_time), previous.map((p) => bedtimeMinutes(p.start_time)));
}

function wakeScore(s: SleepSession, previous: SleepSession[]): number | null {
  if (previous.length < 3) return null;
  return regularity(wakeMinutes(s.end_time), previous.map((p) => wakeMinutes(p.end_time)));
}

function interruptionsScore(s: SleepSession): number {
  const awake = s.stages?.awake_minutes ?? Math.max(0, s.duration_seconds / 60 - asleepMinutes(s));
  const wakeUps = (s.sleep_stage_intervals ?? []).filter((i) => i.stage === 'awake').length;
  return clamp(100 - awake * 1.2 - wakeUps * 4);
}

export function scoreSession(s: SleepSession, previous: SleepSession[]): ScoreBreakdown {
  const parts = {
    duration: durationScore(asleepMinutes(s)),
    bedtime: bedtimeScore(s, previous),
    wake: wakeScore(s, previous),
    interruptions: interruptionsScore(s),
  };
  let sum = 0;
  let weight = 0;
  (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).forEach((k) => {
    const v = parts[k];
    if (v != null) {
      sum += v * WEIGHTS[k];
      weight += WEIGHTS[k];
    }
  });
  return { v: SCORE_VERSION, ...parts, total: Math.round(sum / weight) };
}

/** Score a night against the same sleeper's 14 main sleeps before it. */
export function scoreNight(night: Night, all: Night[]): ScoreBreakdown {
  if (night.score?.v === SCORE_VERSION) return night.score;
  const prev = all
    .filter(
      (n) =>
        n.sleeperId === night.sleeperId &&
        !n.session.is_nap &&
        n.session.start_time < night.session.start_time,
    )
    .sort((a, b) => (a.session.start_time < b.session.start_time ? 1 : -1))
    .slice(0, 14)
    .map((n) => n.session);
  return scoreSession(night.session, prev);
}

export function scoreLabel(score: number): string {
  if (score >= 85) return 'Restored';
  if (score >= 70) return 'Solid';
  if (score >= 55) return 'Patchy';
  return 'Rough';
}
