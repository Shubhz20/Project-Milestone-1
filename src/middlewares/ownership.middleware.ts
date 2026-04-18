import { Response, NextFunction } from "express";
import { Model } from "mongoose";
import { AuthRequest } from "./auth.middleware";
import { ForbiddenError, NotFoundError } from "../errors/AppError";
import { asyncHandler } from "./asyncHandler";

/**
 * Factory that produces an ownership-guard middleware.
 *
 * Verifies that the document whose id is in `req.params[idParam]` exists AND
 * that its `userId` matches the authenticated user. Prevents horizontal
 * privilege escalation (User A deleting User B's program etc.).
 *
 * We attach the loaded document to `req.resource` so the controller can reuse
 * it without issuing a second query — saving a round trip and preserving the
 * single-responsibility principle of the middleware.
 */
export const requireOwnership = <T extends { userId: { toString(): string } }>(
  model: Model<any>,
  idParam: string = "id"
) =>
  asyncHandler(async (req: AuthRequest & { resource?: T }, _res: Response, next: NextFunction) => {
    const id = req.params[idParam];
    const doc = await model.findById(id);
    if (!doc) return next(new NotFoundError(`${model.modelName} not found`));
    if (doc.userId.toString() !== req.userId) {
      return next(new ForbiddenError("You do not have access to this resource"));
    }
    req.resource = doc as T;
    next();
  });
