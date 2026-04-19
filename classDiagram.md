# Class Diagram — Fitness Tracker System

## Overview

This class diagram represents the domain models, service layer, repository layer, and supporting patterns of the Fitness Tracker System.
The design follows Clean Architecture principles (Controller → Service → Repository → Model) and applies core Object-Oriented Programming (OOP) principles together with four deliberate design patterns: **Singleton**, **Template Method**, **Strategy**, and **Factory**.

```mermaid
classDiagram
    direction TB

    %% ===== DOMAIN MODELS =====

    class User {
        -id: string
        -name: string
        -email: string
        -password: string
        -weight: number
        -height: number
        -age: number
        -gender: Gender
        -fitnessLevel: FitnessLevel
        -bio: string
        -weightHistory: WeightEntry[]
        -isActive: boolean
        -createdAt: Date
        -updatedAt: Date
        +register(): User
        +login(): string
        +updateProfile(patch): User
        +logWeight(kg: number): User
    }

    class WeightEntry {
        <<embedded>>
        -weightKg: number
        -recordedAt: Date
    }

    class WorkoutProgram {
        -id: string
        -userId: string
        -name: string
        -description: string
        -category: string
        -createdAt: Date
        -updatedAt: Date
        +create(): WorkoutProgram
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

    %% ===== SERVICE LAYER =====

    class AuthService {
        -users: UserRepository
        +register(name, email, password): User
        +login(email, password): string
        +validateToken(token): boolean
    }

    class ProgramService {
        -repo: ProgramRepository
        +createProgram(input): WorkoutProgram
        +createFromTemplate(userId, key): WorkoutProgram
        +getPrograms(userId): WorkoutProgram[]
        +deleteProgram(id, requestingUserId): void
    }

    class GoalService {
        -repo: GoalRepository
        +createGoal(data): FitnessGoal
        +markAchieved(goalId): FitnessGoal
        +getGoals(userId): FitnessGoal[]
        +deleteGoal(id): void
    }

    class WorkoutService {
        -workouts: WorkoutRepository
        -programs: ProgramRepository
        -users: UserRepository
        +startWorkout(userId, programId): WorkoutSession
        +endWorkout(workoutId): WorkoutSession
        +getWorkouts(userId): WorkoutSession[]
    }

    class ProfileService {
        -users: UserRepository
        -workouts: WorkoutRepository
        -goals: GoalRepository
        -programs: ProgramRepository
        +getDashboard(userId): ProfileDashboard
        +updateProfile(userId, patch): User
        +logWeight(userId, kg): User
    }

    class RecommendationService {
        +recommendFor(user, limit): ProgramRecommendation[]
        +catalog(): ProgramTemplate[]
        +goals(): string[]
        +categories(): string[]
    }

    %% ===== DESIGN-PATTERN INFRASTRUCTURE =====

    class Database {
        <<Singleton>>
        -instance: Database
        -connected: boolean
        +getInstance(): Database
        +connect(uri): void
        +disconnect(): void
        +isConnected(): boolean
    }

    class BaseRepository~T~ {
        <<abstract / Template Method>>
        #model: Model~T~
        -memoryStorage: Map
        #isConnected(): boolean
        +create(data): T
        +findById(id): T
        +findOne(filter): T
        +findMany(filter): T[]
        +updateById(id, patch): T
        +deleteById(id): boolean
        +count(filter): number
    }

    class UserRepository
    class ProgramRepository
    class GoalRepository
    class WorkoutRepository

    class CalorieStrategy {
        <<interface>>
        +name: string
        +estimate(ctx): number
    }

    class MetBasedStrategy {
        <<abstract>>
        #met: number
        +estimate(ctx): number
    }

    class StrengthStrategy
    class CardioStrategy
    class HiitStrategy
    class YogaStrategy
    class GeneralStrategy

    class CalorieStrategyFactory {
        <<Factory>>
        -registry: Map
        +for(category): CalorieStrategy
        +categories(): string[]
    }

    %% ===== RELATIONSHIPS =====

    User "1" *-- "*" WeightEntry : embeds
    User "1" --> "*" WorkoutProgram : creates
    User "1" --> "*" FitnessGoal : tracks
    User "1" --> "*" WorkoutSession : performs

    WorkoutProgram "1" --> "*" FitnessGoal : defines
    WorkoutProgram "1" --> "*" WorkoutSession : logged in

    AuthService --> UserRepository
    ProgramService --> ProgramRepository
    GoalService --> GoalRepository
    WorkoutService --> WorkoutRepository
    WorkoutService --> CalorieStrategyFactory : uses
    ProfileService --> UserRepository
    ProfileService --> WorkoutRepository
    ProfileService --> GoalRepository
    ProfileService --> ProgramRepository
    RecommendationService --> CalorieStrategyFactory : uses
    ProgramService --> RecommendationService : reads templates

    BaseRepository <|-- UserRepository
    BaseRepository <|-- ProgramRepository
    BaseRepository <|-- GoalRepository
    BaseRepository <|-- WorkoutRepository

    CalorieStrategy <|.. MetBasedStrategy
    MetBasedStrategy <|-- StrengthStrategy
    MetBasedStrategy <|-- CardioStrategy
    MetBasedStrategy <|-- HiitStrategy
    MetBasedStrategy <|-- YogaStrategy
    MetBasedStrategy <|-- GeneralStrategy
    CalorieStrategyFactory ..> CalorieStrategy : creates
```

---

## Design Patterns in the Class Diagram

| Pattern              | Where Applied                                                 | Purpose                                                                       |
| -------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Singleton**        | `Database`                                                    | Guarantees a single, process-wide MongoDB connection lifecycle.               |
| **Template Method**  | `BaseRepository<T>` (generic CRUD + Mongo/in-memory fallback) | Reuses a single CRUD skeleton across every concrete repository subclass.      |
| **Strategy**         | `CalorieStrategy` + `MetBasedStrategy` family                 | Varies the calorie-burn algorithm per workout category without conditionals. |
| **Factory**          | `CalorieStrategyFactory`                                      | Selects the correct `CalorieStrategy` for a program's category.              |
| **Repository**       | `UserRepository`, `ProgramRepository`, `GoalRepository`, `WorkoutRepository` | Abstracts persistence from services.                                          |
| **Service Layer**    | `AuthService`, `ProfileService`, `RecommendationService`, …   | Centralises business logic separate from HTTP concerns.                       |
| **Layered Architecture** | Controller → Service → Repository → Model                | Enforces separation of concerns across the whole stack.                       |

## OOP Principles Applied

| Principle                           | Application                                                                  |
| ----------------------------------- | ---------------------------------------------------------------------------- |
| **Encapsulation**                   | Models hide schema internals; services expose intent-named methods.          |
| **Abstraction**                     | `BaseRepository` and `CalorieStrategy` hide concrete implementations.        |
| **Inheritance**                     | Concrete repositories extend `BaseRepository`; concrete strategies extend `MetBasedStrategy`. |
| **Polymorphism**                    | `CalorieStrategyFactory.for(...)` returns any strategy through a common interface. |
| **Single Responsibility Principle** | One class, one reason to change — e.g. `RecommendationService` only ranks.   |
| **Open/Closed Principle**           | Add a new workout category by writing a new `Strategy` + registering it.     |
| **Separation of Concerns**          | Controllers parse HTTP, services decide, repositories persist.               |
