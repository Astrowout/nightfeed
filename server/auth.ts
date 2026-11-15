import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { APIError } from 'better-auth/api';
import type { DB } from './db.js';
import { DEMO_USER_IDS, backfillNewUser } from './demo.js';
import { isDemoMode, type Env } from './env.js';
import { OpenWearables } from './ow.js';
import { follows, schema, user } from './schema.js';
import { eq } from 'drizzle-orm';

const COLORS = ['#9BD8A9', '#FDE99B', '#B8CAF5', '#D4C7FF', '#F8D3C2', '#C9E7EF'];

export function createAuth(db: DB, env: Env) {
  const ow = new OpenWearables(env);
  const origins = [
    'kudoze://',
    ...(env.BETTER_AUTH_URL ? [env.BETTER_AUTH_URL] : []),
    ...(env.TRUSTED_ORIGINS ?? '').split(',').filter(Boolean),
  ];

  return betterAuth({
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    basePath: '/api/auth',
    database: drizzleAdapter(db, { provider: 'pg', schema, transaction: false }),
    // Before launch nobody can create an account; app.ts also blocks sign-in while closed.
    emailAndPassword: { enabled: true, minPasswordLength: 8, autoSignIn: true, disableSignUp: !env.APP_OPEN },
    trustedOrigins: origins,
    plugins: [expo()],
    user: {
      additionalFields: {
        handle: { type: 'string', required: false },
        city: { type: 'string', required: false },
        color: { type: 'string', required: false, input: false },
        healthConsentAt: { type: 'date', required: false, input: false },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (data, ctx) => {
            // Sleep data is health data (GDPR art. 9): no account without explicit consent.
            const body = (ctx?.body ?? {}) as { healthConsent?: unknown };
            if (body.healthConsent !== true) {
              throw new APIError('BAD_REQUEST', { message: 'Please agree to how Kudoze uses your sleep data.' });
            }
            const base = (data.name || data.email.split('@')[0]).toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 16) || 'sleeper';
            return {
              data: {
                ...data,
                handle: `${base}${Math.floor(Math.random() * 900 + 100)}`,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                healthConsentAt: new Date(),
              },
            };
          },
          after: async (created) => {
            // Follow the demo people so the feed is not empty on day one.
            await db
              .insert(follows)
              .values(DEMO_USER_IDS.slice(0, 5).map((id) => ({ followerId: created.id, followeeId: id })))
              .onConflictDoNothing();
            if (ow.configured) {
              try {
                const owUserId = await ow.createUser(created.email, created.name);
                await db.update(user).set({ owUserId }).where(eq(user.id, created.id));
              } catch (e) {
                console.error('[kudoze] could not create Open Wearables user', e);
              }
            } else if (isDemoMode(env)) {
              await db.update(user).set({ connectedProviders: ['garmin'] }).where(eq(user.id, created.id));
              await backfillNewUser(db, created.id, 'garmin');
            }
          },
        },
      },
    },
  });
}

export type Auth = ReturnType<typeof createAuth>;
