import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Web runs on the same domain as the API, so it uses relative URLs and cookies.
 * The phone apps call the deployed API and keep the session in the secure keychain.
 */
export const API_BASE =
  Platform.OS === 'web'
    ? typeof window !== 'undefined'
      ? window.location.origin
      : ''
    : (process.env.EXPO_PUBLIC_API_URL ?? 'https://kudoze.app');

export const authClient = createAuthClient({
  baseURL: `${API_BASE}/api/auth`,
  plugins:
    Platform.OS === 'web'
      ? []
      : [expoClient({ scheme: 'kudoze', storagePrefix: 'kudoze', storage: SecureStore })],
});

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
  }
}

/** Headers that carry the session on the phone apps (web uses its cookie automatically). */
export function authHeaders(): Record<string, string> | undefined {
  if (Platform.OS === 'web') return undefined;
  const cookie = (authClient as unknown as { getCookie: () => string }).getCookie();
  return cookie ? { Cookie: cookie } : undefined;
}

/** Calls the Kudoze API with the signed-in session. */
export async function api<T = unknown>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (Platform.OS !== 'web') {
    const cookie = (authClient as unknown as { getCookie: () => string }).getCookie();
    if (cookie) headers.Cookie = cookie;
  }
  const res = await fetch(`${API_BASE}/api${path}`, {
    method: init.method ?? 'GET',
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    credentials: Platform.OS === 'web' ? 'include' : 'omit',
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;
  if (!res.ok) throw new ApiError((data as { error?: string })?.error ?? `Request failed (${res.status})`, res.status, data);
  return data as T;
}
