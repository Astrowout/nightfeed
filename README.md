# Kudoze

A social feed for sleep: post your nights, give kudos, comment, follow people and join bedtime challenges. One Expo (React Native) codebase runs as a web app and as native iOS and Android apps. The API runs on Vercel next to the web app.

## Run it

```bash
npm install
npm run build:web && npm run local   # web app + API + in-memory database on http://localhost:8787
npm run test:api                     # end-to-end API checks against an in-memory Postgres
npm run typecheck
npm run ios | android                # native apps (set EXPO_PUBLIC_API_URL to your deployed URL)
```

## Stack

| Layer | Choice |
| --- | --- |
| App | Expo SDK 58, React Native 0.88, Expo Router, react-native-svg, Inter + Lora |
| API | One Vercel Function (`api/index.ts`) running Hono, code in `server/` |
| Database | Postgres on Neon (Vercel Marketplace), Drizzle ORM, migrations in `drizzle/` |
| Accounts | Better Auth (email + password), Expo plugin for the phone apps |
| Wearables | Open Wearables (self-hosted, not on Vercel); demo data until it runs |

## Deploy on Vercel

1. Add **Neon** from the Vercel Marketplace to the project (EU region). It sets `DATABASE_URL`.
2. Add environment variables in Vercel, never in the repo:
   - `BETTER_AUTH_SECRET`: a random value, e.g. `openssl rand -base64 32`
   - `CRON_SECRET`: another random value (Vercel sends it to the daily cron)
   - `BETTER_AUTH_URL`: optional, your production URL (defaults to the Vercel production domain)
3. Push to `main`. The build runs migrations, seeds the demo people once, and exports the web app.

### Open Wearables (later)

Open Wearables needs always-on workers (Celery, Redis), so it runs on a Docker host, not on Vercel. When it runs, set `OW_BASE_URL`, `OW_API_KEY` and `OW_WEBHOOK_SECRET` in Vercel and point its outgoing webhook to `https://<your-domain>/api/webhooks/open-wearables` (events `sleep.created`, `connection.created`, `connection.revoked`). The backend then leaves demo mode: new users get an Open Wearables user, devices connect through its OAuth links, and nights arrive by webhook, with a daily cron as safety net.

## API

All routes are under `/api`; everything except auth, the waitlist, webhooks and cron needs a session.

| Route | What it does |
| --- | --- |
| `/auth/*` | Better Auth: sign-up (requires `healthConsent: true`), sign-in, sign-out, session |
| `GET /state` | Everything the app shows: you, the people you follow, their nights from the last 35 days, challenges with leaderboards |
| `POST /nights`, `GET/PATCH/DELETE /nights/:id` | Post, read, change visibility, delete a night (score computed on the server) |
| `PUT/DELETE /nights/:id/photo`, `GET /photos/:id` | Photo of the day: one per night, resized on the device first; only people who can see the night can load it |
| `POST/DELETE /nights/:id/kudos`, `POST /nights/:id/comments` | Social |
| `POST/DELETE /follows/:id`, `POST/DELETE /challenges/:id/join` | Follow, join |
| `POST /sync` | Last night as a draft (demo, or from Open Wearables) |
| `POST /connect/:provider`, `POST /connect/sdk-token` | Link a device / tokens for the phone SDK |
| `GET /me/export`, `DELETE /me` | Download or delete all your data |
| `POST /waitlist` | Landing page: save an email to hear when Kudoze opens (public) |
| `GET /waitlist` | The waitlist, for the team (`Authorization: Bearer $CRON_SECRET`) |
| `POST /webhooks/open-wearables` | Svix-signed Open Wearables events, deduplicated |
| `GET /cron/daily` | New challenge rounds, demo nights, missed-webhook catch-up |

## Design

The look merges two references: Superhuman (warm parchment canvas, white hairline cards, Midnight Wine as the only filled action, Lilac for selected states, Violet for links, Deep Lagoon as the single dark "night" band) and Craft Docs (Lora serif headlines over Inter, pastel stage colours and tags, torn-paper collage scraps, pill buttons, soft layered shadows on floating elements only). Tokens live in `src/theme.ts`.

The mascot is **Plume**, a plush pillow made with [bot-avatars](https://libraries.dev/bots) (MIT, Jakub Antalik). Like a brand bear, it is one character everywhere, in different moods and outfits: it greets you in speech bubbles (`MascotSays`), wears headphones, a bow tie or shades on the landing page (never a hat), hops while the app loads or syncs, and dozes on empty states and the not-found page. The app icon, splash and favicon are rendered from it. A full-moon look is kept as an alternative (`MASCOT_LOOK` in `src/components/mascotConfig.ts`). On the web Plume is animated; the phone apps show a still drawing until the library's React Native port is on npm.

## Privacy

Sleep data is health data under GDPR. Sign-up needs explicit consent, nights are followers-only by default and can be set to "Only me", and every user can download or delete their data from the profile. All other people in demo mode are invented.
