import type { ScoreBreakdown } from './score.js';

// Sleep data mirrors the Open Wearables SleepSession schema
// (GET /api/v1/users/{user_id}/events/sleep), so demo data and real data
// flow through the same code. Social fields live next to it, not inside it.

export type ProviderName =
  | 'apple'
  | 'samsung'
  | 'garmin'
  | 'health_connect'
  | 'google_health'
  | 'polar'
  | 'suunto'
  | 'whoop'
  | 'oura'
  | 'ultrahuman'
  | 'withings'
  | 'internal';

export type SleepStageType = 'in_bed' | 'awake' | 'sleeping' | 'light' | 'deep' | 'rem' | 'unknown';

export interface SleepStage {
  stage: SleepStageType;
  start_time: string; // ISO date-time
  end_time: string;
}

export interface SleepStagesSummary {
  awake_minutes: number | null;
  light_minutes: number | null;
  deep_minutes: number | null;
  rem_minutes: number | null;
}

export interface SourceMetadata {
  provider: ProviderName | string;
  source?: string | null;
  device?: string | null;
  device_name?: string | null;
}

export interface SleepSession {
  id: string;
  start_time: string;
  end_time: string;
  zone_offset?: string | null;
  source: SourceMetadata;
  duration_seconds: number;
  sleep_duration_seconds: number | null;
  time_in_bed_seconds: number | null;
  efficiency_percent: number | null;
  stages: SleepStagesSummary | null;
  sleep_stage_intervals: SleepStage[] | null;
  is_nap: boolean;
  is_final: boolean;
}

// ---- Social layer (ours, not Open Wearables) ----

export type Visibility = 'followers' | 'only_me';

export interface Sleeper {
  id: string;
  name: string;
  handle: string;
  city: string;
  color: string; // avatar colour
  provider: ProviderName;
}

export interface Comment {
  id: string;
  authorId: string;
  text: string;
  createdAt: string;
}

export interface Night {
  id: string;
  sleeperId: string;
  title: string;
  caption?: string;
  visibility: Visibility;
  session: SleepSession;
  kudos: string[]; // sleeper ids
  comments: Comment[];
  /** Stored by the server when the night was saved. */
  score?: ScoreBreakdown;
  /** Optional photo of the day; served from /api/photos/:id. */
  photo?: NightPhotoRef;
}

export interface NightPhotoRef {
  id: string;
  width: number;
  height: number;
}

export type ChallengeKind =
  | { type: 'min_duration'; minutes: number; nights: number }
  | { type: 'lights_out'; before: string; nights: number } // "23:30"
  | { type: 'streak'; minScore: number; nights: number };

export interface Challenge {
  id: string;
  name: string;
  blurb: string;
  emoji: string;
  kind: ChallengeKind;
  startDate: string; // ISO date
  endDate: string;
  participants: string[];
  /** Progress per participant, computed by the server. */
  board?: { userId: string; value: number }[];
}

export interface AppState {
  version: number;
  meId: string;
  me?: { email: string; healthConsentAt: string | null; owLinked: boolean };
  sleepers: Sleeper[];
  following: string[];
  nights: Night[];
  challenges: Challenge[];
  connectedProviders: ProviderName[];
  /** "demo" until an Open Wearables server is configured on the backend. */
  mode: 'demo' | 'open_wearables';
}
