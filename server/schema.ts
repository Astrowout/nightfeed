import { boolean, date, index, integer, jsonb, pgTable, primaryKey, text, timestamp } from 'drizzle-orm/pg-core';
import type { ScoreBreakdown } from '../src/data/score.js';
import type { ChallengeKind, SleepSession } from '../src/data/types.js';

// ---- Better Auth core tables (names and fields as Better Auth expects) ----

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  // Kudoze profile fields (Better Auth additionalFields)
  handle: text('handle').unique(),
  city: text('city'),
  color: text('color'),
  isDemo: boolean('is_demo').notNull().default(false),
  healthConsentAt: timestamp('health_consent_at', { withTimezone: true }),
  owUserId: text('ow_user_id').unique(),
  connectedProviders: jsonb('connected_providers').$type<string[]>().notNull().default([]),
});

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  idToken: text('id_token'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ---- Kudoze tables ----

export const nights = pgTable(
  'nights',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    caption: text('caption'),
    visibility: text('visibility').$type<'followers' | 'only_me'>().notNull().default('followers'),
    session: jsonb('session').$type<SleepSession>().notNull(),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }).notNull(),
    isNap: boolean('is_nap').notNull().default(false),
    provider: text('provider').notNull(),
    owSessionId: text('ow_session_id').unique(),
    score: integer('score').notNull(),
    scoreBreakdown: jsonb('score_breakdown').$type<ScoreBreakdown>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('nights_user_end_idx').on(t.userId, t.endTime)],
);

export const follows = pgTable(
  'follows',
  {
    followerId: text('follower_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    followeeId: text('followee_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.followerId, t.followeeId] })],
);

export const kudos = pgTable(
  'kudos',
  {
    nightId: text('night_id')
      .notNull()
      .references(() => nights.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.nightId, t.userId] })],
);

export const comments = pgTable(
  'comments',
  {
    id: text('id').primaryKey(),
    nightId: text('night_id')
      .notNull()
      .references(() => nights.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('comments_night_idx').on(t.nightId)],
);

export const challenges = pgTable('challenges', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  blurb: text('blurb').notNull(),
  emoji: text('emoji').notNull(),
  kind: jsonb('kind').$type<ChallengeKind>().notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
});

export const challengeParticipants = pgTable(
  'challenge_participants',
  {
    challengeId: text('challenge_id')
      .notNull()
      .references(() => challenges.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.challengeId, t.userId] })],
);

/** Svix message ids already handled, so retried webhooks are not processed twice. */
export const webhookEvents = pgTable('webhook_events', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
});

/** One optional photo of the day per night, stored as base64 (resized on the phone first, so a few hundred kB at most). */
export const nightPhotos = pgTable('night_photos', {
  id: text('id').primaryKey(), // changes on every upload, so the image URL can be cached for good
  nightId: text('night_id')
    .notNull()
    .unique()
    .references(() => nights.id, { onDelete: 'cascade' }),
  mime: text('mime').notNull(),
  data: text('data').notNull(),
  width: integer('width').notNull(),
  height: integer('height').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** People who left their email on the landing page to hear when Kudoze opens. */
export const waitlist = pgTable('waitlist', {
  email: text('email').primaryKey(), // stored lowercased, so one row per address
  source: text('source').notNull().default('landing'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const schema = {
  user,
  session,
  account,
  verification,
  nights,
  follows,
  kudos,
  comments,
  challenges,
  challengeParticipants,
  webhookEvents,
  waitlist,
  nightPhotos,
};
