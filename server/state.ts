import { and, desc, eq, gte, inArray, lte, ne, notInArray, or } from 'drizzle-orm';
import { challengeNights, isKnownKind } from '../src/data/challenges.js';
import type { Challenge, ChallengeKind, Night, Sleeper } from '../src/data/types.js';
import type { DB } from './db.js';
import { challengeParticipants, challenges, comments, follows, kudos, nightPhotos, nights, user } from './schema.js';

const DAY = 86400000;
export const FEED_DAYS = 35;

type UserRow = typeof user.$inferSelect;
type NightRow = typeof nights.$inferSelect;

export function toSleeper(u: Pick<UserRow, 'id' | 'name' | 'handle' | 'city' | 'color' | 'connectedProviders'>): Sleeper {
  return {
    id: u.id,
    name: u.name,
    handle: u.handle ?? u.id.slice(0, 8),
    city: u.city ?? '',
    color: u.color ?? '#714CB6',
    provider: (u.connectedProviders?.[0] ?? 'internal') as Sleeper['provider'],
  };
}

export async function followingOf(db: DB, meId: string) {
  const rows = await db.select({ id: follows.followeeId }).from(follows).where(eq(follows.followerId, meId));
  return rows.map((r) => r.id);
}

/** Whether `viewerId` may see this night. */
export function canSee(n: Pick<NightRow, 'userId' | 'visibility'>, viewerId: string, following: string[]) {
  return n.userId === viewerId || (n.visibility === 'followers' && following.includes(n.userId));
}

function photoOf(list: { id: string; nightId: string; width: number; height: number }[], nightId: string) {
  const p = list.find((x) => x.nightId === nightId);
  return p ? { id: p.id, width: p.width, height: p.height } : undefined;
}

export async function attachSocial(db: DB, rows: NightRow[]): Promise<Night[]> {
  if (!rows.length) return [];
  const ids = rows.map((r) => r.id);
  const [k, c, p] = await Promise.all([
    db.select().from(kudos).where(inArray(kudos.nightId, ids)),
    db.select().from(comments).where(inArray(comments.nightId, ids)).orderBy(comments.createdAt),
    db
      .select({ id: nightPhotos.id, nightId: nightPhotos.nightId, width: nightPhotos.width, height: nightPhotos.height })
      .from(nightPhotos)
      .where(inArray(nightPhotos.nightId, ids)),
  ]);
  return rows.map((r) => ({
    id: r.id,
    sleeperId: r.userId,
    title: r.title,
    caption: r.caption ?? undefined,
    visibility: r.visibility,
    session: r.session,
    score: r.scoreBreakdown,
    kudos: k.filter((x) => x.nightId === r.id).map((x) => x.userId),
    comments: c
      .filter((x) => x.nightId === r.id)
      .map((x) => ({ id: x.id, authorId: x.userId, text: x.text, createdAt: x.createdAt.toISOString() })),
    photo: photoOf(p, r.id),
  }));
}

export function progressFor(kind: ChallengeKind, list: Pick<NightRow, 'session'>[]): number {
  return challengeNights(kind, list.map((n) => n.session));
}

export async function challengesWithBoards(db: DB): Promise<(Challenge & { board: { userId: string; value: number }[] })[]> {
  const today = new Date();
  const recent = await db
    .select()
    .from(challenges)
    .where(gte(challenges.endDate, new Date(today.getTime() - 3 * DAY).toISOString().slice(0, 10)))
    .orderBy(challenges.endDate);
  const live = recent.filter((c) => isKnownKind(c.kind));
  if (!live.length) return [];
  const parts = await db.select().from(challengeParticipants).where(inArray(challengeParticipants.challengeId, live.map((c) => c.id)));
  const out = [];
  for (const c of live) {
    const participants = parts.filter((p) => p.challengeId === c.id).map((p) => p.userId);
    const start = new Date(`${c.startDate}T00:00:00`);
    const end = new Date(new Date(`${c.endDate}T00:00:00`).getTime() + DAY);
    const rows = participants.length
      ? await db
          .select({ userId: nights.userId, session: nights.session })
          .from(nights)
          .where(and(inArray(nights.userId, participants), gte(nights.endTime, start), lte(nights.endTime, end), eq(nights.isNap, false)))
      : [];
    const board = participants
      .map((u) => ({ userId: u, value: progressFor(c.kind, rows.filter((r) => r.userId === u)) }))
      .sort((a, b) => b.value - a.value);
    out.push({ id: c.id, name: c.name, blurb: c.blurb, emoji: c.emoji, kind: c.kind, startDate: c.startDate, endDate: c.endDate, participants, board });
  }
  return out;
}

/** Everything the app needs for one signed-in person, in the shape of the app's AppState. */
export async function buildState(db: DB, meId: string, mode: 'demo' | 'open_wearables') {
  const [me] = await db.select().from(user).where(eq(user.id, meId));
  if (!me) throw new Error('User not found');
  const following = await followingOf(db, meId);
  const since = new Date(Date.now() - FEED_DAYS * DAY);

  const rows = await db
    .select()
    .from(nights)
    .where(
      and(
        gte(nights.endTime, since),
        or(
          eq(nights.userId, meId),
          following.length ? and(inArray(nights.userId, following), eq(nights.visibility, 'followers')) : undefined,
        ),
      ),
    )
    .orderBy(desc(nights.endTime));
  const list = await attachSocial(db, rows);
  const board = await challengesWithBoards(db);

  // Everyone the app needs a name and avatar for, plus a few people to discover.
  const needed = new Set<string>([meId, ...following]);
  list.forEach((n) => {
    n.kudos.forEach((k) => needed.add(k));
    n.comments.forEach((c) => needed.add(c.authorId));
  });
  board.forEach((c) => c.participants.forEach((p) => needed.add(p)));
  const known = await db.select().from(user).where(inArray(user.id, [...needed]));
  const suggestions = await db
    .select()
    .from(user)
    .where(and(ne(user.id, meId), notInArray(user.id, [...needed])))
    .orderBy(desc(user.isDemo), desc(user.createdAt))
    .limit(12);

  return {
    version: 2,
    meId,
    me: { email: me.email, healthConsentAt: me.healthConsentAt?.toISOString() ?? null, owLinked: Boolean(me.owUserId) },
    sleepers: [...known, ...suggestions].map(toSleeper),
    following,
    nights: list,
    challenges: board,
    connectedProviders: me.connectedProviders,
    mode,
  };
}
