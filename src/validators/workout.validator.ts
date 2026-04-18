import { Schema } from "./schema";

export const startWorkoutSchema: Schema = {
  programId: { type: "objectId", required: true },
  notes: { type: "string", required: false, max: 500 },
};

export const idParamSchema: Schema = {
  id: { type: "objectId", required: true },
};
