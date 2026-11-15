import type { Night, SleepSession } from './types';

// Our own score, computed from normalised minutes only, so every brand is
// scored the same way. Weights follow four pillars:
// duration 0.40, stages 0.20, consistency 0.20, interruptions 0.20.
// When a provider has no stage data (Whoop, Suunto) that pillar is dropped
// and the remaining weights are rescaled, instead of guessing stages.

export const WEIGHTS = { duration: 0.4, stages: 0.2, consistency: 0.2, interruptions: 0.2 };

export interface ScoreBreakdown {
  total: number;
  duration: number;
  stages: number | null;
  consistency: number | null;
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

function stagesScore(s: SleepSession): number | null {
  const st = s.stages;
  if (!st || st.deep_minutes == null || st.rem_minutes == null || st.light_minutes == null) return null;
  const asleep = st.deep_minutes + st.rem_minutes + st.light_minutes;
  if (asleep <= 0) return null;
  const deep = (st.deep_minutes / asleep) * 100;
  const rem = (st.rem_minutes / asleep) * 100;
  const off = (v: number, lo: number, hi: number) => (v < lo ? lo - v : v > hi ? v - hi : 0);
  return clamp(100 - off(deep, 13, 23) * 4 - off(rem, 18, 25) * 4);
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

function consistencyScore(s: SleepSession, previous: SleepSession[]): number | null {
  if (previous.length < 3) return null;
  const base = median(previous.map((p) => bedtimeMinutes(p.start_time)));
  const diff = Math.abs(bedtimeMinutes(s.start_time) - base);
  return clamp(100 - (diff / 90) * 100);
}

function interruptionsScore(s: SleepSession): number {
  const awake = s.stages?.awake_minutes ?? Math.max(0, s.duration_seconds / 60 - asleepMinutes(s));
  const wakeUps = (s.sleep_stage_intervals ?? []).filter((i) => i.stage === 'awake').length;
  return clamp(100 - awake * 1.2 - wakeUps * 4);
}

export function scoreSession(s: SleepSession, previous: SleepSession[]): ScoreBreakdown {
  const parts = {
    duration: durationScore(asleepMinutes(s)),
    stages: stagesScore(s),
    consistency: consistencyScore(s, previous),
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
  return { ...parts, total: Math.round(sum / weight) };
}

/** Score a night against the same sleeper's 14 main sleeps before it. */
export function scoreNight(night: Night, all: Night[]): ScoreBreakdown {
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
