# Sequence Diagram — Fitness Tracker System

## Main Flow: User Authentication → Program Creation → Goal Creation → Workout Session

This sequence diagram illustrates the complete lifecycle of a user interacting with the Fitness Tracker System — from registering and logging in, to defining workout programs and fitness goals, and finally tracking a live workout session.

```mermaid

sequenceDiagram
    actor U as User
    participant FE as Frontend (Client Application)
    participant API as Backend API (Express Server)
    participant Auth as Auth Service
    participant ProgS as Program Service
    participant GoalS as Goal Service
    participant WorkS as Workout Service
    participant Repo as Repository Layer
    participant DB as MongoDB Database

    Note over U, DB: Phase 1 — User Registration and Authentication

    U ->> FE: Register Account
    FE ->> API: POST /api/auth/register
    API ->> Auth: register(userData)
    Auth ->> Repo: saveUser(userData)
    Repo ->> DB: INSERT user document
    DB -->> Repo: User created
    Repo -->> Auth: User saved
    Auth -->> API: Registration success
    API -->> FE: 201 Created
    FE -->> U: Account registered successfully

    U ->> FE: Login
    FE ->> API: POST /api/auth/login
    API ->> Auth: validateUser(credentials)
    Auth ->> Repo: findUserByEmail(email)
    Repo ->> DB: SELECT user document
    DB -->> Repo: User found
    Repo -->> Auth: Return user data
    Auth ->> Auth: Generate JWT Token
    Auth -->> API: JWT token
    API -->> FE: Authentication success
    FE -->> U: Login successful

    Note over U, DB: Phase 2 — Workout Program Management

    U ->> FE: Create Workout Program (e.g., "Strength Training")
    FE ->> API: POST /api/programs (JWT)
    API ->> Auth: Validate JWT
    Auth -->> API: Token valid
    API ->> ProgS: createProgram(programData)
    ProgS ->> Repo: saveProgram(programData)
    Repo ->> DB: INSERT program document
    DB -->> Repo: Program created
    Repo -->> ProgS: Program saved
    ProgS -->> API: Success
    API -->> FE: 201 Created
    FE -->> U: Program created successfully

    U ->> FE: View Programs
    FE ->> API: GET /api/programs (JWT)
    API ->> Auth: Validate JWT
    Auth -->> API: Token valid
    API ->> ProgS: getPrograms(userId)
    ProgS ->> Repo: findProgramsByUser(userId)
    Repo ->> DB: SELECT program documents
    DB -->> Repo: Program list
    Repo -->> ProgS: Return programs
    ProgS -->> API: Program list
    API -->> FE: Programs retrieved
    FE -->> U: Display workout programs

    Note over U, DB: Phase 3 — Goal Setting

    U ->> FE: Set Fitness Goal (e.g., "Deadlift 150kg")
    FE ->> API: POST /api/goals (JWT)
    API ->> Auth: Validate JWT
    Auth -->> API: Token valid
    API ->> GoalS: createGoal(goalData)
    GoalS ->> Repo: saveGoal(goalData)
    Repo ->> DB: INSERT goal document
    DB -->> Repo: Goal created
    Repo -->> GoalS: Goal saved
    GoalS -->> API: Success
    API -->> FE: 201 Created
    FE -->> U: Goal set successfully

    U ->> FE: Mark Goal as Achieved
    FE ->> API: PUT /api/goals/{id}/achieve (JWT)
    API ->> Auth: Validate JWT
    Auth -->> API: Token valid
    API ->> GoalS: updateGoalStatus(goalId)
    GoalS ->> Repo: updateGoal(goalId)
    Repo ->> DB: UPDATE goal document
    DB -->> Repo: Goal updated
    Repo -->> GoalS: Success
    GoalS -->> API: Success
    API -->> FE: Goal updated
    FE -->> U: Goal marked as achieved!

    Note over U, DB: Phase 4 — Workout Session Logging

    U ->> FE: Start Workout
    FE ->> API: POST /api/workouts/start (JWT)
    API ->> Auth: Validate JWT
    Auth -->> API: Token valid
    API ->> WorkS: startWorkout(workoutData)
    WorkS ->> Repo: saveWorkout(workoutData)
    Repo ->> DB: INSERT workout document
    DB -->> Repo: Workout started
    Repo -->> WorkS: Success
    WorkS -->> API: Workout started
    API -->> FE: 201 Created
    FE -->> U: Timer started

    U ->> FE: End Workout
    FE ->> API: PUT /api/workouts/end (JWT)
    API ->> Auth: Validate JWT
    Auth -->> API: Token valid
    API ->> WorkS: endWorkout(workoutId)
    WorkS ->> Repo: updateWorkout(workoutId)
    Repo ->> DB: UPDATE workout document (endTime, duration)
    DB -->> Repo: Workout updated
    Repo -->> WorkS: Success
    WorkS -->> API: Workout summary
    API -->> FE: Workout completed
    FE -->> U: Workout logged successfully
```

---

## Flow Summary

| Phase                     | Description                                                                     | Key Patterns Used           |
| ------------------------- | ------------------------------------------------------------------------------- | --------------------------- |
| **1. Authentication**     | User registers and logs in with JWT authentication and secure password storage. | Authentication Pattern, JWT |
| **2. Program Management** | User creates and views workout programs securely.                               | Layered Architecture        |
| **3. Goal Setting**       | User creates, updates, and completes fitness goals linked to programs.          | Service Layer Pattern       |
| **4. Workout Logging**    | User starts and ends workout sessions with duration tracking and persistence.   | Repository Pattern          |
| **5. Data Persistence**   | All health data is securely stored and retrieved from MongoDB.                  | Repository Pattern          |
