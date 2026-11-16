import { Platform } from 'react-native';

// The landing page's wide layout on the web, as CSS media queries. The page is rendered to static
// HTML at build time, where there is no window, so the JavaScript always lays it out narrow and
// these rules widen it in the browser, from the first paint, with no jump once the app hydrates.
// Each rule targets an element marked with lp('name'). The phone apps measure the window instead.
//
// RN-web writes styles as classes and inline styles, hence !important.

/** Marks an element for the landing page's media queries (web only). */
export function lp(name: string): object {
  return Platform.OS === 'web' ? { dataSet: { lp: name } } : {};
}

/** Breakpoints, shared with the phone apps' width checks. */
export const WIDE = 900;
export const JOIN_ROW = 520;

export const LANDING_CSS = `
@media (min-width: ${WIDE}px) {
  [data-lp="hero"] { flex-direction: row !important; align-items: center !important; padding-top: 72px !important; padding-bottom: 104px !important; }
  [data-lp="hero-text"] { flex: 1 1 0% !important; padding-right: 56px !important; }
  [data-lp="headline"] { font-size: 72px !important; line-height: 74px !important; }
  [data-lp="hero-art"] { flex: 1.05 1 0% !important; margin-top: 0 !important; }
  [data-lp="features-title"] { font-size: 44px !important; line-height: 48px !important; letter-spacing: -1.4px !important; }
  [data-lp="features"] { flex-direction: row !important; }
  [data-lp="band"] { flex-direction: row !important; align-items: flex-start !important; gap: 64px !important; }
  [data-lp="band-text"] { flex: 1 1 0% !important; }
  [data-lp="band-points"] { flex: 1 1 0% !important; margin-top: 0 !important; }
  [data-lp="band-title"] { font-size: 40px !important; line-height: 44px !important; }
  [data-lp="close-title"] { font-size: 48px !important; line-height: 52px !important; letter-spacing: -1.5px !important; }
}
@media (min-width: ${JOIN_ROW}px) {
  [data-lp="join"] { flex-direction: row !important; align-items: center !important; border-radius: 999px !important; padding: 5px 5px 5px 20px !important; }
  [data-lp="join-input"] { padding-top: 8px !important; padding-bottom: 8px !important; }
  [data-lp="join-button"] { align-self: auto !important; }
}
`;
