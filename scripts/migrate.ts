// Runs during the Vercel build: applies migrations, then seeds demo people once.
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import type { DB } from '../server/db.js';
import { ensureChallenges, seedDemo } from '../server/demo.js';
import { schema } from '../server/schema.js';

const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!url) {
  console.log('[migrate] No DATABASE_URL, skipping database setup.');
  process.exit(0);
}
process.env.TZ = process.env.APP_TIMEZONE || 'Europe/Brussels';

const db = drizzle(neon(url), { schema });
await migrate(db, { migrationsFolder: './drizzle' });
console.log('[migrate] migrations applied');

if (!process.env.OW_BASE_URL) {
  const res = await seedDemo(db as unknown as DB);
  console.log(res.seeded ? '[migrate] demo data seeded' : '[migrate] demo data already present');
}
await ensureChallenges(db as unknown as DB);
