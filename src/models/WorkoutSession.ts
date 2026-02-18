import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWorkoutSession extends Document {
  userId: Types.ObjectId;
  programId: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  durationMinutes?: number;
  caloriesBurned?: number;
}

const schema = new Schema<IWorkoutSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    programId: { type: Schema.Types.ObjectId, ref: "WorkoutProgram", required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    durationMinutes: { type: Number },
    caloriesBurned: { type: Number },
  },
  { timestamps: true }
);

export const WorkoutSession = mongoose.model<IWorkoutSession>("WorkoutSession", schema);
