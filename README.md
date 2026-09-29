# Movie Release Calendar

Track upcoming movie releases (via TMDB) on a Google Calendar-style month
view, and subscribe to your tracked movies from Google Calendar, Apple
Calendar, or Outlook via a personal `.ics` feed link.

## Quick start

Open two terminals:

```bash
# Terminal 1 — backend
cd backend
npm install
cp .env.example .env
# then edit .env and add your TMDB_API_KEY (free at themoviedb.org)
npm run db:migrate
npm run dev            # http://localhost:4000

# Terminal 2 — frontend
cd frontend
npm install
cp .env.example .env
npm run dev            # http://localhost:5173
```

Open http://localhost:5173, sign up, and start tracking movies. Each
day's cell shows the most popular releases; click a day to see everything
releasing then and track/untrack from there. Your subscription link lives
under Settings once you're logged in.

## Stack

- **Frontend**: React + Vite + TypeScript + Tailwind v4 + shadcn-style
  components (Button/Card/Input/Dialog) on Radix primitives
- **Backend**: Node.js + Express + TypeScript + Drizzle ORM + SQLite
  (via better-sqlite3 — no external DB to install for local dev)
- **Data source**: [TMDB](https://www.themoviedb.org/) (free API)
- **Calendar sync**: a personal `.ics` subscription feed (works with
  Google/Apple/Outlook, no OAuth needed) — see `backend/README.md` for
  notes on adding a direct Google Calendar API push option later

See `backend/README.md` and `frontend/README.md` for more detail on
each half, including the API route table and what to change for a
Postgres-backed production deployment.

## Project structure

```
movie-calendar/
├── backend/      Express API — auth, TMDB proxy/cache, tracked movies, .ics feed
└── frontend/     React app — month calendar, search, login/signup, settings
```
