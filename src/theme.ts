import type { SleepStageType } from './data/types';

export const C = {
  bg: '#0B1020',
  surface: '#131A2C',
  surface2: '#1B2440',
  border: '#25304F',
  text: '#ECEEF6',
  muted: '#8C95B0',
  faint: '#5A6385',
  moon: '#F5C451',
  moonInk: '#2A1F00',
  good: '#5BE3A8',
  ok: '#F5C451',
  bad: '#F28B82',
};

export const STAGE: Record<SleepStageType, { color: string; label: string; row: number }> = {
  awake: { color: '#F28B82', label: 'Awake', row: 0 },
  in_bed: { color: '#F28B82', label: 'In bed', row: 0 },
  rem: { color: '#6FD3FF', label: 'REM', row: 1 },
  light: { color: '#7C8CFF', label: 'Light', row: 2 },
  sleeping: { color: '#7C8CFF', label: 'Asleep', row: 2 },
  unknown: { color: '#5A6385', label: 'Unknown', row: 2 },
  deep: { color: '#4B3FD6', label: 'Deep', row: 3 },
};

export const scoreColor = (s: number) => (s >= 80 ? C.good : s >= 60 ? C.ok : C.bad);

export const R = { sm: 8, md: 14, lg: 20, pill: 999 };

export const MAX_W = 640;
