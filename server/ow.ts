import type { Env } from './env.js';
import type { SleepSession } from '../src/data/types.js';

// Server-side Open Wearables client. Paths follow the Open Wearables API reference:
// users, OAuth authorize, SDK user tokens and the sleep events endpoint.

export class OpenWearables {
  constructor(private env: Env) {}

  get configured() {
    return Boolean(this.env.OW_BASE_URL && this.env.OW_API_KEY);
  }

  private async call<T>(path: string, init: RequestInit = {}): Promise<T> {
    if (!this.configured) throw new Error('Open Wearables is not configured.');
    const res = await fetch(`${this.env.OW_BASE_URL!.replace(/\/$/, '')}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'X-Open-Wearables-API-Key': this.env.OW_API_KEY!,
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) throw new Error(`Open Wearables ${init.method ?? 'GET'} ${path} answered ${res.status}`);
    return (res.status === 204 ? undefined : await res.json()) as T;
  }

  /** POST /api/v1/users. Returns the Open Wearables user id to store on our user. */
  async createUser(email: string, name: string): Promise<string> {
    const body = await this.call<{ id: string }>('/api/v1/users', {
      method: 'POST',
      body: JSON.stringify({ email, first_name: name }),
    });
    return body.id;
  }

  async deleteUser(owUserId: string): Promise<void> {
    await this.call(`/api/v1/users/${encodeURIComponent(owUserId)}`, { method: 'DELETE' });
  }

  /** GET /api/v1/oauth/{provider}/authorize: the page where the user approves the device link. */
  async authorizeUrl(owUserId: string, provider: string, redirectUri: string): Promise<string> {
    const q = new URLSearchParams({ user_id: owUserId, redirect_uri: redirectUri });
    const body = await this.call<{ authorization_url: string }>(
      `/api/v1/oauth/${encodeURIComponent(provider)}/authorize?${q}`,
    );
    return body.authorization_url;
  }

  /** POST /api/v1/users/{id}/token: tokens for the mobile SDK (Apple Health, Health Connect). */
  async sdkToken(owUserId: string): Promise<{ access_token: string; refresh_token: string }> {
    return this.call(`/api/v1/users/${encodeURIComponent(owUserId)}/token`, { method: 'POST' });
  }

  /** GET /api/v1/users/{id}/events/sleep with stages, following the cursor. */
  async sleepSessions(owUserId: string, startDate: string, endDate: string): Promise<SleepSession[]> {
    const out: SleepSession[] = [];
    let cursor: string | null = null;
    for (let page = 0; page < 20; page++) {
      const q = new URLSearchParams({ start_date: startDate, end_date: endDate, include: 'stages', limit: '100' });
      if (cursor) q.set('cursor', cursor);
      const body: { data: SleepSession[]; pagination?: { has_more: boolean; next_cursor: string | null } } =
        await this.call(`/api/v1/users/${encodeURIComponent(owUserId)}/events/sleep?${q}`);
      out.push(...body.data);
      if (!body.pagination?.has_more || !body.pagination.next_cursor) break;
      cursor = body.pagination.next_cursor;
    }
    return out.filter((s) => s.is_final !== false);
  }
}
