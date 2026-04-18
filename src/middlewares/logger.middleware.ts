import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

/**
 * Minimal request logger. Skips test runs to keep test output clean.
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  if (env.NODE_ENV === "test") return next();
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    // eslint-disable-next-line no-console
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`);
  });
  next();
};
