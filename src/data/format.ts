export function hm(minutes: number): string {
  const m = Math.round(minutes);
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h ? `${h}h ${r.toString().padStart(2, '0')}m` : `${r}m`;
}

export function clock(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

/** "Last night", "Tuesday night" or "3 Nov" depending on how long ago the night ended. */
export function nightLabel(endIso: string): string {
  const end = new Date(endIso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);
  const days = Math.round((today.getTime() - endDay.getTime()) / 86400000);
  const evening = new Date(end.getTime() - 86400000);
  if (days === 0) return 'Last night';
  if (days < 6) return `${evening.toLocaleDateString('en-GB', { weekday: 'long' })} night`;
  return end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function ago(iso: string): string {
  const s = (Date.now() - Date.parse(iso)) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
