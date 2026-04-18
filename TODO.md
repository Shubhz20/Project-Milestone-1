# TODO — Milestone 1

All items tracked below have been completed. Kept here as a record of the
fix plan that kicked off the refactor.

## 1. tsconfig.json

- [x] Add `skipLibCheck: true`
- [x] Add `resolveJsonModule: true`
- [x] Add `moduleResolution: "node"`
- [x] Exclude `client/` and `scripts/` from the backend build

## 2. src/config/db.ts

- [x] Add validation for `MONGO_URI` environment variable
- [x] Refactor into a `Database` Singleton with explicit `connect` / `disconnect`

## 3. src/models/User.ts

- [x] Add `select: false` to the password field
- [x] Strip password / `__v` from JSON serialisation

## 4. src/middlewares/auth.middleware.ts

- [x] Handle `Bearer ` prefix in token extraction
- [x] Surface auth errors through the `AppError` hierarchy

## 5. src/services/auth.service.ts

- [x] Add JWT token expiration (`JWT_EXPIRES_IN`, default `7d`)
- [x] Hash passwords with bcrypt cost 10

## 6. Repositories (User, Program, Goal, Workout)

- [x] All methods async with proper return types
- [x] Extracted shared CRUD into `BaseRepository<T>` (Template Method)

## 7. src/services/workout.service.ts

- [x] Add `end` method that computes duration
- [x] Plug in `CalorieStrategyFactory` for category-aware calorie estimation
- [x] Reject a second active session with a `ConflictError`

## 8. src/controllers/workout.controller.ts

- [x] Add `endWorkout` endpoint

## 9. src/routes/workout.routes.ts

- [x] Add `PATCH /:id/end` route (and keep `PUT /end/:id` as a fallback)

## 10. src/models/WorkoutSession.ts

- [x] Make `userId` and `programId` required
- [x] Pre-save guard: `endTime` must be strictly after `startTime`

## Additional work completed

- [x] Centralised `AppError` hierarchy + global error handler
- [x] Dependency-free schema validator (`src/validators/schema.ts`) and
      request-level `validateRequest(schema, source)` middleware
- [x] `requireOwnership<T>(model)` middleware mounted on every mutation
- [x] Inline CORS middleware (the `cors` package was unavailable in the sandbox)
- [x] `node:test` suite with 25 passing tests (`npm test`)
- [x] React + Vite + TypeScript SPA in `client/`
- [x] Idempotent seed script (`npm run seed`) with a demo user + programs
- [x] README covers backend + frontend + test workflow end-to-end
