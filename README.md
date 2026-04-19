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

### Mandatory Vercel Configuration

1. **Framework Preset**: In the Vercel project settings, set the Framework Preset to **"Other"**. This allows `vercel.json` to control the build process.
2. **Environment Variables**: Set the following in **Settings → Environment Variables**:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A long, random security string.
   - `JWT_EXPIRES_IN`: `7d`
   - `CORS_ORIGIN`: Your deployment URL (or `*`).
   - `NODE_ENV`: `production`.

### Build & Routing
- `api/index.ts` — wraps the Express app with an in-memory fallback.
- `vercel.json` — handles the full-stack routing and build steps.

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
