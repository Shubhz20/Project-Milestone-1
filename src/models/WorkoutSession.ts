import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWorkoutSession extends Document {
  userId: Types.ObjectId;
  programId: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
  durationMinutes?: number;
  caloriesBurned?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IWorkoutSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    programId: { type: Schema.Types.ObjectId, ref: "WorkoutProgram", required: true, index: true },
    startTime: { type: Date, required: true, default: () => new Date() },
    endTime: { type: Date },
    durationMinutes: { type: Number, min: 0 },
    caloriesBurned: { type: Number, min: 0 },
    notes: { type: String, maxlength: 500 },
  },
  { timestamps: true }
);

// Guard against end_time <= start_time at the schema layer. Belt-and-braces
// with the service, but cheap insurance against bad data sneaking in via
// direct Mongo writes (e.g., seed scripts).
schema.pre("save", function (this: IWorkoutSession, next: (err?: Error) => void) {
  if (this.endTime && this.endTime <= this.startTime) {
    next(new Error("endTime must be after startTime"));
    return;
  }
  next();
} as any);

export const WorkoutSession = mongoose.model<IWorkoutSession>("WorkoutSession", schema);
