# Fitness Tracker — Frontend

React + Vite + TypeScript single-page app for the Fitness Tracker backend.

## Stack

- React 18 with React Router v6 for client-side routing
- Vite for dev/build (ES modules, HMR)
- TypeScript in strict mode
- Vanilla CSS with a dark theme (no external UI kit)

## Prerequisites

- Node.js 18+
- A running Fitness Tracker API (see the root `README.md`). The default Vite
  dev server proxies `/api/*` to `http://localhost:5000`.

## Getting started

```bash
cd client
npm install
npm run dev
```

The app will be served at <http://localhost:5173>. All requests to `/api/*`
are proxied to the backend during development, so there is no CORS setup to
do locally.

## Scripts

| Script              | Description                           |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Start Vite dev server with HMR        |
| `npm run build`     | Type-check and produce a prod build   |
| `npm run preview`   | Serve the production build locally    |
| `npm run typecheck` | Run `tsc --noEmit` without a build    |

## Structure

```
src/
├── api/          # Fetch wrapper, typed endpoints, shared DTOs
├── auth/         # AuthProvider + useAuth hook
├── components/   # Layout, ProtectedRoute, ErrorBanner
├── pages/        # Login, Register, Programs, Goals, Workouts
├── App.tsx       # Route table
├── main.tsx      # Entry point
└── styles.css    # Theme + component styles
```

## Auth model

JWTs returned by `/api/auth/login` are stored in `localStorage` and attached
to every outgoing request as `Authorization: Bearer <token>`. Token
validation is performed server-side on each request — the client never tries
to decode or validate the token itself.
