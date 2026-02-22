# Fix Plan - TODO List

## 1. tsconfig.json

- [ ] Add `skipLibCheck: true`
- [ ] Add `resolveJsonModule: true`
- [ ] Add `moduleResolution: "node"`

## 2. src/config/db.ts

- [ ] Add validation for `MONGO_URI` environment variable

## 3. src/models/User.ts

- [ ] Add `select: false` to password field for security

## 4. src/middlewares/auth.middleware.ts

- [ ] Handle "Bearer " prefix in token extraction

## 5. src/services/auth.service.ts

- [ ] Add JWT token expiration time

## 6. All repositories (User, Program, Goal, Workout)

- [ ] Make all methods async
- [ ] Add proper return types

## 7. src/services/workout.service.ts

- [ ] Add `end` method to complete sessions with duration calculation
- [ ] Implement calorie estimation logic

## 8. src/controllers/workout.controller.ts

- [ ] Add `endWorkout` endpoint

## 9. src/routes/workout.routes.ts

- [ ] Add `PATCH /end/:id` route

## 10. src/models/WorkoutSession.ts

- [ ] Make `userId` and `programId` required
- [ ] Add validation for `start_time` and `end_time`
