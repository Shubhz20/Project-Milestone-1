import { test } from "node:test";
import assert from "node:assert/strict";
import { validate, Schema } from "../validators/schema";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import { createProgramSchema } from "../validators/program.validator";
import { createGoalSchema } from "../validators/goal.validator";

test("validate: rejects missing required fields", () => {
  const result = validate(registerSchema, { email: "a@b.co" });
  assert.equal(result.ok, false);
  const fields = (result.errors ?? []).map((e) => e.field);
  assert.deepEqual(fields.sort(), ["name", "password"]);
});

test("validate: enforces min length", () => {
  const result = validate(registerSchema, { name: "A", email: "a@b.co", password: "short" });
  assert.equal(result.ok, false);
  const fields = (result.errors ?? []).map((e) => e.field);
  assert.ok(fields.includes("name"));
  assert.ok(fields.includes("password"));
});

test("validate: coerces strings and returns clean object", () => {
  const result = validate(loginSchema, { email: "  user@example.com  ", password: "pw" });
  assert.equal(result.ok, true);
  assert.deepEqual(result.value, { email: "user@example.com", password: "pw" });
});

test("validate: enum field rejects unknown values", () => {
  const result = validate(createProgramSchema, { name: "Cardio", category: "flying" });
  assert.equal(result.ok, false);
  const fields = (result.errors ?? []).map((e) => e.field);
  assert.ok(fields.includes("category"));
});

test("validate: applies defaults when field omitted", () => {
  const result = validate(createProgramSchema, { name: "My Program" });
  assert.equal(result.ok, true);
  assert.equal((result.value as any).category, "general");
});

test("validate: objectId must look like a Mongo ObjectId", () => {
  const result = validate(createGoalSchema, {
    programId: "not-a-real-id",
    title: "Run 5k",
    targetValue: 5,
    unit: "km",
  });
  assert.equal(result.ok, false);
});

test("validate: accepts valid objectId and numeric coercion", () => {
  const result = validate(createGoalSchema, {
    programId: "507f1f77bcf86cd799439011",
    title: "Run 5k",
    targetValue: "5", // passed as string; should coerce
    unit: "km",
  });
  assert.equal(result.ok, true);
  assert.equal((result.value as any).targetValue, 5);
});

test("validate: respects number min constraints", () => {
  const schema: Schema = {
    reps: { type: "number", required: true, min: 1, max: 1000 },
  };
  assert.equal(validate(schema, { reps: 0 }).ok, false);
  assert.equal(validate(schema, { reps: 5 }).ok, true);
  assert.equal(validate(schema, { reps: 5000 }).ok, false);
});
