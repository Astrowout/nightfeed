// One Vercel Function serves the whole API; vercel.json rewrites /api/* here.
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { createApp } from '../server/app.js';
import type { DB } from '../server/db.js';
import { readEnv } from '../server/env.js';
import { schema } from '../server/schema.js';

const env = readEnv();
if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set. Add Neon from the Vercel Marketplace.');
const db = drizzle(neon(env.DATABASE_URL), { schema }) as unknown as DB;
const app = createApp(db, env);

export default { fetch: app.fetch };
