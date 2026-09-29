# Backend — Movie Release Calendar API

Express + TypeScript + Drizzle ORM + better-sqlite3 (zero-config local DB —
no external services to install). TMDB-backed movie data, JWT auth, and a
per-user `.ics` calendar subscription feed.

## Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` and set `TMDB_API_KEY` — get a free one at
https://www.themoviedb.org/settings/api (the "API Read Access Token" page;
you want the v3 "API Key" field).

```bash
npm run db:generate   # only needed if you change src/db/schema.ts
npm run db:migrate    # creates dev.db and applies the schema
npm run dev           # starts the API on http://localhost:4000
```

## API summary

| Method | Path                    | Auth | Description |
|--------|-------------------------|------|--------------|
| POST   | `/api/auth/register`    | —    | Create an account |
| POST   | `/api/auth/login`       | —    | Get a JWT |
| GET    | `/api/movies/calendar`  | —    | `?year=&month=` — all releases that month, grouped by day |
| GET    | `/api/movies/search`    | —    | `?query=` — TMDB search |
| GET    | `/api/movies/:id`       | —    | Single movie detail |
| GET    | `/api/tracked`          | ✅   | The caller's tracked movies |
| POST   | `/api/tracked`          | ✅   | `{ movieId, reminderMinutesBefore? }` |
| DELETE | `/api/tracked/:movieId` | ✅   | Untrack a movie |
| GET    | `/api/feed/me`          | ✅   | The caller's `.ics` subscription URL |
| POST   | `/api/feed/regenerate`  | ✅   | Issue a new feed URL (invalidates the old one) |
| GET    | `/api/feed/:token.ics`  | —    | The live `.ics` feed itself (public — the token is the secret) |

## Notes for going to production

- **Switch to Postgres**: swap `better-sqlite3` for `pg` and change the
  Drizzle driver import in `src/db/client.ts` from
  `drizzle-orm/better-sqlite3` to `drizzle-orm/node-postgres` (or your
  preferred Postgres driver) — `schema.ts` mostly carries over as-is.
- **Release-date drift**: TMDB release dates move (delays, regional
  staggering). This starter caches whatever TMDB reports the moment a
  movie is viewed/searched/tracked, but doesn't yet re-check dates in
  the background. Add a scheduled job that re-fetches tracked movies'
  `release_date` periodically and updates the `movies` table — the
  `.ics` feed will pick up the change automatically on the next
  calendar-app refresh since it's generated live from the DB.
- **Direct Google Calendar push**: the `.ics` feed works with
  Google/Apple/Outlook with zero OAuth, but subscribed calendars are
  read-only and reminder handling varies by app. For guaranteed custom
  notifications, add a Google Calendar API integration (OAuth 2.0 +
  `events.insert`/`events.patch`) as a second option alongside the feed.
