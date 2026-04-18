import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { env } from "../config/env";
import { UnauthorizedError } from "../errors/AppError";

export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Stateless JWT authentication middleware.
 *
 * Accepts either a raw token or `Authorization: Bearer <token>`. On success,
 * `req.userId` is populated with the authenticated user's ID so downstream
 * middleware (ownership) and controllers can rely on it.
 */
export const authMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return next(new UnauthorizedError("Missing Authorization header"));

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
};
