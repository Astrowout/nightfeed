import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { api } from '../lib/auth';
import type { AppState, Comment, Night, Visibility } from './types.js';

// The server is the source of truth. Actions update the screen straight away
// (optimistic), call the API, and re-load the state when the server disagrees.

type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'kudos'; nightId: string }
  | { type: 'comment'; nightId: string; text: string }
  | { type: 'follow'; sleeperId: string }
  | { type: 'join'; challengeId: string }
  | { type: 'visibility'; nightId: string; visibility: Visibility }
  | { type: 'deleteNight'; nightId: string };

const toggle = (xs: string[], x: string) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);

function reducer(state: AppState | null, a: Action): AppState | null {
  if (a.type === 'hydrate') return a.state;
  if (!state) return state;
  const mapNight = (nightId: string, f: (n: Night) => Night) => ({ ...state, nights: state.nights.map((n) => (n.id === nightId ? f(n) : n)) });
  switch (a.type) {
    case 'kudos':
      return mapNight(a.nightId, (n) => ({ ...n, kudos: toggle(n.kudos, state.meId) }));
    case 'comment': {
      const c: Comment = { id: `tmp-${Date.now()}`, authorId: state.meId, text: a.text, createdAt: new Date().toISOString() };
      return mapNight(a.nightId, (n) => ({ ...n, comments: [...n.comments, c] }));
    }
    case 'follow':
      return { ...state, following: toggle(state.following, a.sleeperId) };
    case 'join':
      return {
        ...state,
        challenges: state.challenges.map((c) => (c.id === a.challengeId ? { ...c, participants: toggle(c.participants, state.meId) } : c)),
      };
    case 'visibility':
      return mapNight(a.nightId, (n) => ({ ...n, visibility: a.visibility }));
    case 'deleteNight':
      return { ...state, nights: state.nights.filter((n) => n.id !== a.nightId) };
  }
}

interface Ctx {
  state: AppState;
  dispatch: (a: Action) => void;
  refresh: () => Promise<void>;
  error: string | null;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children, fallback }: { children: React.ReactNode; fallback: (error: string | null, retry: () => void) => React.ReactNode }) {
  const [state, local] = useReducer(reducer, null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      local({ type: 'hydrate', state: await api<AppState>('/state') });
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load your feed.');
    }
  }, []);

  // First load. State is set only in the promise callbacks, and a late answer after
  // unmount is ignored. refresh() above stays for retries and pull-to-refresh.
  useEffect(() => {
    let live = true;
    api<AppState>('/state').then(
      (s) => {
        if (!live) return;
        local({ type: 'hydrate', state: s });
        setError(null);
      },
      (e: unknown) => {
        if (live) setError(e instanceof Error ? e.message : 'Could not load your feed.');
      },
    );
    return () => {
      live = false;
    };
  }, []);

  const dispatch = useCallback(
    (a: Action) => {
      if (!state) return;
      local(a);
      const call = (): Promise<unknown> | undefined => {
        switch (a.type) {
          case 'kudos': {
            const given = state.nights.find((n) => n.id === a.nightId)?.kudos.includes(state.meId);
            return api(`/nights/${a.nightId}/kudos`, { method: given ? 'DELETE' : 'POST' });
          }
          case 'comment':
            return api(`/nights/${a.nightId}/comments`, { method: 'POST', body: { text: a.text } }).then(refresh);
          case 'follow':
            return api(`/follows/${a.sleeperId}`, { method: state.following.includes(a.sleeperId) ? 'DELETE' : 'POST' }).then(refresh);
          case 'join': {
            const joined = state.challenges.find((c) => c.id === a.challengeId)?.participants.includes(state.meId);
            return api(`/challenges/${a.challengeId}/join`, { method: joined ? 'DELETE' : 'POST' }).then(refresh);
          }
          case 'visibility':
            return api(`/nights/${a.nightId}`, { method: 'PATCH', body: { visibility: a.visibility } });
          case 'deleteNight':
            return api(`/nights/${a.nightId}`, { method: 'DELETE' });
        }
      };
      call()?.catch((e) => {
        setError(e instanceof Error ? e.message : 'That did not save.');
        refresh();
      });
    },
    [state, refresh],
  );

  const value = useMemo(() => (state ? { state, dispatch, refresh, error } : null), [state, dispatch, refresh, error]);
  if (!value) return <>{fallback(error, refresh)}</>;
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore outside StoreProvider');
  return ctx;
}
