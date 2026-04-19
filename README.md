# Fitness Tracker — Pro Edition

A professional full-stack fitness tracking application built with a clean layered architecture, robust design patterns, and a modern TypeScript stack. This project demonstrates high-end backend engineering paired with a responsive React frontend.

## Features

The project models fitness tracking as a complete lifestyle lifecycle:

- **Secure Authentication**: Sign up and sign in using stateless JWT tokens.
- **Workout Programs**: Create long-lived training plans (e.g., "Strength Foundations", "Cardio Base").
- **Fitness Goals**: Set and track specific targets (e.g., "Sub-25min 5k") with achievement tracking.
- **Workout Sessions**: Log active sessions with automatic calorie computation using category-specific MET strategies.

## Architecture

The system follows a strict multi-layered architecture to ensure separation of concerns and maintainability.

```
Routes  →  Controllers  →  Services  →  Repositories  →  Mongoose Models
                                 │
                                 └──> Domain services (Calorie Strategy, etc.)
```

- **Clean Layering**: Each layer depends only on the layer below it.
- **Dependency Injection**: Services receive repositories via constructor injection, enabling easy testing.
- **Hybrid Storage**: Automatically switches between MongoDB and a high-performance in-memory store if the database is unavailable.

### Design Patterns

| Pattern | Implementation |
| :--- | :--- |
| **Singleton** | Database connection lifecycle management. |
| **Template Method** | Generic CRUD operations in the base repository. |
| **Strategy** | Category-specific calorie calculation formulas. |
| **Factory** | Dynamic strategy selection based on program type. |

## Technical Stack

- **Backend**: Node.js, Express, TypeScript, Mongoose.
- **Frontend**: React 18, Vite, TypeScript.
- **Database**: MongoDB (Atlas) with internal memory fallback.
- **Authentication**: JWT with bcrypt password hashing.

## Getting Started

### Backend Setup

1. Install dependencies: `npm install`
2. Configure `.env` (see `.env.example`).
3. Start development server: `npm run dev`
4. Seed demo data: `npm run seed`

### Frontend Setup

1. Navigate to client directory: `cd client`
2. Install dependencies: `npm install`
3. Start Vite server: `npm run dev`

## Deployment (Vercel, single project)

The repo is wired so a single Vercel project ships both halves:

- `api/index.ts` — Vercel serverless adapter that wraps the Express app and
  warms the Mongoose connection via the `Database` singleton (with an
  in-memory fallback if the DB is unreachable).
- `client/` — React + Vite app; its `dist/` output becomes the static site.
- `vercel.json` — rewrites `/api/*` to the serverless function and every
  other path to `index.html`, so the SPA owns client-side routing.

Vercel picks up these settings automatically from `vercel.json`:

| Setting              | Value                                        |
| :------------------- | :------------------------------------------- |
| Install Command      | `npm install`                                |
| Build Command        | `cd client && npm install && npm run build`  |
| Output Directory     | `client/dist`                                |
| Framework Preset     | Other                                        |

### Required Environment Variables (Vercel → Project → Settings → Environment Variables)

- `MONGO_URI` — MongoDB Atlas connection string (local URIs can't be reached
  from Vercel; use a free-tier Atlas cluster).
- `JWT_SECRET` — long, random string.
- `JWT_EXPIRES_IN` — e.g. `7d`.
- `CORS_ORIGIN` — your deployment URL (or `*` for a demo).
- `NODE_ENV` — `production`.

After a `git push` the deployment URL will serve:

- `/`, `/login`, `/register`, `/programs`, `/goals`, `/workouts` — React SPA
- `/api/health`, `/api/auth/*`, `/api/programs`, `/api/goals`, `/api/workouts`
  — the JSON API backed by the Express app

## Diagrams

Visual documentation is available in the root directory:
- `useCaseDiagram.md`
- `sequenceDiagram.md`
- `classDiagram.md`
- `erDiagram.md`

---
Copyright © 2026 Fitness Tracker Project. All rights reserved.
