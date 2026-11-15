import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { createSeed } from './seed';
import type { AppState, DataSourceSettings, Night, ProviderName, Visibility } from './types';

const KEY = 'nightfeed.state.v1';

type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'kudos'; nightId: string }
  | { type: 'comment'; nightId: string; text: string }
  | { type: 'follow'; sleeperId: string }
  | { type: 'join'; challengeId: string }
  | { type: 'addNights'; nights: Night[] }
  | { type: 'visibility'; nightId: string; visibility: Visibility }
  | { type: 'deleteNight'; nightId: string }
  | { type: 'provider'; provider: ProviderName }
  | { type: 'dataSource'; settings: DataSourceSettings }
  | { type: 'reset' };

const id = () => Math.random().toString(36).slice(2, 10);
const toggle = (xs: string[], x: string) => (xs.includes(x) ? xs.filter((y) => y !== x) : [...xs, x]);

function reducer(state: AppState, a: Action): AppState {
  const mapNight = (nightId: string, f: (n: Night) => Night) => ({
    ...state,
    nights: state.nights.map((n) => (n.id === nightId ? f(n) : n)),
  });
  switch (a.type) {
    case 'hydrate':
      return a.state;
    case 'kudos':
      return mapNight(a.nightId, (n) => ({ ...n, kudos: toggle(n.kudos, state.meId) }));
    case 'comment':
      return mapNight(a.nightId, (n) => ({
        ...n,
        comments: [...n.comments, { id: id(), authorId: state.meId, text: a.text, createdAt: new Date().toISOString() }],
      }));
    case 'follow':
      return { ...state, following: toggle(state.following, a.sleeperId) };
    case 'join':
      return {
        ...state,
        challenges: state.challenges.map((c) =>
          c.id === a.challengeId ? { ...c, participants: toggle(c.participants, state.meId) } : c,
        ),
      };
    case 'addNights': {
      // Replace nights that overlap an existing one of the same sleeper (re-sync).
      const incoming = a.nights;
      const kept = state.nights.filter(
        (n) =>
          !incoming.some(
            (m) =>
              m.sleeperId === n.sleeperId &&
              (m.session.id === n.session.id ||
                (m.session.start_time < n.session.end_time && m.session.end_time > n.session.start_time)),
          ),
      );
      return { ...state, nights: [...kept, ...incoming] };
    }
    case 'visibility':
      return mapNight(a.nightId, (n) => ({ ...n, visibility: a.visibility }));
    case 'deleteNight':
      return { ...state, nights: state.nights.filter((n) => n.id !== a.nightId) };
    case 'provider':
      return {
        ...state,
        connectedProviders: state.connectedProviders.includes(a.provider)
          ? state.connectedProviders.filter((p) => p !== a.provider)
          : [...state.connectedProviders, a.provider],
      };
    case 'dataSource':
      return { ...state, dataSource: a.settings };
    case 'reset':
      return createSeed();
  }
}

interface Ctx {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  ready: boolean;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => createSeed());
  const [ready, setReady] = React.useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as AppState;
          if (parsed.version === 1) dispatch({ type: 'hydrate', state: parsed });
        }
      } catch {
        // Storage unavailable (private window): keep the fresh demo state.
      }
      loaded.current = true;
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const value = useMemo(() => ({ state, dispatch, ready }), [state, ready]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore outside StoreProvider');
  return ctx;
}
