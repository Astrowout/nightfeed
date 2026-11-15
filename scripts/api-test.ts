/// <reference types="node" />
// End-to-end API check against an in-memory Postgres (PGlite). Run: npm run test:api
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';
import type { DB } from '../server/db.js';
import { seedDemo } from '../server/demo.js';
import { readEnv } from '../server/env.js';
import { schema } from '../server/schema.js';

const BASE = 'http://localhost:3000';
process.env.TZ = 'Europe/Brussels';
const db = drizzle(new PGlite(), { schema });
await migrate(db, { migrationsFolder: './drizzle' });
await seedDemo(db as unknown as DB);
const app = createApp(db as unknown as DB, readEnv({ BETTER_AUTH_SECRET: 'test-secret-test-secret-test-secret', BETTER_AUTH_URL: BASE, CRON_SECRET: 'cron' }));

let cookie = '';
async function call(method: string, path: string, body?: unknown, extra: Record<string, string> = {}) {
  const res = await app.fetch(
    new Request(BASE + path, {
      method,
      headers: { 'Content-Type': 'application/json', Origin: BASE, ...(cookie ? { Cookie: cookie } : {}), ...extra },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
  const set = res.headers.getSetCookie?.() ?? [];
  if (set.length) cookie = set.map((c) => c.split(';')[0]).join('; ');
  const text = await res.text();
  let json: any = text;
  try {
    json = JSON.parse(text);
  } catch {}
  return { status: res.status, json };
}

const ok = (label: string) => console.log('✓', label);

assert.equal((await call('GET', '/api/health')).json.mode, 'demo');
ok('health reports demo mode');

assert.equal((await call('GET', '/api/state')).status, 401);
ok('state needs sign-in');

const noConsent = await call('POST', '/api/auth/sign-up/email', { email: 'a@example.com', password: 'password123', name: 'Ann' });
assert.equal(noConsent.status, 400, JSON.stringify(noConsent.json));
ok('sign-up without health consent is refused');

const signUp = await call('POST', '/api/auth/sign-up/email', { email: 'a@example.com', password: 'password123', name: 'Ann', healthConsent: true });
assert.equal(signUp.status, 200, JSON.stringify(signUp.json));
assert.ok(cookie.includes('session_token'), 'session cookie set');
ok('sign-up with consent creates a session');

const state = (await call('GET', '/api/state')).json;
assert.equal(state.following.length, 5);
assert.ok(state.nights.length > 50, `nights: ${state.nights.length}`);
assert.ok(state.nights.some((n: any) => n.sleeperId === state.meId), 'own backfilled nights');
assert.ok(state.challenges.length >= 3);
assert.ok(state.nights.every((n: any) => typeof n.score.total === 'number'));
ok(`state has ${state.nights.length} nights, ${state.challenges.length} challenges, scores stored`);

const draft = (await call('POST', '/api/sync')).json;
assert.ok(draft.session.start_time && draft.title);
const posted = await call('POST', '/api/nights', { title: draft.title, caption: 'Test', visibility: 'followers', session: draft.session });
assert.equal(posted.status, 201, JSON.stringify(posted.json));
ok('demo sync draft posts as a night');

const bad = await call('POST', '/api/nights', { title: 'x', session: { start_time: 'nope' } });
assert.equal(bad.status, 400);
ok('invalid night is refused');

const other = state.nights.find((n: any) => n.sleeperId !== state.meId);
assert.equal((await call('POST', `/api/nights/${other.id}/kudos`)).status, 200);
assert.equal((await call('POST', `/api/nights/${posted.json.id}/kudos`)).status, 404);
const comment = await call('POST', `/api/nights/${other.id}/comments`, { text: 'Nice one' });
assert.equal(comment.status, 201);
const reread = (await call('GET', `/api/nights/${other.id}`)).json;
assert.ok(reread.kudos.includes(state.meId) && reread.comments.some((c: any) => c.text === 'Nice one'));
ok('kudos and comments work; no kudos on your own night');

const notFollowed = state.sleepers.find((s: any) => s.id !== state.meId && !state.following.includes(s.id));
const hidden = (await db.select().from(schema.nights)).find((n) => n.userId === notFollowed.id);
assert.equal((await call('GET', `/api/nights/${hidden!.id}`)).status, 404);
ok('nights of people you do not follow stay hidden');
assert.equal((await call('POST', `/api/follows/${notFollowed.id}`)).status, 200);
assert.equal((await call('GET', `/api/nights/${hidden!.id}`)).status, 200);
ok('following makes them visible');

await call('PATCH', `/api/nights/${posted.json.id}`, { visibility: 'only_me' });
const ch = state.challenges[0];
assert.equal((await call('POST', `/api/challenges/${ch.id}/join`)).status, 200);
const state2 = (await call('GET', '/api/state')).json;
assert.ok(state2.challenges.find((c: any) => c.id === ch.id).participants.includes(state.meId));
ok('joining a challenge shows on the board');

assert.equal((await call('GET', '/api/cron/daily')).status, 401);
const cron = await call('GET', '/api/cron/daily', undefined, { Authorization: 'Bearer cron' });
assert.equal(cron.status, 200);
ok(`cron runs (demo nights added: ${cron.json.demoAdded})`);

const exp = await call('GET', '/api/me/export');
assert.ok(exp.json.nights.length > 0 && !('owUserId' in exp.json.profile));
ok('export returns your data');

assert.equal((await call('DELETE', '/api/me')).status, 200);
const left = (await db.select().from(schema.nights)).filter((n) => n.userId === state.meId);
assert.equal(left.length, 0);
ok('deleting the account removes its nights');

console.log('\nAll API checks passed.');
process.exit(0);
