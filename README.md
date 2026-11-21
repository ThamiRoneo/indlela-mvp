# Indlela (MVP)

Android-first job-seeker MVP: fares by taxi rank, an affordability-first job feed, fare alerts and budgeting, and offline support.

- Product requirements: [`docs/PRD.md`](docs/PRD.md)
- Build plan and acceptance checks: [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md)

## Prerequisites

From `IMPLEMENTATION_PLAN.md` §4.2:

- Node.js 24 LTS and npm
- Git and a GitHub account
- Docker Desktop, running (local Supabase needs it)
- Android Studio with one Android emulator (E2E tests and development build)
- An Android phone with Expo Go (daily manual testing)
- Maestro CLI
- Accounts: Supabase and Expo (for EAS Build)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create your local environment file. `.env` is gitignored and never committed:

   ```bash
   cp .env.example .env
   ```

3. Start the local backend:

   ```bash
   npx supabase start
   ```

   On VMs where Supabase's health check is unreliable, use `npx supabase start --ignore-health-check`.

4. Read the local keys with `npx supabase status` and fill in `.env`:

   | Variable | Local value |
   | --- | --- |
   | `SUPABASE_URL` | `http://127.0.0.1:54321` (as your computer sees it) |
   | `EXPO_PUBLIC_SUPABASE_URL` | As the phone sees it: `http://10.0.2.2:54321` on the emulator, or `http://<your Wi-Fi IP>:54321` on a real phone |
   | `EXPO_PUBLIC_SUPABASE_ANON_KEY` | The `anon` / publishable key from `supabase status` |
   | `SUPABASE_SERVICE_ROLE_KEY` | The `service_role` / secret key from `supabase status` — scripts and tests only |
   | `SEED_TEST_PASSWORD` | A test-only password you choose |

   Migrations `0001`–`0005` (schema, RLS, triggers, seed data, storage) are applied by `supabase start`. Only variables starting with `EXPO_PUBLIC_` may be imported by `app/`, `components/` or `lib/`.

5. Seed the private Storage buckets (idempotent; safe to re-run):

   ```bash
   node scripts/seed-storage.ts
   ```

6. Start the app:

   ```bash
   npx expo start
   ```

## Commands

From `IMPLEMENTATION_PLAN.md` §4.3:

| Purpose | Command |
| --- | --- |
| Install dependencies | `npm install` |
| Start the local backend | `npx supabase start` |
| Reset the database (migrations + seed) | `npx supabase db reset` |
| Serve server functions locally | `npx supabase functions serve` |
| Start the app | `npx expo start` |
| Unit and component tests | `npm test` |
| Database and permission tests | `npx supabase test db` |
| Integration tests | `npm run test:integration` |
| End-to-end tests | `npx expo run:android`, then `maestro test -e SEED_TEST_PASSWORD=$SEED_TEST_PASSWORD .maestro/` |
| Lint | `npx expo lint` |
| Type check | `npx tsc --noEmit` |
| **Full check (run before every "done")** | `npm run check` — lint, type check, `npm test`, `supabase test db`, `test:integration`. Local Supabase must be running. |
| Build for release | `npx eas-cli build -p android --profile preview` |

## Test accounts

- `e2e-test@example.com` — seeded by `node scripts/seed-storage.ts`, used by the Maestro flows.
- Password for every seed account is `SEED_TEST_PASSWORD` from `.env`.
- Integration tests create their own short-lived accounts with random `@example.com` addresses; they do not depend on seeded users.
- Additional seed data (ranks, routes, fare reports, job listings, fuel snapshot) is in `supabase/migrations/0004_seed.sql`.

## How to run tests

```bash
npm test                  # unit + component (Jest)
npx supabase test db      # pgTAP schema, trigger, rule and RLS tests
npm run test:integration  # Jest + supabase-js against local Supabase
npm run check             # all of the above, plus lint and typecheck
```

E2E tests are separate from `npm run check`:

```bash
npx expo run:android
maestro test -e SEED_TEST_PASSWORD=$SEED_TEST_PASSWORD .maestro/
```

The flows are `00_launch.yaml`, `01_onboarding.yaml`, `02_fare_report.yaml`, `03_job_feed.yaml` and `04_offline.yaml`. They need a running Android emulator.

## Security notes

- Real keys live only in `.env`, which is gitignored. A secretlint scan (`npx secretlint "**/*"`) must find none in the repository.
- Storage buckets `avatars` and `posts` are private. The app reads objects through signed URLs; all writes go through service-role scripts.
