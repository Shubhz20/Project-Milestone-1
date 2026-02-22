# 🏋️‍♂️ Fitness Tracker Backend — Secure & Scalable Fitness Management

## 📌 Project Overview

The **Fitness Tracker System** is a robust, backend-first application designed to help users track their fitness journey with precision. Unlike simple "to-do" apps, this system models fitness as a structured lifecycle: defining long-term **Programs**, setting specific **Goals**, and logging actual **Workout Sessions**.

Built with a focus on **Clean Architecture**, the system ensures proper data isolation, secure authentication, and a scalable foundation for health data tracking.

---

## 🚀 Key Features

- **Secure Authentication**: Stateless JWT-based registration and login system.
- **Workout Programs**: Organize fitness into high-level categories (e.g., Strength, Cardio, Yoga).
- **Goal Tracking**: Define measurable targets within programs (e.g., "Achieve 50 pushups").
- **Session Logging**: Track the duration and effort of actual workout sessions.
- **Data Privacy**: Strict ownership middleware restricts data access to authorized users only.
- **Layered Design**: Modular code structure (Controller → Service → Repository → Model).

---

## 🛠 Tech Stack

| Technology     | Description                                         |
| :------------- | :-------------------------------------------------- |
| **Node.js**    | JavaScript runtime environment                      |
| **TypeScript** | Strongly typed programming language                 |
| **Express.js** | Fast and minimalist web framework                   |
| **MongoDB**    | NoSQL document database                             |
| **Mongoose**   | Elegant MongoDB object modeling for Node.js         |
| **JWT**        | Secure industry-standard token-based authentication |
| **bcrypt**     | Advanced password hashing and security              |

---

## 🏗 Backend Architecture

The system follows the **Layered Architecture** pattern to ensure separation of concerns and maintainability:

1. **Controllers**: Handle HTTP requests, parse input, and return standardized responses.
2. **Services**: Contain the core business logic and coordinate between components.
3. **Repositories**: Abstract database operations, providing a clean interface for data persistence.
4. **Models**: Define the schema, types, and validation rules for MongoDB entities.
5. **Middlewares**: Enforce security policies and authentication checks.

---

## 📂 Project Structure

```bash
src/
├── config/         # App configuration (DB, Env)
├── controllers/    # Request handlers
├── middlewares/    # Custom middlewares (Auth)
├── models/         # Mongoose schemas
├── repositories/   # Data access layer
├── routes/         # API endpoint definitions
├── services/       # Business logic layer
├── app.ts          # Express application setup
└── server.ts       # Entry point
```

---

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Ronxak/SESD-Project-Milestone-1.git
   cd SESD-Project-Milestone-1
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Environment Variables:
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_super_secret_key
   ```

### Running the Application

```bash
# Development mode
npm run dev
```

---

## 📖 API Documentation (Summary)

### Authentication

- `POST /api/auth/register` — Create a new account
- `POST /api/auth/login` — Sign in and receive JWT

### Workout Programs

- `POST /api/programs` — Create a new program
- `GET /api/programs` — Retrieve user's programs
- `DELETE /api/programs/:id` — Remove a program

### Goals

- `POST /api/goals` — Set a fitness goal
- `GET /api/goals` — View all goals
- `PATCH /api/goals/:id` — Update goal status

### Workout Sessions

- `POST /api/workouts` — Log a training session
- `GET /api/workouts` — View workout history

---

## 🛡 Disclaimer

This project is developed as part of the SESD Project Milestone-1. It focuses on demonstrating backend engineering proficiency, including architectural patterns, secure API design, and structured data modeling.
