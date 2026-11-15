# Nightfeed

A social feed for sleep: post your nights, give kudos, comment, follow people and join consistency challenges. One Expo (React Native) codebase runs as a web app and as native iOS and Android apps.

Everything runs on generated demo data. Every person in the demo is made up.

## Run it

```bash
npm install
npm run web        # browser
npm run ios        # iOS simulator (needs a Mac) or Expo Go
npm run android    # Android emulator or Expo Go
npm run typecheck
npm run build:web  # static web build in dist/
```

For store builds use EAS (`npx eas-cli@latest build -p ios|android`). Bundle ids in `app.json` are placeholders (`com.example.nightfeed`): change them first.

## How it is built

- **Expo SDK 58 + Expo Router**, routes in `src/app/`. Tabs: Feed, Log night, Challenges, You. Stack screens: `night/[id]`, `sleeper/[id]`.
- **react-native-svg** for the hypnogram, score ring and icons, so charts render the same on all three platforms.
- **State** in a React context (`src/data/store.tsx`), saved with AsyncStorage (localStorage on web).

### Data

- `src/data/types.ts` mirrors the Open Wearables `SleepSession` schema (`GET /api/v1/users/{user_id}/events/sleep`), so demo nights and real nights go through the same code.
- `src/data/generate.ts` makes realistic nights: ~90 minute cycles, more deep sleep early, more REM late, a few wake-ups. Whoop and Suunto nights come without stages, like the real providers.
- `src/data/openWearables.ts` is a working client for that endpoint (cursor pagination, `X-Open-Wearables-API-Key` header). Switch it on under **You → Data source**.

### Score

`src/data/score.ts` computes one score for every brand from normalised minutes: duration 40%, stages 20%, consistency (bedtime vs your 14-night median) 20%, interruptions 20%. When a device has no stages, that pillar is left out and the other weights are rescaled. The night screen shows the breakdown.

## Before real users

- **Backend.** Social data (follows, kudos, comments, challenges) is local only. A real launch needs accounts and a database, plus your own server between the app and Open Wearables. Never put an Open Wearables API key in a shipped app.
- **Phone health data.** Apple Health and Health Connect data comes from the phone through the Open Wearables mobile SDK, which needs a development build, not Expo Go.
- **Privacy.** Sleep data is health data under GDPR. Nights are followers-only by default and can be set to "Only me". Explicit consent, data export and deletion are still to be built.
