import express from "express";

import authRoutes from "./routes/auth.routes";
import programRoutes from "./routes/program.routes";
import goalRoutes from "./routes/goal.routes";
import workoutRoutes from "./routes/workout.routes";

import { corsMiddleware } from "./middlewares/cors.middleware";
import { requestLogger } from "./middlewares/logger.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

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

  app.get("/", (_req, res) => {
    res.json({
      message: "Fitness Tracker API is running",
      version: "1.0.0",
      docs: "See README.md for API documentation",
      links: {
        health: "/api/health",
        auth: "/api/auth",
      },
    });
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/programs", programRoutes);
  app.use("/api/goals", goalRoutes);
  app.use("/api/workouts", workoutRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

const app = createApp();
export default app;
