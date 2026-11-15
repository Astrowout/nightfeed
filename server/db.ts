import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import type { schema } from './schema.js';

/** Works with the Neon HTTP driver in production and PGlite in tests. No transactions are used. */
export type DB = PgDatabase<PgQueryResultHKT, typeof schema>;
