/// <reference types="node" />
// Runs the whole app locally without Neon or Vercel: in-memory Postgres (PGlite),
// the API, and the exported web build. Run: npm run build:web && npm run local
import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import { Hono } from 'hono';
import { createApp } from '../server/app.js';
import type { DB } from '../server/db.js';
import { seedDemo } from '../server/demo.js';
import { readEnv } from '../server/env.js';
import { schema } from '../server/schema.js';

const port = Number(process.env.PORT ?? 8787);
process.env.TZ = 'Europe/Brussels';
const db = drizzle(new PGlite(), { schema });
await migrate(db, { migrationsFolder: './drizzle' });
await seedDemo(db as unknown as DB);

const api = createApp(
  db as unknown as DB,
  readEnv({ BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? 'local-dev-secret-change-me-local-dev-secret', BETTER_AUTH_URL: `http://localhost:${port}` }),
);
const site = new Hono();
site.route('/', api);
site.use('/*', serveStatic({ root: './dist' }));
site.get('*', serveStatic({ path: './dist/index.html' }));

serve({ fetch: site.fetch, port }, () => console.log(`Kudoze running on http://localhost:${port}`));
