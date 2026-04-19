# Fitness Tracker — Project Idea & Design Rationale

## 1. Motivation Behind the Project

Most fitness applications focus heavily on flashy UI/UX and gamification. While these features are engaging, they often mask a lack of robust backend engineering. Many fail to properly structure data relationships, secure user privacy, or provide a scalable architecture for long-term data tracking.

Real-world health and fitness systems must address critical challenges such as:

- **Secure Handling of Personal Health Data**
- **Strict Data Privacy and Access Control**
- **Complex Relationships between Plans, Goals, and Activity Logs**
- **Auditable Tracking of Consistency and Progress**
- **Personalised Guidance** that goes beyond a raw data log
- **Scalable Architecture for Growing Data Sets**

The Fitness Tracker System is designed to emphasize backend system design, clean architecture, and structured data modeling, ensuring that the foundation of the application is as strong as the athletes using it.

## 2. Core Idea

The Fitness Tracker System is a backend-first application that empowers users to take ownership of their fitness journey through structured entities: **Workout Programs**, **Fitness Goals**, and **Workout Sessions** — all anchored to a rich **User Profile** (age, weight, height, fitness level, weight history) that also powers a personal **Dashboard** and a **Recommendation Engine**.

Instead of a flat list of exercises, the system models fitness as a structured lifecycle:

- Users own **Workout Programs** (e.g., "Marathon Training", "Strength Building"), optionally adopted from a curated **Template Catalog**.
- Programs contain **Fitness Goals** (e.g., "Run 10km", "Bench Press 100kg").
- **Workout Sessions** represent the actual time and effort spent training, with calories computed per category via a **Strategy/Factory** pair.
- The **Profile Dashboard** surfaces BMI, streaks, weekly/monthly windows, and goal achievement rate as derived metrics.
- The **Recommendation Engine** ranks curated templates for each user using a transparent, explainable scoring model.

This hierarchical approach allows for meaningful tracking of _planned_ vs. _actual_ effort — and converts that data into _insight_.

## 3. What Makes the Fitness Tracker System Different

### 3.1 Backend-Focused Architecture

The project prioritizes robust backend engineering over frontend gloss:

- **Layered Architecture**: Clear separation of concerns (Controller → Service → Repository → Model).
- **Security First**: JWT-based authentication with bcrypt password hashing.
- **Referential Integrity**: Structured relationships and ownership middleware that prevents cross-user access.
- **Design Patterns where they matter**: Singleton for DB, Template Method for the generic repository, Strategy + Factory for pluggable calorie algorithms.

### 3.2 Explicit Data Ownership

Health data is sensitive. The system enforces strict ownership:

- Users have exclusive access to their measurement history, programs, and logs.
- Middleware ensures that `Program A` belonging to `User 1` cannot be modified by `User 2`.

### 3.3 Fitness as a Workflow

The system doesn't just log data; it models the workflow of improvement:

- **Plan**: Define a _Workout Program_ (custom or from a curated template).
- **Target**: Set specific _Fitness Goals_ within that program.
- **Execute**: Record _Workout Sessions_ — duration and calories computed by the active `CalorieStrategy`.
- **Review**: View a Profile Dashboard with BMI, streaks, and goal achievement rate.
- **Improve**: Receive ranked recommendations tailored to your current profile.

### 3.4 Resilient Deployment

The app is designed to remain functional even when the MongoDB cluster is unreachable:

- Mongoose is configured with fast-fail timeouts and `bufferCommands=false`.
- `BaseRepository` transparently falls back to an in-memory store when `mongoose.connection.readyState !== 1`, so the API continues to work in serverless/preview environments without an Atlas credential.

## 4. Design Principles

### 4.1 Separation of Concerns

- **Controllers**: Handle HTTP requests and input validation.
- **Services**: Contain business logic (e.g., scoring a recommendation, computing BMI).
- **Repositories**: Abstract database operations behind a generic `BaseRepository<T>`.
- **Models**: Define the schema, validation rules, and embedded subdocuments.

### 4.2 Explicit Data Relationships

- **User 1 : N Programs**
- **Program 1 : N Goals**
- **Program 1 : N Sessions**
- **User 1 : N WeightEntry** (embedded subdocument)
- Every session acts towards a larger program, and every program has an owning user.

### 4.3 Secure Authentication

- Stateless authentication using JSON Web Tokens (JWT).
- Password hashing using bcrypt, `select: false` on the password field.
- Protected routes guarded by `authMiddleware` + `ownershipMiddleware`.

## 5. Scope & Key Features

### 5.1 User Features

- **Secure Registration**: Sign up with email + password.
- **Authentication**: Login to receive a secure JWT.
- **Profile Management**: Update name, age, gender, height, weight, fitness level, and bio.
- **Weight Logging**: Append a dated entry to `weightHistory` for trend analytics.
- **Personal Dashboard**: BMI + BMI category, current/longest streak, workouts this week/month, goal achievement rate.

### 5.2 Program Management

- **Create Programs**: Define high-level focus areas (e.g., Cardio, Yoga).
- **Adopt Templates**: Materialise a curated template (e.g., *Couch-to-5k*, *HIIT Fat Burner*) into a real program with one API call.
- **View / Delete Programs**.

### 5.3 Goal Tracking

- **Set Goals**: Create targets linked to a program (e.g., "Do 50 pushups").
- **Track Status**: Mark goals "Pending" or "Achieved".
- **Update / Delete Goals**.

### 5.4 Session Logging

- **Start Workout**: Begin a timer for a specific program.
- **End Workout**: Stop the timer, compute duration and calories (via `CalorieStrategyFactory`), and persist the session.
- **History**: View a log of all past sessions.

### 5.5 Personalised Recommendations

- **Rank Templates**: `RecommendationService` produces a 0–100 score per template over a catalog of 7 curated programs.
- **Transparent Rationale**: Every score includes human-readable "why" sentences (fitness-level match, BMI fit, primary-goal alignment, age bracket).
- **Calorie Preview**: Each recommendation includes an estimated calories-per-session number, computed using the same `CalorieStrategyFactory` the backend uses for live sessions — numbers the user sees here will match what they earn in-session.

### 5.6 System Capabilities

- **RESTful API**: Well-defined endpoints for Client-Server communication.
- **Data Persistence**: Reliable storage using MongoDB; in-memory fallback when the DB is unreachable.
- **Validation**: Strict input validation on every mutating endpoint.
- **Serverless-ready**: `api/index.ts` races the DB connect against a 3-second deadline so cold starts never hang.

## 6. Design Patterns Used

| Pattern            | Where                                  | Why                                                                                      |
| ------------------ | -------------------------------------- | ---------------------------------------------------------------------------------------- |
| **Singleton**      | `Database` (src/config/db.ts)          | Guarantees a single mongoose connection per process.                                     |
| **Template Method**| `BaseRepository<T>`                    | Shared CRUD skeleton across every repo, with a uniform Mongo/in-memory fallback.         |
| **Strategy**       | `CalorieStrategy` family               | Different MET-based calorie algorithms per workout category (strength/cardio/HIIT/yoga/general). |
| **Factory**        | `CalorieStrategyFactory`               | Resolves a program's category to the correct `CalorieStrategy` at runtime.               |
| **Repository**     | `UserRepository`, `ProgramRepository`, … | Isolates persistence from business logic.                                                |
| **Service Layer**  | `AuthService`, `ProfileService`, `RecommendationService`, … | Centralises business logic away from HTTP.                                               |

## 7. Why a Fitness Tracker?

Fitness tracking replicates the complexity of many enterprise tracking systems (like logistics or project management) but in a domain that is universally understood. It requires:

- **Relationships** (User → Plan → Goal)
- **Time-series data** (Sessions, weight history)
- **State management** (Goal status, session lifecycle)
- **Privacy** (Personal health data)
- **Derived analytics** (BMI, streaks, rolling windows)
- **Personalisation** (Recommendation scoring)

This makes it a well-rounded portfolio piece to demonstrate backend engineering proficiency.

## 8. Summary

The Fitness Tracker System serves as a portfolio-grade example of a backend application. It looks beyond the "To-Do List" tutorial standard and implements a system capable of handling real-world data relationships, security constraints, derived analytics, personalised recommendations, and architectural patterns — while remaining resilient under real-world deployment conditions.
