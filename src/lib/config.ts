/**
 * Whether Kudoze is open. Until launch it is waitlist-only: the web shows just the landing page
 * and the API refuses sign-up, sign-in and app routes. Set EXPO_PUBLIC_APP_OPEN=true in Vercel
 * (it is baked into the build and read by the API) and redeploy to open it.
 */
export const APP_OPEN = process.env.EXPO_PUBLIC_APP_OPEN === 'true';
