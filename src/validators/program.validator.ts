import { Schema } from "./schema";

export const PROGRAM_CATEGORIES = ["strength", "cardio", "yoga", "hiit", "general"] as const;
export type ProgramCategory = typeof PROGRAM_CATEGORIES[number];

export const createProgramSchema: Schema = {
  name: { type: "string", required: true, min: 2, max: 100 },
  description: { type: "string", required: false, max: 500 },
  category: { type: "string", required: false, oneOf: PROGRAM_CATEGORIES, default: "general" },
};

export const idParamSchema: Schema = {
  id: { type: "objectId", required: true },
};
