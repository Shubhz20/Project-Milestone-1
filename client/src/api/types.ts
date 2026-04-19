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

export type Gender = "male" | "female" | "other" | "prefer_not_to_say";
export type FitnessLevel = "beginner" | "intermediate" | "advanced";

export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  age?: number;
  height?: number;
  weight?: number;
  gender?: Gender;
  fitnessLevel?: FitnessLevel;
  bio?: string;
  createdAt: string;
}

export interface WeightEntry {
  weightKg: number;
  recordedAt: string;
}

export interface ProfileDashboard {
  user: ProfileUser;
  body: {
    bmi: number | null;
    bmiCategory: "underweight" | "healthy" | "overweight" | "obese" | null;
    weightHistory: WeightEntry[];
  };
  stats: {
    totalWorkouts: number;
    completedWorkouts: number;
    activeWorkouts: number;
    totalCaloriesBurned: number;
    totalActiveMinutes: number;
    averageWorkoutMinutes: number;
    currentStreakDays: number;
    longestStreakDays: number;
    workoutsThisWeek: number;
    workoutsThisMonth: number;
  };
  goals: {
    total: number;
    achieved: number;
    inProgress: number;
    achievementRate: number;
  };
  programs: {
    total: number;
  };
}

export interface ProgramTemplate {
  key: string;
  name: string;
  description: string;
  category: Program["category"];
  intensity: "low" | "moderate" | "high";
  suggestedMinutes: number;
  minLevel: FitnessLevel;
  primaryGoal:
    | "weight_loss"
    | "muscle_gain"
    | "endurance"
    | "flexibility"
    | "general_health";
}

export interface ProgramRecommendation {
  template: ProgramTemplate;
  score: number;
  rationale: string[];
  estimatedCaloriesPerSession: number;
}

export interface RecommendationsResponse {
  recommendations: ProgramRecommendation[];
  catalog: ProgramTemplate[];
  meta: {
    bmi: number | null;
    bmiCategory: string | null;
    fitnessLevel: FitnessLevel | null;
  };
}
