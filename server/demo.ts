import { and, eq, gte, inArray } from 'drizzle-orm';
import { buildSession, gauss, rng } from '../src/data/generate.js';
import { asleepMinutes, bedtimeMinutes } from '../src/data/score.js';
import { COMMENTS, PERSONAS, titleFor, type Persona } from '../src/data/seed.js';
import type { ProviderName } from '../src/data/types.js';
import type { DB } from './db.js';
import { insertNight } from './nights.js';
import { challengeParticipants, challenges, comments, kudos, nights, user } from './schema.js';

// Demo mode: invented people with generated nights, so the social feed has life
// before Open Wearables runs. Every demo person has is_demo = true.

const DAY = 86400000;
export const demoId = (p: Persona) => `demo-${p.id}`;
const DEMO = PERSONAS.filter((p) => p.id !== 'me');

function eveningOf(daysAgo: number) {
  const d = new Date(Date.now() - daysAgo * DAY);
  d.setHours(18, 0, 0, 0);
  return d;
}

export function demoNightFor(r: () => number, p: Pick<Persona, 'bedMean' | 'bedSd' | 'sleepMean' | 'sleepSd' | 'restless'>, provider: ProviderName, daysAgo: number) {
  const evening = eveningOf(daysAgo);
  const weekend = [5, 6].includes(evening.getDay());
  const bedMin = Math.round(gauss(r, p.bedMean + (weekend ? 50 : 0), p.bedSd));
  const asleep = Math.max(240, Math.round(gauss(r, p.sleepMean + (weekend ? 25 : 0), p.sleepSd)));
  const session = buildSession(r, new Date(evening.getTime() + bedMin * 60000), asleep, provider, p.restless);
  session.source.source = 'demo';
  return { session, title: titleFor(bedtimeMinutes(session.start_time), asleepMinutes(session), r) };
}

/** Creates demo people, their last 56 nights, kudos, comments and challenges. Safe to run twice. */
export async function seedDemo(db: DB) {
  const existing = await db.select({ id: user.id }).from(user).where(eq(user.isDemo, true));
  if (existing.length) return { seeded: false };

  const r = rng(20261115);
  await db.insert(user).values(
    DEMO.map((p) => ({
      id: demoId(p),
      name: p.name,
      email: `${p.handle.replace(/[^a-z0-9]/gi, '')}@demo.nightfeed.invalid`,
      handle: p.handle,
      city: p.city,
      color: p.color,
      isDemo: true,
      connectedProviders: [p.provider],
    })),
  );

  for (const p of DEMO) {
    for (let back = 56; back >= 1; back--) {
      if (r() < 0.08) continue;
      const { session, title } = demoNightFor(r, p, p.provider, back);
      await insertNight(db, { userId: demoId(p), title, session });
    }
  }

  // Kudos and a few comments between demo people on recent nights.
  const recent = await db
    .select({ id: nights.id, userId: nights.userId, endTime: nights.endTime })
    .from(nights)
    .where(gte(nights.endTime, new Date(Date.now() - 10 * DAY)));
  const ids = DEMO.map(demoId);
  for (const n of recent) {
    const others = ids.filter((i) => i !== n.userId);
    const givers = others.filter(() => r() < 0.4);
    if (givers.length) await db.insert(kudos).values(givers.map((g) => ({ nightId: n.id, userId: g })));
    if (r() < 0.3) {
      await db.insert(comments).values({
        id: crypto.randomUUID(),
        nightId: n.id,
        userId: others[Math.floor(r() * others.length)],
        text: COMMENTS[Math.floor(r() * COMMENTS.length)],
        createdAt: new Date(n.endTime.getTime() + 3600000),
      });
    }
  }

  await ensureChallenges(db);
  return { seeded: true };
}

const iso = (d: Date) => d.toISOString().slice(0, 10);

/** Rolling challenges: a new round starts when the previous one ended. */
export async function ensureChallenges(db: DB) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const fortnight = Math.floor(today.getTime() / (14 * DAY));
  const sevenStart = new Date(fortnight * 14 * DAY);
  const defs = [
    {
      id: `c-7h-${iso(sevenStart)}`,
      name: 'The 7-Hour Club',
      blurb: 'Sleep 7 hours or more on 12 nights within 21 days.',
      emoji: '🌙',
      kind: { type: 'min_duration' as const, minutes: 420, nights: 12 },
      startDate: iso(sevenStart),
      endDate: iso(new Date(sevenStart.getTime() + 20 * DAY)),
    },
    {
      id: `c-lights-${iso(monthStart)}`,
      name: 'Lights Out by 23:30',
      blurb: 'In bed before 23:30 on 10 nights this month.',
      emoji: '💡',
      kind: { type: 'lights_out' as const, before: '23:30', nights: 10 },
      startDate: iso(monthStart),
      endDate: iso(monthEnd),
    },
    {
      id: `c-streak-${iso(monthStart)}`,
      name: 'Five Solid Nights',
      blurb: 'Score 75 or higher on 5 nights in a row.',
      emoji: '🔥',
      kind: { type: 'streak' as const, minScore: 75, nights: 5 },
      startDate: iso(monthStart),
      endDate: iso(monthEnd),
    },
  ];
  await db.insert(challenges).values(defs).onConflictDoNothing();

  // Demo people join each new round.
  const r = rng(fortnight);
  const demoUsers = DEMO.map(demoId);
  for (const c of defs) {
    const joiners = demoUsers.filter(() => r() < 0.6);
    if (joiners.length)
      await db
        .insert(challengeParticipants)
        .values(joiners.map((u) => ({ challengeId: c.id, userId: u })))
        .onConflictDoNothing();
  }
}

/** Daily cron in demo mode: every demo person gets last night, so the feed keeps moving. */
export async function addDemoLastNights(db: DB) {
  const r = rng(Date.now());
  const since = new Date(Date.now() - 20 * 3600000);
  const done = await db
    .select({ userId: nights.userId })
    .from(nights)
    .where(and(gte(nights.endTime, since), inArray(nights.userId, DEMO.map(demoId))));
  let added = 0;
  for (const p of DEMO) {
    if (done.some((d) => d.userId === demoId(p)) || r() < 0.08) continue;
    const { session, title } = demoNightFor(r, p, p.provider, 1);
    await insertNight(db, { userId: demoId(p), title, session });
    added++;
  }
  return added;
}

/** Demo stand-in for "sync from my device": last night, not yet saved. */
export function demoDraft(provider: ProviderName) {
  const me = PERSONAS.find((p) => p.id === 'me')!;
  return demoNightFor(rng(Date.now()), me, provider, 1);
}

/** Gives a new demo-mode account two weeks of nights so stats and charts are not empty. */
export async function backfillNewUser(db: DB, userId: string, provider: ProviderName) {
  const me = PERSONAS.find((p) => p.id === 'me')!;
  const r = rng(userId.split('').reduce((a, c) => a + c.charCodeAt(0), 0));
  for (let back = 14; back >= 2; back--) {
    const { session, title } = demoNightFor(r, me, provider, back);
    await insertNight(db, { userId, title, session });
  }
}

export const DEMO_USER_IDS = DEMO.map(demoId);
