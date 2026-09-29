# Frontend — Movie Release Calendar

React + Vite + TypeScript + Tailwind v4, with hand-built shadcn-style UI
components (Button, Card, Input, Dialog) on Radix primitives.

## Setup

```bash
npm install
cp .env.example .env   # points VITE_API_URL at the backend
npm run dev
```

Runs at http://localhost:5173 — make sure the backend (see ../backend/README.md)
is running first at the URL set in `.env`.

## Structure

- `src/pages/` — HomePage (the month calendar), Search, Login, Signup, Settings
- `src/components/calendar/` — MonthView (the grid) and DayDetailDialog (click-a-day modal)
- `src/components/ui/` — shadcn-style primitives (Button, Card, Input, Dialog)
- `src/api/` — typed API client functions matching the backend routes
- `src/hooks/useAuth.tsx` — auth state, persisted in localStorage

## Build

```bash
npm run build
```
