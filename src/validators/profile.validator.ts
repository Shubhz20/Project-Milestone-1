import { Schema } from "./schema";

/** Every profile field is optional — partial updates are valid. */
export const updateProfileSchema: Schema = {
  name: { type: "string", required: false, min: 2, max: 80 },
  age: { type: "number", required: false, min: 10, max: 120 },
  height: { type: "number", required: false, min: 50, max: 260 },
  weight: { type: "number", required: false, min: 1, max: 700 },
  gender: {
    type: "string",
    required: false,
    oneOf: ["male", "female", "other", "prefer_not_to_say"] as const,
  },
  fitnessLevel: {
    type: "string",
    required: false,
    oneOf: ["beginner", "intermediate", "advanced"] as const,
  },
  bio: { type: "string", required: false, max: 280 },
};

export const logWeightSchema: Schema = {
  weightKg: { type: "number", required: true, min: 1, max: 700 },
};
