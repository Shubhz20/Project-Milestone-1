import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Wraps an async route handler so that thrown errors propagate to Express's
 * error-handling middleware instead of being silently swallowed.
 */
export const asyncHandler =
  <Req extends Request = Request>(
    fn: (req: Req, res: Response, next: NextFunction) => Promise<unknown>
  ): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req as Req, res, next)).catch(next);
  };
