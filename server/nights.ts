import { and, desc, eq, lt, sql } from 'drizzle-orm';
import { SCORE_VERSION, scoreSession } from '../src/data/score.js';
import type { SleepSession, Visibility } from '../src/data/types.js';
import type { DB } from './db.js';
import { nights } from './schema.js';

export interface NewNight {
  userId: string;
  title: string;
  caption?: string | null;
  visibility?: Visibility;
  session: SleepSession;
  owSessionId?: string | null;
}

/** Scores a night against the same person's 14 main sleeps before it, then stores it. */
export async function insertNight(db: DB, n: NewNight) {
  const start = new Date(n.session.start_time);
  const previous = await db
    .select({ session: nights.session })
    .from(nights)
    .where(and(eq(nights.userId, n.userId), eq(nights.isNap, false), lt(nights.startTime, start)))
    .orderBy(desc(nights.startTime))
    .limit(14);
  const breakdown = scoreSession(
    n.session,
    previous.map((p) => p.session),
  );
  const id = crypto.randomUUID();
  const [row] = await db
    .insert(nights)
    .values({
      id,
      userId: n.userId,
      title: n.title.slice(0, 80),
      caption: n.caption?.slice(0, 500) || null,
      visibility: n.visibility ?? 'followers',
      session: { ...n.session, id },
      startTime: start,
      endTime: new Date(n.session.end_time),
      isNap: n.session.is_nap,
      provider: String(n.session.source.provider),
      owSessionId: n.owSessionId ?? null,
      score: breakdown.total,
      scoreBreakdown: breakdown,
    })
    .onConflictDoNothing()
    .returning();
  return row;
}

/** Recomputes nights stored with an older score formula. Returns how many it updated. */
export async function rescoreStale(db: DB) {
  const stale = await db
    .selectDistinct({ userId: nights.userId })
    .from(nights)
    .where(sql`coalesce((${nights.scoreBreakdown}->>'v')::int, 0) <> ${SCORE_VERSION}`);
  let updated = 0;
  for (const { userId } of stale) {
    const rows = await db
      .select({ id: nights.id, session: nights.session, isNap: nights.isNap, breakdown: nights.scoreBreakdown })
      .from(nights)
      .where(eq(nights.userId, userId))
      .orderBy(nights.startTime);
    const mains: SleepSession[] = [];
    for (const r of rows) {
      if (r.breakdown?.v !== SCORE_VERSION) {
        const breakdown = scoreSession(r.session, mains.slice(-14));
        await db.update(nights).set({ score: breakdown.total, scoreBreakdown: breakdown }).where(eq(nights.id, r.id));
        updated++;
      }
      if (!r.isNap) mains.push(r.session);
    }
  }
  return updated;
}

/** Basic shape check for a session posted by the app. */
export function validSession(s: unknown): s is SleepSession {
  if (!s || typeof s !== 'object') return false;
  const x = s as SleepSession;
  const start = Date.parse(x.start_time);
  const end = Date.parse(x.end_time);
  return (
    Number.isFinite(start) &&
    Number.isFinite(end) &&
    end > start &&
    end - start < 20 * 3600000 &&
    end <= Date.now() + 3600000 &&
    typeof x.duration_seconds === 'number' &&
    !!x.source &&
    typeof x.source.provider === 'string' &&
    (x.sleep_stage_intervals == null || Array.isArray(x.sleep_stage_intervals))
  );
}
