import type { ProviderName, SleepSession, SleepStage, SleepStageType } from './types.js';

// Deterministic fake sleep in the Open Wearables SleepSession shape.

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rand = () => number;

export const gauss = (r: Rand, mean: number, sd: number) => {
  const u = Math.max(1e-9, r());
  const v = r();
  return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

export const uid = (r: Rand) =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const n = Math.floor(r() * 16);
    return (c === 'x' ? n : (n & 0x3) | 0x8).toString(16);
  });

/** Providers that do not send per-stage data, per the Open Wearables coverage matrix. */
const NO_STAGES: ProviderName[] = ['whoop', 'suunto'];

export const PROVIDER_LABEL: Record<string, string> = {
  apple: 'Apple Watch',
  samsung: 'Galaxy Watch',
  garmin: 'Garmin',
  health_connect: 'Health Connect',
  google_health: 'Fitbit / Google',
  polar: 'Polar',
  suunto: 'Suunto',
  whoop: 'Whoop',
  oura: 'Oura Ring',
  ultrahuman: 'Ultrahuman Ring',
  withings: 'Withings',
  internal: 'Logged by hand',
};

/**
 * Builds a hypnogram of ~90 minute cycles: more deep sleep early in the night,
 * more REM late, and a few short wake-ups.
 */
export function buildSession(
  r: Rand,
  bedtime: Date,
  asleepTargetMin: number,
  provider: ProviderName,
  restlessness = 1,
): SleepSession {
  const latency = Math.max(4, Math.round(gauss(r, 14, 6)));
  const intervals: SleepStage[] = [];
  let t = bedtime.getTime();
  const push = (stage: SleepStageType, min: number) => {
    const m = Math.max(1, Math.round(min));
    intervals.push({
      stage,
      start_time: new Date(t).toISOString(),
      end_time: new Date(t + m * 60000).toISOString(),
    });
    t += m * 60000;
    return m;
  };

  push('awake', latency);
  let asleep = 0;
  let cycle = 0;
  while (asleep < asleepTargetMin) {
    const early = Math.max(0, 1 - cycle / 4);
    const left = asleepTargetMin - asleep;
    const parts: [SleepStageType, number][] = [
      ['light', gauss(r, 28, 7)],
      ['deep', Math.max(3, gauss(r, 4 + 18 * early, 4))],
      ['light', gauss(r, 22, 6)],
      ['rem', Math.max(4, gauss(r, 6 + 18 * (1 - early), 4))],
    ];
    for (const [stage, min] of parts) {
      if (asleep >= asleepTargetMin) break;
      asleep += push(stage, Math.min(Math.max(3, min), left));
    }
    if (r() < 0.35 * restlessness && asleep < asleepTargetMin) push('awake', Math.max(1, gauss(r, 5, 3)));
    cycle++;
  }
  if (r() < 0.5) push('awake', Math.max(1, gauss(r, 4, 2)));

  const sum = (s: SleepStageType) =>
    intervals
      .filter((i) => i.stage === s)
      .reduce((a, i) => a + (Date.parse(i.end_time) - Date.parse(i.start_time)) / 60000, 0);
  const inBed = (t - bedtime.getTime()) / 1000;
  const awake = sum('awake');
  const sleepSec = Math.round(inBed - awake * 60);
  const hasStages = !NO_STAGES.includes(provider);

  return {
    id: uid(r),
    start_time: bedtime.toISOString(),
    end_time: new Date(t).toISOString(),
    zone_offset: null,
    source: { provider, device_name: PROVIDER_LABEL[provider] ?? provider },
    duration_seconds: Math.round(inBed),
    sleep_duration_seconds: sleepSec,
    time_in_bed_seconds: Math.round(inBed),
    efficiency_percent: provider === 'polar' ? null : Math.round((sleepSec / inBed) * 1000) / 10,
    stages: hasStages
      ? {
          awake_minutes: Math.round(awake),
          light_minutes: Math.round(sum('light')),
          deep_minutes: Math.round(sum('deep')),
          rem_minutes: Math.round(sum('rem')),
        }
      : { awake_minutes: Math.round(awake), light_minutes: null, deep_minutes: null, rem_minutes: null },
    sleep_stage_intervals: hasStages
      ? intervals
      : intervals.map((i) => ({ ...i, stage: i.stage === 'awake' ? 'awake' : 'sleeping' })),
    is_nap: false,
    is_final: true,
  };
}

/** A session logged by hand: only bed and wake time, no stages. */
export function manualSession(bed: Date, wake: Date, id: string): SleepSession {
  const sec = Math.round((wake.getTime() - bed.getTime()) / 1000);
  return {
    id,
    start_time: bed.toISOString(),
    end_time: wake.toISOString(),
    source: { provider: 'internal', device_name: PROVIDER_LABEL.internal },
    duration_seconds: sec,
    sleep_duration_seconds: sec,
    time_in_bed_seconds: sec,
    efficiency_percent: null,
    stages: null,
    sleep_stage_intervals: [{ stage: 'sleeping', start_time: bed.toISOString(), end_time: wake.toISOString() }],
    is_nap: false,
    is_final: true,
  };
}
