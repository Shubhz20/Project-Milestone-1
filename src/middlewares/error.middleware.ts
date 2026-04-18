import { Request, Response, NextFunction } from "express";
import { AppError, NotFoundError } from "../errors/AppError";

/**
 * 404 handler — mounted after all routes.
 */
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
};

/**
 * Central error handler — maps AppError subclasses to HTTP responses, hides
 * internal details in production, and preserves a consistent error envelope
 * for the frontend.
 */
export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Fallback for unexpected errors — never leak stack traces to clients.
  // eslint-disable-next-line no-console
  console.error("[error]", err);
  return res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    },
  });
};
