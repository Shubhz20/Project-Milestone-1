import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFitnessGoal extends Document {
  userId: Types.ObjectId;
  programId: Types.ObjectId;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  isAchieved: boolean;
}

const schema = new Schema<IFitnessGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    programId: { type: Schema.Types.ObjectId, ref: "WorkoutProgram", required: true },
    title: { type: String, required: true },
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    unit: { type: String, required: true },
    isAchieved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const FitnessGoal = mongoose.model<IFitnessGoal>("FitnessGoal", schema);
