import type { DataSourceSettings, SleepSession } from './types';

// Thin client for a self-hosted Open Wearables backend.
// Endpoint per the Open Wearables API reference ("List Sleep Sessions"):
//   GET {baseUrl}/api/v1/users/{user_id}/events/sleep?start_date&end_date&include=stages
// Auth header: X-Open-Wearables-API-Key.
//
// Never ship an Open Wearables API key inside a public web or mobile build.
// In production, call your own backend, which holds the key and only returns
// the signed-in user's nights. Entering a key in Settings is for local testing.

interface Page {
  data: SleepSession[];
  pagination: { next_cursor: string | null; has_more: boolean };
}

export async function fetchSleepSessions(
  cfg: DataSourceSettings,
  startDate: string,
  endDate: string,
): Promise<SleepSession[]> {
  if (!cfg.baseUrl || !cfg.userId) throw new Error('Open Wearables URL and user id are required.');
  const out: SleepSession[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 20; page++) {
    const q = new URLSearchParams({ start_date: startDate, end_date: endDate, include: 'stages', limit: '100' });
    if (cursor) q.set('cursor', cursor);
    const url = `${cfg.baseUrl.replace(/\/$/, '')}/api/v1/users/${encodeURIComponent(cfg.userId)}/events/sleep?${q}`;
    const res = await fetch(url, {
      headers: cfg.apiKey ? { 'X-Open-Wearables-API-Key': cfg.apiKey } : {},
    });
    if (!res.ok) throw new Error(`Open Wearables answered ${res.status}`);
    const body = (await res.json()) as Page;
    out.push(...body.data);
    if (!body.pagination?.has_more || !body.pagination.next_cursor) break;
    cursor = body.pagination.next_cursor;
  }
  return out.filter((s) => s.is_final !== false);
}
