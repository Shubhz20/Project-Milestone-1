import mongoose, { Schema, Document, Types } from "mongoose";

export interface IFitnessGoal extends Document {
  userId: Types.ObjectId;
  programId: Types.ObjectId;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  isAchieved: boolean;
  achievedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IFitnessGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    programId: { type: Schema.Types.ObjectId, ref: "WorkoutProgram", required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    targetValue: { type: Number, required: true, min: 0 },
    currentValue: { type: Number, default: 0, min: 0 },
    unit: { type: String, required: true, trim: true, maxlength: 20 },
    isAchieved: { type: Boolean, default: false },
    achievedAt: { type: Date },
  },
  { timestamps: true }
);

export const FitnessGoal = mongoose.model<IFitnessGoal>("FitnessGoal", schema);
