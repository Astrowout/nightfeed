import { buildSession, gauss, rng, uid } from './generate';
import type { AppState, Challenge, Night, ProviderName, Sleeper } from './types';

// All people below are invented. No real personal data is used.

interface Persona extends Sleeper {
  bedMean: number; // minutes after 18:00
  bedSd: number;
  sleepMean: number; // minutes asleep
  sleepSd: number;
  restless: number;
}

const PERSONAS: Persona[] = [
  { id: 'me', name: 'You', handle: 'you', city: 'Antwerp', color: '#F5C451', provider: 'garmin', bedMean: 315, bedSd: 30, sleepMean: 425, sleepSd: 35, restless: 1 },
  { id: 'lotte', name: 'Lotte Verhaegen', handle: 'lottev', city: 'Ghent', color: '#9B8CFF', provider: 'oura', bedMean: 290, bedSd: 15, sleepMean: 460, sleepSd: 20, restless: 0.6 },
  { id: 'jonas', name: 'Jonas De Wilde', handle: 'jonasdw', city: 'Leuven', color: '#6FD3FF', provider: 'whoop', bedMean: 345, bedSd: 45, sleepMean: 400, sleepSd: 45, restless: 1.3 },
  { id: 'amira', name: 'Amira Haddad', handle: 'amira.h', city: 'Brussels', color: '#5BE3A8', provider: 'apple', bedMean: 300, bedSd: 25, sleepMean: 445, sleepSd: 30, restless: 0.9 },
  { id: 'pieter', name: 'Pieter Claes', handle: 'pclaes', city: 'Bruges', color: '#F28B82', provider: 'polar', bedMean: 330, bedSd: 35, sleepMean: 415, sleepSd: 40, restless: 1.1 },
  { id: 'sofie', name: 'Sofie Maes', handle: 'sofiemaes', city: 'Mechelen', color: '#FFB86B', provider: 'ultrahuman', bedMean: 275, bedSd: 20, sleepMean: 480, sleepSd: 25, restless: 0.7 },
  { id: 'ruben', name: 'Ruben Peeters', handle: 'rubenp', city: 'Hasselt', color: '#C792EA', provider: 'samsung', bedMean: 375, bedSd: 50, sleepMean: 385, sleepSd: 50, restless: 1.4 },
  { id: 'elise', name: 'Elise Janssens', handle: 'elisej', city: 'Antwerp', color: '#7FD1B9', provider: 'google_health', bedMean: 305, bedSd: 20, sleepMean: 450, sleepSd: 25, restless: 0.8 },
];

const TITLES = {
  early: ['Early lights out', 'In bed before the news', 'Grandma hours'],
  normal: ['Night shift: sleeping', 'Standard issue night', 'Back to the routine', 'Quiet one'],
  late: ['Late one', 'Owl mode', 'One more episode…'],
  long: ['Hibernation', 'Full recharge', 'Long haul'],
  short: ['Running on fumes', 'Short and not sweet', 'Power night'],
};

const COMMENTS = [
  'That deep sleep block though 👀',
  'Teach me your ways',
  'Same bedtime as me, twins',
  'How are you this consistent?',
  'Coffee after 3pm again? 😅',
  'Solid recovery before the weekend',
  'Respect the early lights out',
  'That REM at the end is wild',
];

export function titleFor(bedMinAfter18: number, asleepMin: number, r: () => number): string {
  const pick = (xs: string[]) => xs[Math.floor(r() * xs.length)];
  if (asleepMin >= 500) return pick(TITLES.long);
  if (asleepMin < 360) return pick(TITLES.short);
  if (bedMinAfter18 < 285) return pick(TITLES.early);
  if (bedMinAfter18 > 360) return pick(TITLES.late);
  return pick(TITLES.normal);
}

function dayStart(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function createSeed(now = new Date()): AppState {
  const r = rng(20261115);
  const sleepers: Sleeper[] = PERSONAS.map(({ id, name, handle, city, color, provider }) => ({
    id,
    name,
    handle,
    city,
    color,
    provider,
  }));
  const nights: Night[] = [];
  const today = dayStart(now);
  const ids = sleepers.map((s) => s.id);

  for (const p of PERSONAS) {
    for (let back = 56; back >= 1; back--) {
      if (p.id !== 'me' && r() < 0.08) continue; // forgot to wear it
      const evening = new Date(today.getTime() - back * 86400000);
      evening.setHours(18, 0, 0, 0);
      const weekend = [5, 6].includes(evening.getDay());
      const bedMin = Math.round(gauss(r, p.bedMean + (weekend ? 50 : 0), p.bedSd));
      const bed = new Date(evening.getTime() + bedMin * 60000);
      const asleep = Math.max(240, Math.round(gauss(r, p.sleepMean + (weekend ? 25 : 0), p.sleepSd)));
      const session = buildSession(r, bed, asleep, p.provider as ProviderName, p.restless);
      const others = ids.filter((i) => i !== p.id);
      const kudos = back <= 10 ? others.filter(() => r() < 0.4) : [];
      const comments =
        back <= 7 && r() < 0.35
          ? [
              {
                id: uid(r),
                authorId: others[Math.floor(r() * others.length)],
                text: COMMENTS[Math.floor(r() * COMMENTS.length)],
                createdAt: new Date(Date.parse(session.end_time) + 3600000).toISOString(),
              },
            ]
          : [];
      nights.push({
        id: session.id,
        sleeperId: p.id,
        title: titleFor(bedMin, asleep, r),
        visibility: 'followers',
        session,
        kudos,
        comments,
      });
    }
  }

  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const start = new Date(today.getTime() - 9 * 86400000);
  const challenges: Challenge[] = [
    {
      id: 'c-7h',
      name: 'The 7-Hour Club',
      blurb: 'Sleep 7 hours or more on 12 nights within 21 days.',
      emoji: '🌙',
      kind: { type: 'min_duration', minutes: 420, nights: 12 },
      startDate: iso(start),
      endDate: iso(new Date(start.getTime() + 20 * 86400000)),
      participants: ['me', 'lotte', 'amira', 'sofie', 'elise', 'pieter'],
    },
    {
      id: 'c-lights',
      name: 'Lights Out by 23:30',
      blurb: 'In bed before 23:30 on 10 nights this month.',
      emoji: '💡',
      kind: { type: 'lights_out', before: '23:30', nights: 10 },
      startDate: iso(new Date(today.getFullYear(), today.getMonth(), 1)),
      endDate: iso(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
      participants: ['lotte', 'sofie', 'jonas', 'ruben', 'elise'],
    },
    {
      id: 'c-streak',
      name: 'Five Solid Nights',
      blurb: 'Score 75 or higher on 5 nights in a row.',
      emoji: '🔥',
      kind: { type: 'streak', minScore: 75, nights: 5 },
      startDate: iso(new Date(today.getTime() - 14 * 86400000)),
      endDate: iso(new Date(today.getTime() + 14 * 86400000)),
      participants: ['amira', 'jonas', 'pieter', 'sofie'],
    },
  ];

  return {
    version: 1,
    meId: 'me',
    sleepers,
    following: ['lotte', 'jonas', 'amira', 'pieter', 'sofie'],
    nights,
    challenges,
    connectedProviders: ['garmin'],
    dataSource: { mode: 'demo', baseUrl: '', apiKey: '', userId: '' },
  };
}
