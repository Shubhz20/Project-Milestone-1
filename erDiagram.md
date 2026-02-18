# ER Diagram — Fitness Tracker System

## Overview

This Entity-Relationship diagram represents the database schema for the Fitness Tracker System, a backend-focused application designed to help users manage their workout programs, fitness goals, and session logs securely.

The schema models user authentication, program creation, goal tracking, and workout session logging, while enforcing data isolation and structured backend architecture.

---

```mermaid
erDiagram
    USERS {
        ObjectId _id PK
        varchar name
        varchar email UK
        varchar password_hash
        float current_weight
        float height_cm
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    WORKOUT_PROGRAMS {
        ObjectId _id PK
        ObjectId user_id FK
        varchar name
        text description
        timestamp created_at
        timestamp updated_at
    }

    FITNESS_GOALS {
        ObjectId _id PK
        ObjectId user_id FK
        ObjectId program_id FK
        varchar title
        float target_value
        float current_value
        varchar unit
        boolean is_achieved
        timestamp created_at
        timestamp updated_at
    }

    WORKOUT_SESSIONS {
        ObjectId _id PK
        ObjectId user_id FK
        ObjectId program_id FK
        timestamp start_time
        timestamp end_time
        integer duration_minutes
        float calories_estimated
        timestamp created_at
    }

    AUTH_TOKENS {
        ObjectId _id PK
        ObjectId user_id FK
        varchar token
        timestamp created_at
        timestamp expires_at
    }

    %% ===== RELATIONSHIPS =====

    USERS ||--o{ WORKOUT_PROGRAMS : "creates"
    USERS ||--o{ FITNESS_GOALS : "tracks"
    USERS ||--o{ WORKOUT_SESSIONS : "performs"
    USERS ||--o{ AUTH_TOKENS : "has"

    WORKOUT_PROGRAMS ||--o{ FITNESS_GOALS : "defines"
    WORKOUT_PROGRAMS ||--o{ WORKOUT_SESSIONS : "logged in"
```

---

## Table Summary

| Table              | Description                                                  | Key Relationships           |
| ------------------ | ------------------------------------------------------------ | --------------------------- |
| `USERS`            | Stores all registered users and personal stats (weight, etc) | → Programs, Goals, Sessions |
| `WORKOUT_PROGRAMS` | Stores programs created by users (e.g., "Leg Day")           | ← User, → Goals, → Sessions |
| `FITNESS_GOALS`    | Stores specific fitness targets (e.g., "Squat 100kg")        | ← User, ← Program           |
| `WORKOUT_SESSIONS` | Stores logs of actual time spent working out                 | ← User, ← Program           |
| `AUTH_TOKENS`      | Stores JWT tokens for authentication                         | ← User                      |

---

## Key Indexes

| Table              | Index                   | Purpose                                     |
| ------------------ | ----------------------- | ------------------------------------------- |
| `USERS`            | `(email)`               | Fast login and authentication lookup        |
| `WORKOUT_PROGRAMS` | `(user_id)`             | Fetch programs belonging to a specific user |
| `FITNESS_GOALS`    | `(user_id, program_id)` | Efficient goal retrieval per program        |
| `FITNESS_GOALS`    | `(is_achieved)`         | Filter pending vs achieved goals            |
| `WORKOUT_SESSIONS` | `(user_id)`             | Fetch user workout history                  |
| `WORKOUT_SESSIONS` | `(program_id)`          | Fetch sessions for a specific program       |
