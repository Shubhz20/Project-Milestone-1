# Fitness Tracker — Full Stack (SESD Project Milestone 1)

A full-stack fitness tracking application built to demonstrate object-oriented
design, clean layered architecture, and idiomatic use of classic design
patterns. The backend is the centre of gravity (~75% of the work) and is
paired with a small React SPA that exercises the full surface of the API.

## Project goals

The project models fitness tracking as a lifecycle rather than a checklist:

- A user signs up and signs in with a stateless JWT.
- They create **Workout Programs** — long-lived plans such as "Foundations of
  Strength" or "Zone 2 Cardio Base", each tagged with a category.
- Inside a program they set **Fitness Goals** (e.g. "sub-25min 5k") that can
  be updated and marked achieved.
- They log **Workout Sessions** — starting a session, ending it later, and
  letting the system compute duration and estimated calories from the
  program's category.

## Architecture

The backend follows a strict layered architecture. Each layer depends only on
the layer below it, which keeps responsibilities narrow and makes the code
easy to test in isolation.

```
Routes  →  Controllers  →  Services  →  Repositories  →  Mongoose Models
                                │
                                └──> Domain services (CalorieStrategy, …)
```

- **Routes** wire HTTP verbs to controller methods and attach the middleware
  chain (auth → validate → ownership → handler).
- **Controllers** are thin: they pull the validated payload off the request,
  call a service, and serialise the result. All async work is wrapped in
  `asyncHandler` so errors flow to a single global error handler.
- **Services** own business rules. They accept repositories via constructor
  injection, which means every service can be instantiated with a fake
  repository in tests.
- **Repositories** extend a generic `BaseRepository<T>` (Template Method) and
  are the only place that talks to Mongoose directly.
- **Models** hold the schema, indexes, and a handful of invariants
  (`toJSON` strips the password, workout sessions reject `endTime <= startTime`).

### Design patterns in use

| Pattern             | Where                                              | Why                                                                 |
| :------------------ | :------------------------------------------------- | :------------------------------------------------------------------ |
| **Singleton**       | `src/config/db.ts` — `Database`                    | A single connection lifecycle for the whole process.                |
| **Template Method** | `src/repositories/base.repository.ts`              | Shared CRUD; subclasses add their domain-specific queries.          |
| **Strategy**        | `src/services/calorie/` — `CalorieStrategy`        | Each program category plugs in its own MET-based calorie formula.   |
| **Factory**         | `CalorieStrategyFactory.for(category)`             | Callers depend on the interface, not the concrete strategies.       |
| **Dependency Injection** | Services take repositories via constructor     | Trivial to substitute fakes in unit tests.                          |

### Security model

- Passwords are hashed with `bcrypt` (cost 10 in prod, 4 in tests for speed).
- Authentication is stateless JWT. Tokens are verified per-request in
  `auth.middleware.ts`.
- `ownership.middleware.ts` is mounted on every mutation route and rejects
  any attempt to touch a document owned by another user.
- Error responses use a centralised `AppError` hierarchy with a consistent
  JSON envelope (`{ error: { message, code, details? } }`).

## Repository layout

```
.
├── src/                     # Backend — Express + TypeScript
│   ├── app.ts               # createApp() factory, middleware stack
│   ├── server.ts            # Process entry point
│   ├── config/              # Env + DB singleton
│   ├── controllers/         # Thin HTTP handlers (class-based)
│   ├── errors/              # AppError hierarchy
│   ├── middlewares/         # auth, validate, ownership, error, cors, logger
│   ├── models/              # Mongoose schemas
│   ├── repositories/        # BaseRepository + domain repositories
│   ├── routes/              # Route tables per resource
│   ├── scripts/seed.ts      # Idempotent demo-data seeder
│   ├── services/            # Business logic, incl. calorie strategies
│   ├── tests/               # node:test suites
│   └── validators/          # Dependency-free schema validation
├── client/                  # Frontend — React 18 + Vite + TS
├── scripts/test.ts          # Custom node:test runner with tap reporter
├── classDiagram.md
├── erDiagram.md
├── sequenceDiagram.md
├── useCaseDiagram.md
└── idea.md
```

## Backend

### Prerequisites

- Node.js 18+ (Node 22 tested)
- MongoDB (local daemon or Atlas)

### Configuration

Create `.env` in the repository root:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/fitness-tracker
JWT_SECRET=replace-me-with-something-long-and-random
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

The environment loader is typed (`src/config/env.ts`) and fails fast on
missing values.

### Install, build, run

```bash
npm install          # install backend dependencies
npm run dev          # start the API with ts-node-dev (HMR)
npm run build        # emit dist/ via tsc
npm start            # run the compiled build
npm run seed         # populate MongoDB with a demo user + data
npm test             # run the node:test suite
```

The seed script is idempotent for the demo user; it deletes any existing
records owned by `demo@fitness.local` before reinserting. Other users' data
is untouched. After seeding you can sign in with:

```
email:    demo@fitness.local
password: Password123
```

### API

All `/api/*` routes except `auth/*` require `Authorization: Bearer <token>`.

| Method | Path                         | Purpose                           |
| :----- | :--------------------------- | :-------------------------------- |
| POST   | `/api/auth/register`         | Create account                    |
| POST   | `/api/auth/login`            | Exchange credentials for a JWT    |
| GET    | `/api/programs`              | List the caller's programs        |
| POST   | `/api/programs`              | Create a program                  |
| DELETE | `/api/programs/:id`          | Delete a program (owner only)     |
| GET    | `/api/goals`                 | List the caller's goals           |
| POST   | `/api/goals`                 | Create a goal for a program       |
| PATCH  | `/api/goals/:id`             | Update a goal / mark achieved     |
| DELETE | `/api/goals/:id`             | Delete a goal                     |
| GET    | `/api/workouts`              | List the caller's sessions        |
| POST   | `/api/workouts`              | Start a session for a program     |
| PATCH  | `/api/workouts/:id/end`      | End a session (computes duration) |
| GET    | `/api/health`                | Liveness probe                    |

### Tests

The suite runs on Node's built-in `node:test` via a tiny wrapper at
`scripts/test.ts` that uses the programmatic `run()` API with a tap reporter.
This sidesteps the Node 22 `ts-node/esm` loader issue when invoking
`node --test` directly.

What's covered:

- `schema.test.ts` — the dependency-free validator (required, coercion,
  min/max, enums, ObjectId shape).
- `calorie.test.ts` — `CalorieStrategyFactory` returns the right strategy per
  category and MET math is correct.
- `errors.test.ts` — the `AppError` hierarchy maps to the right status codes.
- `auth.service.test.ts` — register/login against a mocked user repository,
  verifying JWT payload with `jsonwebtoken.verify`.
- `_smoke.test.ts` — sanity check for the runner itself.

```bash
npm test
# tests 25
# pass  25
# fail  0
```

## Frontend

The SPA lives in `client/` — React 18 + Vite 5 + TypeScript (strict). See
[`client/README.md`](client/README.md) for the frontend-specific setup
instructions.

In short:

```bash
cd client
npm install
npm run dev     # http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:5000`, so there's
no CORS setup needed during local development.

Pages: **Login**, **Register**, **Programs**, **Goals**, **Workouts**.
Auth is stored in `localStorage` and attached as `Authorization: Bearer
<token>` to every outgoing request; token validity is checked server-side.

## Deploying the backend to Vercel

The backend ships with a Vercel-ready serverless adapter:

- `api/index.ts` — wraps the Express app as a `(req, res)` handler. Uses the
  `Database` Singleton so the Mongo connection is reused across warm invocations.
- `vercel.json` — rewrites every path (`/(.*)` → `/api/index.ts`) so the
  Express router stays the single source of truth for URL mapping.

Required environment variables in the Vercel project settings:

- `MONGO_URI` — a reachable MongoDB connection string (Atlas recommended).
- `JWT_SECRET` — a long, random string.
- `JWT_EXPIRES_IN` — e.g. `7d`.
- `CORS_ORIGIN` — the deployed frontend origin, or `*` for a quick demo.
- `NODE_ENV` — `production`.

You don't need a custom build command; Vercel will pick up `@vercel/node` from
`vercel.json` and compile `api/index.ts` (which in turn pulls in `src/**`).
`npm run build` remains available locally for producing `dist/` via `tsc`.

## Diagrams

The `.md` diagrams at the root render with any Mermaid-aware viewer
(GitHub, VS Code Mermaid plugin, Typora, etc.):

- [`useCaseDiagram.md`](useCaseDiagram.md) — actors and high-level use cases.
- [`sequenceDiagram.md`](sequenceDiagram.md) — request flows for the key
  endpoints.
- [`classDiagram.md`](classDiagram.md) — domain classes and their
  relationships.
- [`erDiagram.md`](erDiagram.md) — MongoDB collections and references.

## Commit history

Commits are grouped by feature rather than by file. The notable milestones
on this branch:

1. `feat(frontend): add React + Vite + TypeScript client`
2. `test(backend): add built-in node:test suite for services and utilities`
3. `refactor(backend): wire clean architecture through all layers`
4. `refactor(backend): introduce clean architecture foundation`
5. `Update README and TODO with project details`
6. `Initial commit for Fitness Tracker backend`

## Disclaimer

Submitted for the SESD Project Milestone 1. The focus is on demonstrating
architectural patterns, OOP principles, secure API design, and consistent
commit hygiene rather than feature breadth.
