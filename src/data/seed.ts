import type { Sleeper } from './types.js';

// All people below are invented. No real personal data is used.

export interface Persona extends Sleeper {
  bedMean: number; // minutes after 18:00
  bedSd: number;
  sleepMean: number; // minutes asleep
  sleepSd: number;
  restless: number;
}

export const PERSONAS: Persona[] = [
  { id: 'me', name: 'You', handle: 'you', city: 'Antwerp', color: '#D4C7FF', provider: 'garmin', bedMean: 315, bedSd: 30, sleepMean: 425, sleepSd: 35, restless: 1 },
  { id: 'lotte', name: 'Lotte Verhaegen', handle: 'lottev', city: 'Ghent', color: '#9BD8A9', provider: 'oura', bedMean: 290, bedSd: 15, sleepMean: 460, sleepSd: 20, restless: 0.6 },
  { id: 'jonas', name: 'Jonas De Wilde', handle: 'jonasdw', city: 'Leuven', color: '#B8CAF5', provider: 'whoop', bedMean: 345, bedSd: 45, sleepMean: 400, sleepSd: 45, restless: 1.3 },
  { id: 'amira', name: 'Amira Haddad', handle: 'amira.h', city: 'Brussels', color: '#FDE99B', provider: 'apple', bedMean: 300, bedSd: 25, sleepMean: 445, sleepSd: 30, restless: 0.9 },
  { id: 'pieter', name: 'Pieter Claes', handle: 'pclaes', city: 'Bruges', color: '#F8D3C2', provider: 'polar', bedMean: 330, bedSd: 35, sleepMean: 415, sleepSd: 40, restless: 1.1 },
  { id: 'sofie', name: 'Sofie Maes', handle: 'sofiemaes', city: 'Mechelen', color: '#C9E7EF', provider: 'ultrahuman', bedMean: 275, bedSd: 20, sleepMean: 480, sleepSd: 25, restless: 0.7 },
  { id: 'ruben', name: 'Ruben Peeters', handle: 'rubenp', city: 'Hasselt', color: '#E5DCFF', provider: 'samsung', bedMean: 375, bedSd: 50, sleepMean: 385, sleepSd: 50, restless: 1.4 },
  { id: 'elise', name: 'Elise Janssens', handle: 'elisej', city: 'Antwerp', color: '#CDEBD3', provider: 'google_health', bedMean: 305, bedSd: 20, sleepMean: 450, sleepSd: 25, restless: 0.8 },
];

const TITLES = {
  early: ['Early lights out', 'In bed before the news', 'Grandma hours'],
  normal: ['Night shift: sleeping', 'Standard issue night', 'Back to the routine', 'Quiet one'],
  late: ['Late one', 'Owl mode', 'One more episode…'],
  long: ['Hibernation', 'Full recharge', 'Long haul'],
  short: ['Running on fumes', 'Short and not sweet', 'Power night'],
};

export const COMMENTS = [
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
