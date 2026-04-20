import mongoose, { Schema, Document } from "mongoose";

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export interface WeightEntry {
  weightKg: number;
  recordedAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  /** Current self-reported weight in kg. */
  weight?: number;
  /** Height in cm. */
  height?: number;
  age?: number;
  gender?: Gender;
  fitnessLevel?: FitnessLevel;
  bio?: string;
  /** History of weight measurements over time (for trend analytics). */
  weightHistory?: WeightEntry[];
  /** One-shot password-reset token (opaque string). Cleared after use. */
  resetPasswordToken?: string;
  /** Expiry timestamp for the current reset token. */
  resetPasswordExpires?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const weightEntrySchema = new Schema<WeightEntry>(
  {
    weightKg: { type: Number, required: true, min: 1, max: 700 },
    recordedAt: { type: Date, required: true, default: () => new Date() },
  },
  { _id: false }
);

const schema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"],
    },
    password: { type: String, required: true, select: false },
    weight: { type: Number, min: 1, max: 700 },
    height: { type: Number, min: 50, max: 260 },
    age: { type: Number, min: 10, max: 120 },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    fitnessLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
    },
    bio: { type: String, maxlength: 280, trim: true },
    weightHistory: { type: [weightEntrySchema], default: [] },
    /**
     * Reset-token fields are `select: false` so they never leak into a normal
     * user fetch and are only read through an explicit opt-in in the
     * repository (findByResetToken).
     */
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Hide sensitive/noisy fields when the document is serialized to JSON.
schema.set("toJSON", {
  transform: (_doc, ret) => {
    const out = ret as unknown as Record<string, unknown>;
    delete out.password;
    delete out.resetPasswordToken;
    delete out.resetPasswordExpires;
    delete out.__v;
    return out;
  },
});

export const User = mongoose.model<IUser>("User", schema);
