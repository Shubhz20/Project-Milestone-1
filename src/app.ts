import express from "express";
import mongoose from "mongoose";

import authRoutes from "./routes/auth.routes";
import programRoutes from "./routes/program.routes";
import goalRoutes from "./routes/goal.routes";
import workoutRoutes from "./routes/workout.routes";
import profileRoutes from "./routes/profile.routes";

import { corsMiddleware } from "./middlewares/cors.middleware";
import { requestLogger } from "./middlewares/logger.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { env } from "./config/env";

/** Human-readable mongoose connection state. */
const dbStatus = (): "connected" | "connecting" | "disconnected" | "memory-fallback" => {
  switch (mongoose.connection.readyState) {
    case 1:
      return "connected";
    case 2:
      return "connecting";
    default:
      return env.MONGO_URI ? "disconnected" : "memory-fallback";
  }
};

/**
 * Application factory — builds a configured Express app. Factoring this out
 * of `server.ts` lets the test suite spin up an identical app against an
 * in-memory MongoDB without booting the HTTP listener.
 */
export const createApp = () => {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json({ limit: "100kb" }));
  app.use(requestLogger);

  // Backend root — when the React SPA is served by Vercel rewrites, this path
  // is only reached if somebody hits the API host directly. Return a small
  // JSON that points at the health probe instead of a full HTML landing page.
  app.get("/", (_req, res) => {
    res.json({
      name: "Fitness Tracker API",
      version: "1.0.0",
      status: "running",
      links: {
        health: "/api/health",
        docs: "See README.md",
      },
    });
  });

  app.get("/api/health", (_req, res) => {
    const db = dbStatus();
    const warnings: string[] = [];
    if (db === "memory-fallback") {
      warnings.push(
        "MONGO_URI is not set — running in in-memory mode. Data will NOT persist between serverless invocations, and signup/login may fail intermittently when requests land on different replicas. Set MONGO_URI in your Vercel project settings to fix."
      );
    } else if (db === "disconnected") {
      warnings.push(
        "MONGO_URI is set but MongoDB is not reachable (check Atlas IP allowlist — allow 0.0.0.0/0 for Vercel)."
      );
    }
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      db,
      warnings,
    });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/profile", profileRoutes);
  app.use("/api/programs", programRoutes);
  app.use("/api/goals", goalRoutes);
  app.use("/api/workouts", workoutRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

const app = createApp();
export default app;
