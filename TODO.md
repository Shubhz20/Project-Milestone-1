# Fix Plan - TODO List

## 1. tsconfig.json
- [ ] Add skipLibCheck: true
- [ ] Add resolveJsonModule: true
- [ ] Add moduleResolution: "node"

## 2. src/config/db.ts
- [ ] Add validation for MONGO_URI environment variable

## 3. src/models/User.ts
- [ ] Add select: false to password field for security

## 4. src/middlewares/auth.middleware.ts
- [ ] Handle "Bearer " prefix in token extraction

## 5. src/services/auth.service.ts
- [ ] Add JWT token expiration time

## 6. All repositories (user, subject, task, session)
- [ ] Make all methods async

## 7. src/services/session.service.ts
- [ ] Add end method to complete sessions with duration calculation

## 8. src/controllers/session.controller.ts
- [ ] Add end endpoint

## 9. src/routes/session.routes.ts
- [ ] Add end route

## 10. src/models/StudySession.ts
- [ ] Make userId and subjectId required

