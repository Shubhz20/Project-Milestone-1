/**
 * A tiny, dependency-free schema validator.
 *
 * We intentionally avoid pulling in zod/yup/joi to keep the runtime surface
 * small. The validator covers the shapes this project actually needs:
 *   - string / number / boolean / objectId / date / enum
 *   - required vs. optional fields
 *   - min / max for strings and numbers
 *
 * Each validator is a `FieldSpec`, and `validate(schema, data)` returns either
 * the coerced object or a list of per-field errors.
 */

import mongoose from "mongoose";

export type FieldType = "string" | "number" | "boolean" | "objectId" | "date";

export interface FieldSpec {
  type: FieldType;
  required?: boolean;
  min?: number;
  max?: number;
  oneOf?: readonly string[];
  default?: unknown;
}

export type Schema = Record<string, FieldSpec>;
export type ValidationIssue = { field: string; message: string };

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  errors?: ValidationIssue[];
}

const coerce = (type: FieldType, raw: unknown): { ok: true; value: unknown } | { ok: false; reason: string } => {
  if (raw === undefined || raw === null || raw === "") {
    return { ok: true, value: undefined };
  }
  switch (type) {
    case "string": {
      if (typeof raw !== "string") return { ok: false, reason: "must be a string" };
      return { ok: true, value: raw.trim() };
    }
    case "number": {
      const n = typeof raw === "number" ? raw : Number(raw);
      if (Number.isNaN(n)) return { ok: false, reason: "must be a number" };
      return { ok: true, value: n };
    }
    case "boolean": {
      if (typeof raw === "boolean") return { ok: true, value: raw };
      if (raw === "true") return { ok: true, value: true };
      if (raw === "false") return { ok: true, value: false };
      return { ok: false, reason: "must be a boolean" };
    }
    case "objectId": {
      if (typeof raw !== "string" || !mongoose.Types.ObjectId.isValid(raw)) {
        return { ok: false, reason: "must be a valid ObjectId" };
      }
      return { ok: true, value: raw };
    }
    case "date": {
      const d = raw instanceof Date ? raw : new Date(raw as string);
      if (Number.isNaN(d.getTime())) return { ok: false, reason: "must be a valid date" };
      return { ok: true, value: d };
    }
    default:
      return { ok: false, reason: "unsupported type" };
  }
};

export const validate = <T extends Record<string, unknown>>(
  schema: Schema,
  data: Record<string, unknown> | undefined
): ValidationResult<T> => {
  const errors: ValidationIssue[] = [];
  const value: Record<string, unknown> = {};
  const source = data ?? {};

  for (const [field, spec] of Object.entries(schema)) {
    const rawInput = source[field];
    const coerced = coerce(spec.type, rawInput);

    if (!coerced.ok) {
      errors.push({ field, message: coerced.reason });
      continue;
    }

    let v = coerced.value;
    if (v === undefined) {
      if (spec.default !== undefined) v = spec.default;
      else if (spec.required) {
        errors.push({ field, message: "is required" });
        continue;
      } else {
        continue;
      }
    }

    if (spec.type === "string" && typeof v === "string") {
      if (spec.min !== undefined && v.length < spec.min) {
        errors.push({ field, message: `must be at least ${spec.min} characters` });
        continue;
      }
      if (spec.max !== undefined && v.length > spec.max) {
        errors.push({ field, message: `must be at most ${spec.max} characters` });
        continue;
      }
      if (spec.oneOf && !spec.oneOf.includes(v)) {
        errors.push({ field, message: `must be one of: ${spec.oneOf.join(", ")}` });
        continue;
      }
    }

    if (spec.type === "number" && typeof v === "number") {
      if (spec.min !== undefined && v < spec.min) {
        errors.push({ field, message: `must be >= ${spec.min}` });
        continue;
      }
      if (spec.max !== undefined && v > spec.max) {
        errors.push({ field, message: `must be <= ${spec.max}` });
        continue;
      }
    }

    value[field] = v;
  }

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: value as T };
};
