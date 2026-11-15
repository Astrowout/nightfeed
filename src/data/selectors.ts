import { asleepMinutes, bedtimeMinutes, scoreNight } from './score';
import type { AppState, Challenge, Night } from './types';

export const byNewest = (a: Night, b: Night) => (a.session.end_time < b.session.end_time ? 1 : -1);

export function nightsOf(state: AppState, sleeperId: string): Night[] {
  return state.nights.filter((n) => n.sleeperId === sleeperId).sort(byNewest);
}

/** Your own nights plus followers-visible nights of people you follow. */
export function feed(state: AppState): Night[] {
  return state.nights
    .filter(
      (n) =>
        n.sleeperId === state.meId || (state.following.includes(n.sleeperId) && n.visibility === 'followers'),
    )
    .sort(byNewest);
}

export function sleeper(state: AppState, id: string) {
  return state.sleepers.find((s) => s.id === id);
}

const DAY = 86400000;

export interface PeriodStats {
  nights: number;
  avgAsleep: number;
  avgScore: number;
  totalAsleep: number;
}

export function periodStats(state: AppState, sleeperId: string, fromDaysAgo: number, toDaysAgo = 0): PeriodStats {
  const now = Date.now();
  const list = nightsOf(state, sleeperId).filter((n) => {
    const t = Date.parse(n.session.end_time);
    return t > now - fromDaysAgo * DAY && t <= now - toDaysAgo * DAY && !n.session.is_nap;
  });
  if (!list.length) return { nights: 0, avgAsleep: 0, avgScore: 0, totalAsleep: 0 };
  const asleep = list.map((n) => asleepMinutes(n.session));
  const scores = list.map((n) => scoreNight(n, state.nights).total);
  const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
  return {
    nights: list.length,
    avgAsleep: sum(asleep) / list.length,
    avgScore: sum(scores) / list.length,
    totalAsleep: sum(asleep),
  };
}

/** Consecutive recent nights with a score of at least `min`. */
export function streak(state: AppState, sleeperId: string, min = 70): number {
  let n = 0;
  for (const night of nightsOf(state, sleeperId)) {
    if (night.session.is_nap) continue;
    if (scoreNight(night, state.nights).total >= min) n++;
    else break;
  }
  return n;
}

export function lastNDays(state: AppState, sleeperId: string, days = 7): { label: string; minutes: number }[] {
  const out: { label: string; minutes: number }[] = [];
  const mine = nightsOf(state, sleeperId);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    const dayStart = d.getTime() - i * DAY;
    const found = mine.find((n) => {
      const t = Date.parse(n.session.end_time);
      return t >= dayStart && t < dayStart + DAY && !n.session.is_nap;
    });
    out.push({
      label: new Date(dayStart).toLocaleDateString('en-GB', { weekday: 'narrow' }),
      minutes: found ? asleepMinutes(found.session) : 0,
    });
  }
  return out;
}

export interface Best {
  label: string;
  value: string;
  nightId: string;
}

export function personalBests(state: AppState, sleeperId: string): { night: Night; score: number }[] {
  return nightsOf(state, sleeperId)
    .map((night) => ({ night, score: scoreNight(night, state.nights).total }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

/** Is this night the sleeper's best score in the last 28 days? Used for a trophy on the card. */
export function isMonthBest(state: AppState, night: Night): boolean {
  const cutoff = Date.parse(night.session.end_time) - 28 * DAY;
  const mine = state.nights.filter(
    (n) =>
      n.sleeperId === night.sleeperId &&
      Date.parse(n.session.end_time) > cutoff &&
      n.session.end_time <= night.session.end_time,
  );
  if (mine.length < 7) return false;
  const s = scoreNight(night, state.nights).total;
  return mine.every((n) => n.id === night.id || scoreNight(n, state.nights).total < s);
}

export function challengeProgress(state: AppState, c: Challenge, sleeperId: string): number {
  const start = Date.parse(c.startDate);
  const end = Date.parse(c.endDate) + DAY;
  const list = nightsOf(state, sleeperId)
    .filter((n) => {
      const t = Date.parse(n.session.end_time);
      return t >= start && t < end && !n.session.is_nap;
    })
    .reverse();
  const k = c.kind;
  if (k.type === 'min_duration') return list.filter((n) => asleepMinutes(n.session) >= k.minutes).length;
  if (k.type === 'lights_out') {
    const [h, m] = k.before.split(':').map(Number);
    const limit = (h * 60 + m - 18 * 60 + 1440) % 1440;
    return list.filter((n) => bedtimeMinutes(n.session.start_time) <= limit).length;
  }
  let best = 0;
  let run = 0;
  for (const n of list) {
    run = scoreNight(n, state.nights).total >= k.minScore ? run + 1 : 0;
    best = Math.max(best, run);
  }
  return best;
}

export function challengeTarget(c: Challenge): number {
  return c.kind.nights;
}
