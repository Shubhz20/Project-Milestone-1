# Class Diagram — Fitness Tracker System

## Overview

This class diagram represents the major domain models, services, and repository layers of the Fitness Tracker System.
The design follows Clean Architecture principles, ensuring separation between domain models, service layer, and repository layer, and applies core Object-Oriented Programming (OOP) principles.

```mermaid
classDiagram
    direction TB

    %% ===== DOMAIN MODELS =====

    class User {
        -id: string
        -name: string
        -email: string
        -passwordHash: string
        -weight: number
        -height: number
        -createdAt: Date
        -updatedAt: Date
        +register(): User
        +login(): string
        +updateProfile(weight: number): void
    }

    class WorkoutProgram {
        -id: string
        -userId: string
        -name: string
        -description: string
        -createdAt: Date
        -updatedAt: Date
        +create(): WorkoutProgram
        +update(details): void
        +delete(): void
    }

    class FitnessGoal {
        -id: string
        -userId: string
        -programId: string
        -title: string
        -targetValue: number
        -currentValue: number
        -unit: string
        -isAchieved: boolean
        -createdAt: Date
        -updatedAt: Date
        +create(): FitnessGoal
        +updateProgress(value: number): void
        +markAchieved(): void
        +delete(): void
    }

    class WorkoutSession {
        -id: string
        -userId: string
        -programId: string
        -startTime: Date
        -endTime: Date
        -durationMinutes: number
        -caloriesBurned: number
        -createdAt: Date
        +start(): WorkoutSession
        +end(): void
        +calculateDuration(): number
    }

    class AuthToken {
        -id: string
        -userId: string
        -token: string
        -createdAt: Date
        -expiresAt: Date
        +generate(): string
        +validate(): boolean
    }

    %% ===== SERVICE LAYER =====

    class AuthService {
        -userRepo: IUserRepository
        +register(name: string, email: string, password: string): User
        +login(email: string, password: string): string
        +validateToken(token: string): boolean
    }

    class ProgramService {
        -programRepo: IProgramRepository
        +createProgram(userId: string, name: string): WorkoutProgram
        +getPrograms(userId: string): WorkoutProgram[]
        +deleteProgram(programId: string): void
    }

    class GoalService {
        -goalRepo: IGoalRepository
        +createGoal(data): FitnessGoal
        +updateGoal(goalId: string, data): FitnessGoal
        +markAchieved(goalId: string): void
        +getGoals(userId: string): FitnessGoal[]
    }

    class WorkoutService {
        -workoutRepo: IWorkoutRepository
        +startWorkout(userId: string, programId: string): WorkoutSession
        +endWorkout(workoutId: string): void
        +getWorkouts(userId: string): WorkoutSession[]
    }

    %% ===== REPOSITORY INTERFACES =====

    class IUserRepository {
        <<interface>>
        +findById(id: string): User
        +findByEmail(email: string): User
        +save(user: User): User
        +update(user: User): void
    }

    class IProgramRepository {
        <<interface>>
        +findById(id: string): WorkoutProgram
        +findByUserId(userId: string): WorkoutProgram[]
        +save(program: WorkoutProgram): WorkoutProgram
        +delete(id: string): void
    }

    class IGoalRepository {
        <<interface>>
        +findById(id: string): FitnessGoal
        +findByUserId(userId: string): FitnessGoal[]
        +save(goal: FitnessGoal): FitnessGoal
        +update(goal: FitnessGoal): void
        +delete(id: string): void
    }

    class IWorkoutRepository {
        <<interface>>
        +findById(id: string): WorkoutSession
        +findByUserId(userId: string): WorkoutSession[]
        +save(session: WorkoutSession): WorkoutSession
        +update(session: WorkoutSession): void
    }

    class IAuthTokenRepository {
        <<interface>>
        +save(token: AuthToken): AuthToken
        +findByUserId(userId: string): AuthToken[]
        +delete(token: string): void
    }

    %% ===== RELATIONSHIPS =====

    User "1" --> "*" WorkoutProgram : creates
    User "1" --> "*" FitnessGoal : tracks
    User "1" --> "*" WorkoutSession : performs
    User "1" --> "*" AuthToken : has

    WorkoutProgram "1" --> "*" FitnessGoal : contains
    WorkoutProgram "1" --> "*" WorkoutSession : logged in

    AuthService --> IUserRepository
    ProgramService --> IProgramRepository
    GoalService --> IGoalRepository
    WorkoutService --> IWorkoutRepository
```

---

## Design Patterns in the Class Diagram

| Pattern                    | Where Applied                            | Purpose                                       |
| -------------------------- | ---------------------------------------- | --------------------------------------------- |
| **Repository Pattern**     | IUserRepository, IGoalRepository, etc.   | Separates database access from business logic |
| **Service Layer Pattern**  | AuthService, GoalService, ProgramService | Centralizes business logic                    |
| **Layered Architecture**   | Service → Repository → Model             | Improves scalability and maintainability      |
| **DTO / Model Separation** | Domain models vs Service logic           | Improves modular design                       |

## OOP Principles Applied

| Principle                           | Application                                           |
| ----------------------------------- | ----------------------------------------------------- |
| **Encapsulation**                   | Models hide internal data and expose methods          |
| **Abstraction**                     | Repository interfaces hide MongoDB implementation     |
| **Modularity**                      | Separate services for auth, goals, programs, workouts |
| **Single Responsibility Principle** | Each class has one clear responsibility               |
| **Separation of Concerns**          | Controllers, services, repositories separated         |
