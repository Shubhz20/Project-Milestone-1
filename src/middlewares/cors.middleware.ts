import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";

/**
 * A deliberately-tiny CORS implementation that covers the needs of this
 * frontend (single origin, JSON API, Authorization header).
 *
 * Pulling in the full `cors` package is overkill when our requirements are
 * this narrow — and the resulting middleware is auditable at a glance.
 */
export const corsMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const origin = env.CORS_ORIGIN;
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  next();
};
