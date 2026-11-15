// Server configuration. Every secret comes from Vercel environment variables,
// never from the app bundle.

export interface Env {
  /** Postgres connection string (Neon via the Vercel Marketplace). */
  DATABASE_URL?: string;
  BETTER_AUTH_SECRET: string;
  /** Public base URL of this deployment, e.g. https://kudoze.vercel.app */
  BETTER_AUTH_URL?: string;
  /** Extra allowed browser origins, comma separated. */
  TRUSTED_ORIGINS?: string;
  /** Open Wearables. When OW_BASE_URL is empty the backend runs in demo mode. */
  OW_BASE_URL?: string;
  OW_API_KEY?: string;
  OW_WEBHOOK_SECRET?: string;
  /** Vercel sends this as a Bearer token on cron requests. */
  CRON_SECRET?: string;
  /** Time zone used for bedtimes and challenge rules. */
  APP_TIMEZONE?: string;
}

export function readEnv(source: Record<string, string | undefined> = process.env): Env {
  const secret = source.BETTER_AUTH_SECRET;
  if (!secret) throw new Error('BETTER_AUTH_SECRET is not set.');
  const vercelUrl = source.VERCEL_PROJECT_PRODUCTION_URL ?? source.VERCEL_URL;
  return {
    DATABASE_URL: source.DATABASE_URL ?? source.POSTGRES_URL,
    BETTER_AUTH_SECRET: secret,
    BETTER_AUTH_URL: source.BETTER_AUTH_URL ?? (vercelUrl ? `https://${vercelUrl}` : undefined),
    TRUSTED_ORIGINS: [source.TRUSTED_ORIGINS, source.VERCEL_URL && `https://${source.VERCEL_URL}`, source.VERCEL_BRANCH_URL && `https://${source.VERCEL_BRANCH_URL}`]
      .filter(Boolean)
      .join(','),
    OW_BASE_URL: source.OW_BASE_URL || undefined,
    OW_API_KEY: source.OW_API_KEY || undefined,
    OW_WEBHOOK_SECRET: source.OW_WEBHOOK_SECRET || undefined,
    CRON_SECRET: source.CRON_SECRET || undefined,
    APP_TIMEZONE: source.APP_TIMEZONE || 'Europe/Brussels',
  };
}

export const isDemoMode = (env: Env) => !env.OW_BASE_URL;
