import { and, desc, eq, gte, inArray } from 'drizzle-orm';
import { Hono } from 'hono';
import { Webhook } from 'svix';
import { z } from 'zod';
import type { ProviderName, SleepSession } from '../src/data/types.js';
import { createAuth } from './auth.js';
import type { DB } from './db.js';
import { addDemoLastNights, demoDraft, ensureChallenges } from './demo.js';
import { isDemoMode, type Env } from './env.js';
import { insertNight, validSession } from './nights.js';
import { OpenWearables } from './ow.js';
import { challengeParticipants, comments, follows, kudos, nightPhotos, nights, user, waitlist, webhookEvents } from './schema.js';
import { attachSocial, buildState, canSee, followingOf } from './state.js';

type Vars = { userId: string };

const PROVIDERS = ['apple', 'samsung', 'garmin', 'health_connect', 'google_health', 'polar', 'suunto', 'whoop', 'oura', 'ultrahuman', 'withings'] as const;

export function createApp(db: DB, env: Env) {
  process.env.TZ = env.APP_TIMEZONE;
  const auth = createAuth(db, env);
  const ow = new OpenWearables(env);
  const mode = isDemoMode(env) ? ('demo' as const) : ('open_wearables' as const);
  const app = new Hono<{ Variables: Vars }>().basePath('/api');

  app.onError((err, c) => {
    console.error('[kudoze]', err);
    return c.json({ error: 'Something went wrong on our side. Try again in a moment.' }, 500);
  });

  app.get('/health', (c) => c.json({ ok: true, mode, appOpen: env.APP_OPEN }));

  // Before launch the app is closed: only checking a session and signing out pass through.
  const CLOSED_MESSAGE = 'Kudoze isn’t open yet. Leave your email on the home page to hear when it opens.';
  const OPEN_WHILE_CLOSED = ['/api/auth/get-session', '/api/auth/sign-out'];

  // Better Auth handles sign-up, sign-in, sessions and sign-out.
  app.on(['GET', 'POST'], '/auth/*', (c) => {
    if (!env.APP_OPEN && !OPEN_WHILE_CLOSED.includes(c.req.path)) return c.json({ error: CLOSED_MESSAGE, message: CLOSED_MESSAGE }, 403);
    return auth.handler(c.req.raw);
  });

  // ---- Open Wearables webhook (signed by Svix) ----
  app.post('/webhooks/open-wearables', async (c) => {
    if (!env.OW_WEBHOOK_SECRET) return c.json({ error: 'Webhooks are not configured.' }, 404);
    const payload = await c.req.text();
    let event: { type: string; data: Record<string, unknown> };
    try {
      event = new Webhook(env.OW_WEBHOOK_SECRET).verify(payload, {
        'svix-id': c.req.header('svix-id') ?? '',
        'svix-timestamp': c.req.header('svix-timestamp') ?? '',
        'svix-signature': c.req.header('svix-signature') ?? '',
      }) as unknown as typeof event;
    } catch {
      return c.json({ error: 'Invalid signature' }, 401);
    }
    const msgId = c.req.header('svix-id')!;
    const fresh = await db.insert(webhookEvents).values({ id: msgId, type: event.type }).onConflictDoNothing().returning();
    if (!fresh.length) return c.json({ ok: true, duplicate: true });

    const owUserId = String(event.data.user_id ?? '');
    const [owner] = owUserId ? await db.select().from(user).where(eq(user.owUserId, owUserId)) : [];
    if (!owner) return c.json({ ok: true, ignored: 'unknown user' });

    if (event.type === 'connection.created' || event.type === 'connection.revoked') {
      const provider = String(event.data.provider ?? '');
      const set = new Set(owner.connectedProviders);
      if (event.type === 'connection.created') set.add(provider);
      else set.delete(provider);
      await db.update(user).set({ connectedProviders: [...set].filter(Boolean) }).where(eq(user.id, owner.id));
    }
    if (event.type === 'sleep.created') await importSleep(owner.id, owUserId, event.data);
    return c.json({ ok: true });
  });

  async function importSleep(userId: string, owUserId: string, data: Record<string, unknown>) {
    const start = String(data.start_time);
    const end = String(data.end_time);
    // The webhook has no hypnogram, so fetch the full session with stages.
    let session: SleepSession | undefined;
    try {
      const day = (iso: string, plus: number) => new Date(Date.parse(iso) + plus * 86400000).toISOString().slice(0, 10);
      const list = await ow.sleepSessions(owUserId, day(start, -1), day(end, 1));
      session = list.find((s) => s.start_time === start) ?? list.find((s) => Math.abs(Date.parse(s.start_time) - Date.parse(start)) < 60000);
    } catch (e) {
      console.error('[kudoze] could not fetch sleep session', e);
    }
    if (!session) {
      session = {
        id: String(data.id ?? crypto.randomUUID()),
        start_time: start,
        end_time: end,
        source: { provider: String(data.provider ?? 'unknown') },
        duration_seconds: Number(data.duration_seconds ?? (Date.parse(end) - Date.parse(start)) / 1000),
        sleep_duration_seconds: null,
        time_in_bed_seconds: null,
        efficiency_percent: (data.efficiency_percent as number) ?? null,
        stages: (data.stages as SleepSession['stages']) ?? null,
        sleep_stage_intervals: null,
        is_nap: Boolean(data.is_nap),
        is_final: true,
      };
    }
    const hour = new Date(session.start_time).getHours();
    await insertNight(db, {
      userId,
      title: session.is_nap ? 'Afternoon nap' : hour >= 0 && hour < 4 ? 'Late one' : 'Night',
      session,
      owSessionId: session.id,
    });
  }

  // ---- Waitlist (public): emails from the landing page while Kudoze is not open yet ----
  const WaitlistBody = z.object({
    email: z.string().trim().toLowerCase().max(254).email(),
    source: z.string().max(40).optional(),
  });
  app.post('/waitlist', async (c) => {
    const parsed = WaitlistBody.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success) return c.json({ error: 'Enter a valid email address, like name@example.com.' }, 400);
    const { email, source } = parsed.data;
    // Same answer for new and repeated emails, so the form never reveals who is on the list.
    await db.insert(waitlist).values({ email, source: source ?? 'landing' }).onConflictDoNothing();
    return c.json({ ok: true });
  });

  /** The list itself, for the team only (Bearer CRON_SECRET). */
  app.get('/waitlist', async (c) => {
    if (!env.CRON_SECRET || c.req.header('authorization') !== `Bearer ${env.CRON_SECRET}`) return c.json({ error: 'Unauthorized' }, 401);
    const rows = await db.select().from(waitlist).orderBy(desc(waitlist.createdAt));
    return c.json({ count: rows.length, entries: rows });
  });

  // ---- Daily cron (Vercel Cron, Bearer CRON_SECRET) ----
  app.get('/cron/daily', async (c) => {
    if (!env.CRON_SECRET || c.req.header('authorization') !== `Bearer ${env.CRON_SECRET}`) return c.json({ error: 'Unauthorized' }, 401);
    await ensureChallenges(db);
    let demoAdded = 0;
    let reconciled = 0;
    if (mode === 'demo') demoAdded = await addDemoLastNights(db);
    else {
      // Safety net for missed webhooks: re-check the last two days for linked users.
      const linked = await db.select({ id: user.id, ow: user.owUserId }).from(user).where(eq(user.isDemo, false));
      const from = new Date(Date.now() - 2 * 86400000).toISOString().slice(0, 10);
      const to = new Date().toISOString().slice(0, 10);
      for (const u of linked) {
        if (!u.ow) continue;
        try {
          for (const s of await ow.sleepSessions(u.ow, from, to)) {
            const [exists] = await db.select({ id: nights.id }).from(nights).where(eq(nights.owSessionId, s.id));
            if (!exists) {
              await insertNight(db, { userId: u.id, title: s.is_nap ? 'Afternoon nap' : 'Night', session: s, owSessionId: s.id });
              reconciled++;
            }
          }
        } catch (e) {
          console.error('[kudoze] reconcile failed for', u.id, e);
        }
      }
    }
    return c.json({ ok: true, demoAdded, reconciled });
  });

  // ---- Everything below needs a signed-in person ----
  app.use('*', async (c, next) => {
    if (!env.APP_OPEN) return c.json({ error: CLOSED_MESSAGE }, 403);
    const s = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!s) return c.json({ error: 'Please sign in.' }, 401);
    c.set('userId', s.user.id);
    await next();
  });

  app.get('/state', async (c) => c.json(await buildState(db, c.get('userId'), mode)));

  app.patch('/me', async (c) => {
    const body = z
      .object({ name: z.string().trim().min(1).max(60).optional(), city: z.string().trim().max(60).optional() })
      .safeParse(await c.req.json().catch(() => null));
    if (!body.success) return c.json({ error: 'Check your name and city.' }, 400);
    await db.update(user).set({ ...body.data, updatedAt: new Date() }).where(eq(user.id, c.get('userId')));
    return c.json({ ok: true });
  });

  /** GDPR: download everything we hold about you. */
  app.get('/me/export', async (c) => {
    const me = c.get('userId');
    const [profile] = await db.select().from(user).where(eq(user.id, me));
    const mine = await db.select().from(nights).where(eq(nights.userId, me));
    const myComments = await db.select().from(comments).where(eq(comments.userId, me));
    const myKudos = await db.select().from(kudos).where(eq(kudos.userId, me));
    const myFollows = await db.select().from(follows).where(eq(follows.followerId, me));
    const myPhotos = mine.length ? await db.select().from(nightPhotos).where(inArray(nightPhotos.nightId, mine.map((n) => n.id))) : [];
    const { owUserId: _ow, ...safeProfile } = profile;
    c.header('Content-Disposition', 'attachment; filename="kudoze-export.json"');
    return c.json({ exportedAt: new Date().toISOString(), profile: safeProfile, nights: mine, photos: myPhotos, comments: myComments, kudos: myKudos, follows: myFollows });
  });

  /** GDPR: delete the account and everything linked to it. */
  app.delete('/me', async (c) => {
    const me = c.get('userId');
    const [profile] = await db.select().from(user).where(eq(user.id, me));
    if (profile?.owUserId && ow.configured) {
      await ow.deleteUser(profile.owUserId).catch((e) => console.error('[kudoze] Open Wearables delete failed', e));
    }
    await db.delete(user).where(eq(user.id, me));
    return c.json({ ok: true });
  });

  // ---- Nights ----
  const nightBody = z.object({
    title: z.string().trim().min(1).max(80),
    caption: z.string().trim().max(500).optional(),
    visibility: z.enum(['followers', 'only_me']).default('followers'),
    session: z.unknown(),
  });

  app.post('/nights', async (c) => {
    const parsed = nightBody.safeParse(await c.req.json().catch(() => null));
    if (!parsed.success || !validSession(parsed.data.session)) return c.json({ error: 'This night is missing times or looks wrong.' }, 400);
    const row = await insertNight(db, { userId: c.get('userId'), ...parsed.data, session: parsed.data.session as SleepSession });
    const [night] = await attachSocial(db, [row]);
    return c.json(night, 201);
  });

  async function loadVisible(id: string, viewer: string) {
    const [row] = await db.select().from(nights).where(eq(nights.id, id));
    if (!row) return null;
    return canSee(row, viewer, await followingOf(db, viewer)) ? row : null;
  }

  app.get('/nights/:id', async (c) => {
    const row = await loadVisible(c.req.param('id'), c.get('userId'));
    if (!row) return c.json({ error: 'Night not found.' }, 404);
    const [night] = await attachSocial(db, [row]);
    return c.json(night);
  });

  app.patch('/nights/:id', async (c) => {
    const body = z
      .object({ visibility: z.enum(['followers', 'only_me']).optional(), title: z.string().trim().min(1).max(80).optional(), caption: z.string().trim().max(500).optional() })
      .safeParse(await c.req.json().catch(() => null));
    if (!body.success) return c.json({ error: 'Nothing to change.' }, 400);
    const res = await db.update(nights).set(body.data).where(and(eq(nights.id, c.req.param('id')), eq(nights.userId, c.get('userId')))).returning({ id: nights.id });
    return res.length ? c.json({ ok: true }) : c.json({ error: 'Night not found.' }, 404);
  });

  app.delete('/nights/:id', async (c) => {
    const res = await db.delete(nights).where(and(eq(nights.id, c.req.param('id')), eq(nights.userId, c.get('userId')))).returning({ id: nights.id });
    return res.length ? c.json({ ok: true }) : c.json({ error: 'Night not found.' }, 404);
  });

  // ---- Photo of the day: one per night, owner only; resized on the phone before upload ----
  const MAX_PHOTO_BYTES = 2_000_000;
  const photoBody = z.object({
    data: z.string().min(100).max(Math.ceil((MAX_PHOTO_BYTES * 4) / 3) + 4),
    mime: z.enum(['image/jpeg', 'image/png', 'image/webp']),
    width: z.number().int().min(1).max(8000),
    height: z.number().int().min(1).max(8000),
  });
  /** Checks the first bytes, so the stored file really is the image type it claims to be. */
  function looksLike(mime: string, bytes: Uint8Array) {
    const b = Array.from(bytes.slice(0, 12));
    if (mime === 'image/jpeg') return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    if (mime === 'image/png') return b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
    return String.fromCharCode(...b.slice(0, 4)) === 'RIFF' && String.fromCharCode(...b.slice(8, 12)) === 'WEBP';
  }

  app.put('/nights/:id/photo', async (c) => {
    const body = photoBody.safeParse(await c.req.json().catch(() => null));
    if (!body.success) return c.json({ error: 'Choose a JPEG, PNG or WebP photo under 2 MB.' }, 400);
    const [own] = await db.select({ id: nights.id }).from(nights).where(and(eq(nights.id, c.req.param('id')), eq(nights.userId, c.get('userId'))));
    if (!own) return c.json({ error: 'Night not found.' }, 404);
    const bytes = Uint8Array.from(atob(body.data.data), (ch) => ch.charCodeAt(0));
    if (bytes.length > MAX_PHOTO_BYTES || !looksLike(body.data.mime, bytes)) return c.json({ error: 'Choose a JPEG, PNG or WebP photo under 2 MB.' }, 400);
    const photo = { id: crypto.randomUUID(), nightId: own.id, ...body.data, createdAt: new Date() };
    await db
      .insert(nightPhotos)
      .values(photo)
      .onConflictDoUpdate({ target: nightPhotos.nightId, set: { id: photo.id, mime: photo.mime, data: photo.data, width: photo.width, height: photo.height, createdAt: photo.createdAt } });
    return c.json({ id: photo.id, width: photo.width, height: photo.height });
  });

  app.delete('/nights/:id/photo', async (c) => {
    const [own] = await db.select({ id: nights.id }).from(nights).where(and(eq(nights.id, c.req.param('id')), eq(nights.userId, c.get('userId'))));
    if (!own) return c.json({ error: 'Night not found.' }, 404);
    await db.delete(nightPhotos).where(eq(nightPhotos.nightId, own.id));
    return c.json({ ok: true });
  });

  // Same rule as the night itself: only people who can see the night can see its photo.
  app.get('/photos/:id', async (c) => {
    const [photo] = await db.select().from(nightPhotos).where(eq(nightPhotos.id, c.req.param('id')));
    if (!photo || !(await loadVisible(photo.nightId, c.get('userId')))) return c.json({ error: 'Photo not found.' }, 404);
    const bytes = Uint8Array.from(atob(photo.data), (ch) => ch.charCodeAt(0));
    return new Response(bytes, {
      headers: { 'Content-Type': photo.mime, 'Cache-Control': 'private, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
    });
  });

  app.post('/nights/:id/kudos', async (c) => {
    const row = await loadVisible(c.req.param('id'), c.get('userId'));
    if (!row || row.userId === c.get('userId')) return c.json({ error: 'Night not found.' }, 404);
    await db.insert(kudos).values({ nightId: row.id, userId: c.get('userId') }).onConflictDoNothing();
    return c.json({ ok: true });
  });

  app.delete('/nights/:id/kudos', async (c) => {
    await db.delete(kudos).where(and(eq(kudos.nightId, c.req.param('id')), eq(kudos.userId, c.get('userId'))));
    return c.json({ ok: true });
  });

  app.post('/nights/:id/comments', async (c) => {
    const body = z.object({ text: z.string().trim().min(1).max(500) }).safeParse(await c.req.json().catch(() => null));
    if (!body.success) return c.json({ error: 'Write a comment of up to 500 characters.' }, 400);
    const row = await loadVisible(c.req.param('id'), c.get('userId'));
    if (!row) return c.json({ error: 'Night not found.' }, 404);
    const comment = { id: crypto.randomUUID(), nightId: row.id, userId: c.get('userId'), text: body.data.text, createdAt: new Date() };
    await db.insert(comments).values(comment);
    return c.json({ id: comment.id, authorId: comment.userId, text: comment.text, createdAt: comment.createdAt.toISOString() }, 201);
  });

  app.delete('/comments/:id', async (c) => {
    await db.delete(comments).where(and(eq(comments.id, c.req.param('id')), eq(comments.userId, c.get('userId'))));
    return c.json({ ok: true });
  });

  // ---- Follows ----
  app.post('/follows/:id', async (c) => {
    const target = c.req.param('id');
    if (target === c.get('userId')) return c.json({ error: 'You cannot follow yourself.' }, 400);
    const [exists] = await db.select({ id: user.id }).from(user).where(eq(user.id, target));
    if (!exists) return c.json({ error: 'Sleeper not found.' }, 404);
    await db.insert(follows).values({ followerId: c.get('userId'), followeeId: target }).onConflictDoNothing();
    return c.json({ ok: true });
  });

  app.delete('/follows/:id', async (c) => {
    await db.delete(follows).where(and(eq(follows.followerId, c.get('userId')), eq(follows.followeeId, c.req.param('id'))));
    return c.json({ ok: true });
  });

  // ---- Challenges ----
  app.post('/challenges/:id/join', async (c) => {
    await db.insert(challengeParticipants).values({ challengeId: c.req.param('id'), userId: c.get('userId') }).onConflictDoNothing();
    return c.json({ ok: true });
  });

  app.delete('/challenges/:id/join', async (c) => {
    await db.delete(challengeParticipants).where(and(eq(challengeParticipants.challengeId, c.req.param('id')), eq(challengeParticipants.userId, c.get('userId'))));
    return c.json({ ok: true });
  });

  // ---- Devices and sync ----
  app.post('/sync', async (c) => {
    const [me] = await db.select().from(user).where(eq(user.id, c.get('userId')));
    if (mode === 'demo') {
      const provider = (me.connectedProviders[0] ?? 'garmin') as ProviderName;
      return c.json(demoDraft(provider));
    }
    if (!me.owUserId) return c.json({ error: 'Connect a device first.' }, 400);
    const to = new Date();
    const from = new Date(to.getTime() - 2 * 86400000);
    const list = await ow.sleepSessions(me.owUserId, from.toISOString().slice(0, 10), to.toISOString().slice(0, 10));
    const latest = list.filter((s) => !s.is_nap).sort((a, b) => (a.end_time < b.end_time ? 1 : -1))[0];
    if (!latest) return c.json({ error: 'No finished night in the last two days yet.' }, 404);
    const [already] = await db.select({ id: nights.id }).from(nights).where(eq(nights.owSessionId, latest.id));
    if (already) return c.json({ error: 'Last night is already on your feed.', nightId: already.id }, 409);
    return c.json({ session: latest, title: 'Night' });
  });

  /** Tokens for the Open Wearables mobile SDK (Apple Health, Health Connect, Samsung Health). */
  app.post('/connect/sdk-token', async (c) => {
    if (mode === 'demo') return c.json({ error: 'Phone health sync needs Open Wearables.' }, 409);
    const [me] = await db.select().from(user).where(eq(user.id, c.get('userId')));
    if (!me.owUserId) return c.json({ error: 'Your account is not linked to Open Wearables yet.' }, 409);
    return c.json({ owUserId: me.owUserId, ...(await ow.sdkToken(me.owUserId)) });
  });

  app.post('/connect/:provider', async (c) => {
    const provider = c.req.param('provider');
    if (!(PROVIDERS as readonly string[]).includes(provider)) return c.json({ error: 'Unknown device.' }, 400);
    const [me] = await db.select().from(user).where(eq(user.id, c.get('userId')));
    if (mode === 'demo') {
      const set = new Set(me.connectedProviders);
      set.has(provider) ? set.delete(provider) : set.add(provider);
      await db.update(user).set({ connectedProviders: [...set] }).where(eq(user.id, me.id));
      return c.json({ demo: true, connectedProviders: [...set] });
    }
    if (['apple', 'health_connect', 'samsung'].includes(provider)) {
      return c.json({ error: 'This device syncs from the phone app.', sdk: true }, 400);
    }
    if (!me.owUserId) return c.json({ error: 'Your account is not linked to Open Wearables yet.' }, 409);
    const body = await c.req.json().catch(() => ({}));
    const redirect = typeof body.redirectUri === 'string' && /^(https:\/\/|kudoze:\/\/)/.test(body.redirectUri) ? body.redirectUri : `${env.BETTER_AUTH_URL}/you`;
    return c.json({ url: await ow.authorizeUrl(me.owUserId, provider, redirect) });
  });

  app.get('/feed/older', async (c) => {
    // Older nights beyond the state window, newest first.
    const before = new Date(c.req.query('before') ?? Date.now());
    const me = c.get('userId');
    const following = await followingOf(db, me);
    const rows = await db
      .select()
      .from(nights)
      .where(and(inArray(nights.userId, [me, ...following]), gte(nights.endTime, new Date(before.getTime() - 14 * 86400000))))
      .orderBy(desc(nights.endTime))
      .limit(60);
    const visible = rows.filter((r) => r.endTime < before && canSee(r, me, following));
    return c.json(await attachSocial(db, visible));
  });

  return app;
}
