import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../errors/AppError";

test("AppError: defaults to 500 / INTERNAL_ERROR", () => {
  const err = new AppError("boom");
  assert.equal(err.status, 500);
  assert.equal(err.code, "INTERNAL_ERROR");
  assert.equal(err.message, "boom");
});

test("error subclasses carry correct status and code", () => {
  const cases: Array<[AppError, number, string]> = [
    [new BadRequestError(), 400, "BAD_REQUEST"],
    [new UnauthorizedError(), 401, "UNAUTHORIZED"],
    [new ForbiddenError(), 403, "FORBIDDEN"],
    [new NotFoundError(), 404, "NOT_FOUND"],
    [new ConflictError(), 409, "CONFLICT"],
    [new ValidationError(), 422, "VALIDATION_ERROR"],
  ];
  for (const [err, status, code] of cases) {
    assert.equal(err.status, status);
    assert.equal(err.code, code);
    assert.ok(err instanceof AppError);
    assert.ok(err instanceof Error);
  }
});

test("ValidationError carries details payload", () => {
  const err = new ValidationError("bad", [{ field: "email", message: "is required" }]);
  assert.deepEqual(err.details, [{ field: "email", message: "is required" }]);
});
