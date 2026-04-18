import { Request, Response, NextFunction } from "express";
import { Schema, validate } from "../validators/schema";
import { ValidationError } from "../errors/AppError";

type Source = "body" | "query" | "params";

/**
 * Returns an Express middleware that validates a specific request section
 * (`body`, `query`, or `params`) against the supplied schema. On success it
 * replaces the section with the coerced, whitelisted object so downstream
 * handlers never have to re-parse or re-check types.
 */
export const validateRequest =
  (schema: Schema, source: Source = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    const data = (req as any)[source] ?? {};
    const result = validate(schema, data);
    if (!result.ok) {
      return next(new ValidationError("Invalid request payload", result.errors));
    }
    (req as any)[source] = result.value;
    next();
  };
