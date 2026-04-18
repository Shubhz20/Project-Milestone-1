import { Schema } from "./schema";

export const createGoalSchema: Schema = {
  programId: { type: "objectId", required: true },
  title: { type: "string", required: true, min: 2, max: 120 },
  targetValue: { type: "number", required: true, min: 0 },
  unit: { type: "string", required: true, min: 1, max: 20 },
};

export const updateGoalSchema: Schema = {
  title: { type: "string", required: false, min: 2, max: 120 },
  targetValue: { type: "number", required: false, min: 0 },
  currentValue: { type: "number", required: false, min: 0 },
  unit: { type: "string", required: false, min: 1, max: 20 },
};

export const idParamSchema: Schema = {
  id: { type: "objectId", required: true },
};
