import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWorkoutProgram extends Document {
  userId: Types.ObjectId;
  name: string;
  description?: string;
}

const schema = new Schema<IWorkoutProgram>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

export const WorkoutProgram = mongoose.model<IWorkoutProgram>("WorkoutProgram", schema);
