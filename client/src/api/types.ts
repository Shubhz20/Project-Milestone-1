export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Program {
  _id: string;
  name: string;
  description?: string;
  category: "strength" | "cardio" | "hiit" | "yoga" | "general";
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  _id: string;
  userId: string;
  programId: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  isAchieved: boolean;
  achievedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkoutSession {
  _id: string;
  userId: string;
  programId: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  caloriesBurned?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const PROGRAM_CATEGORIES = [
  "general",
  "strength",
  "cardio",
  "hiit",
  "yoga",
] as const;
