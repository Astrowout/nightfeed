import { bedtimeMinutes, clockDiff, wakeMinutes } from './score.js';
import type { ChallengeKind, SleepSession } from './types.js';

// Challenges reward habits a person controls (when the lights go out, a steady
// wake-up, giving yourself enough time in bed), never the score. Timing is what
// every wearable measures well, so the board compares people, not devices.

const KINDS = ['in_bed', 'lights_out', 'steady_wake'] as const;

/** False for kinds this version no longer runs, such as stored rounds of the old score streak. */
export function isKnownKind(kind: { type: string }): kind is ChallengeKind {
  return (KINDS as readonly string[]).includes(kind.type);
}

function median(xs: number[]): number {
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Nights that count toward a challenge, from one person's main sleeps inside its dates. */
export function challengeNights(kind: ChallengeKind, sessions: SleepSession[]): number {
  if (kind.type === 'in_bed') {
    return sessions.filter((s) => (s.time_in_bed_seconds ?? s.duration_seconds) / 60 >= kind.minutes).length;
  }
  if (kind.type === 'lights_out') {
    const [h, m] = kind.before.split(':').map(Number);
    const limit = (h * 60 + m - 18 * 60 + 1440) % 1440;
    return sessions.filter((s) => bedtimeMinutes(s.start_time) <= limit).length;
  }
  if (!sessions.length) return 0;
  const usual = median(sessions.map((s) => wakeMinutes(s.end_time)));
  return sessions.filter((s) => clockDiff(wakeMinutes(s.end_time), usual) <= kind.window).length;
}
