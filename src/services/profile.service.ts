import { UserRepository } from "../repositories/user.repository";
import { WorkoutRepository } from "../repositories/workout.repository";
import { GoalRepository } from "../repositories/goal.repository";
import { ProgramRepository } from "../repositories/program.repository";
import { NotFoundError } from "../errors/AppError";
import { IUser } from "../models/User";

export interface ProfileDashboard {
  user: {
    id: string;
    name: string;
    email: string;
    age?: number;
    height?: number;
    weight?: number;
    gender?: string;
    fitnessLevel?: string;
    bio?: string;
    createdAt: Date;
  };
  body: {
    bmi: number | null;
    bmiCategory: BmiCategory | null;
    weightHistory: { weightKg: number; recordedAt: Date }[];
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

type BmiCategory =
  | "underweight"
  | "healthy"
  | "overweight"
  | "obese";

const classifyBmi = (bmi: number): BmiCategory => {
  if (bmi < 18.5) return "underweight";
  if (bmi < 25) return "healthy";
  if (bmi < 30) return "overweight";
  return "obese";
};

/** Strip the time component so two timestamps on the same calendar day match. */
const dayKey = (d: Date): string => d.toISOString().slice(0, 10);

/**
 * ProfileService — composes the user's profile and computed personal stats.
 *
 * Stats are computed on demand (not stored) so they are always fresh and
 * never drift from the underlying workout/goal records. For an app with
 * thousands of workouts per user we'd add a cached materialised view, but
 * for the demo workload (<1000 sessions) the math is microsecond-cheap.
 */
export class ProfileService {
  constructor(
    private readonly users: UserRepository = new UserRepository(),
    private readonly workouts: WorkoutRepository = new WorkoutRepository(),
    private readonly goals: GoalRepository = new GoalRepository(),
    private readonly programs: ProgramRepository = new ProgramRepository()
  ) {}

  async getDashboard(userId: string): Promise<ProfileDashboard> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError("User not found");

    const [allWorkouts, allGoals, allPrograms] = await Promise.all([
      this.workouts.findByUser(userId),
      this.goals.findByUser(userId),
      this.programs.findByUser(userId),
    ]);

    return {
      user: this.toPublicUser(user),
      body: this.buildBodyStats(user),
      stats: this.buildWorkoutStats(allWorkouts),
      goals: this.buildGoalStats(allGoals),
      programs: { total: allPrograms.length },
    };
  }

  async updateProfile(
    userId: string,
    patch: Partial<Pick<IUser, "name" | "age" | "height" | "weight" | "gender" | "fitnessLevel" | "bio">>
  ): Promise<IUser> {
    const updated = await this.users.updateById(userId, patch as any);
    if (!updated) throw new NotFoundError("User not found");
    return updated;
  }

  /** Append a new weight entry AND mirror it onto the `weight` field. */
  async logWeight(userId: string, weightKg: number): Promise<IUser> {
    const user = await this.users.findById(userId);
    if (!user) throw new NotFoundError("User not found");
    const history = Array.isArray(user.weightHistory) ? user.weightHistory : [];
    history.push({ weightKg, recordedAt: new Date() });
    const updated = await this.users.updateById(userId, {
      weight: weightKg,
      weightHistory: history,
    } as any);
    if (!updated) throw new NotFoundError("User not found");
    return updated;
  }

  // ----- helpers -----

  private toPublicUser(user: IUser): ProfileDashboard["user"] {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      age: user.age,
      height: user.height,
      weight: user.weight,
      gender: user.gender,
      fitnessLevel: user.fitnessLevel,
      bio: user.bio,
      createdAt: user.createdAt,
    };
  }

  private buildBodyStats(user: IUser): ProfileDashboard["body"] {
    let bmi: number | null = null;
    if (user.height && user.weight) {
      const heightMeters = user.height / 100;
      bmi = +(user.weight / (heightMeters * heightMeters)).toFixed(1);
    }
    return {
      bmi,
      bmiCategory: bmi !== null ? classifyBmi(bmi) : null,
      weightHistory: (user.weightHistory ?? []).map((w) => ({
        weightKg: w.weightKg,
        recordedAt: w.recordedAt,
      })),
    };
  }

  private buildWorkoutStats(
    sessions: Awaited<ReturnType<WorkoutRepository["findByUser"]>>
  ): ProfileDashboard["stats"] {
    const completed = sessions.filter((s) => !!s.endTime);
    const active = sessions.filter((s) => !s.endTime);

    const totalCalories = completed.reduce(
      (sum, s) => sum + (s.caloriesBurned ?? 0),
      0
    );
    const totalMinutes = completed.reduce(
      (sum, s) => sum + (s.durationMinutes ?? 0),
      0
    );
    const avgMinutes =
      completed.length > 0
        ? Math.round((totalMinutes / completed.length) * 10) / 10
        : 0;

    // Unique days (UTC) on which there was at least one completed session.
    const completedDayKeys = new Set(
      completed.map((s) => dayKey(s.endTime ?? s.startTime))
    );

    // Walk back from today to find the current streak.
    const today = new Date();
    let currentStreak = 0;
    for (let i = 0; ; i++) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      if (completedDayKeys.has(dayKey(d))) currentStreak++;
      else break;
    }

    // Longest streak: scan unique days in order.
    const sortedDays = [...completedDayKeys].sort();
    let longestStreak = 0;
    let run = 0;
    let prev: Date | null = null;
    for (const key of sortedDays) {
      const d = new Date(key + "T00:00:00Z");
      if (prev) {
        const diffDays = Math.round(
          (d.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
        );
        run = diffDays === 1 ? run + 1 : 1;
      } else {
        run = 1;
      }
      if (run > longestStreak) longestStreak = run;
      prev = d;
    }

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const inWindow = (s: { endTime?: Date; startTime: Date }, since: number) =>
      (s.endTime ?? s.startTime).getTime() >= since;

    return {
      totalWorkouts: sessions.length,
      completedWorkouts: completed.length,
      activeWorkouts: active.length,
      totalCaloriesBurned: Math.round(totalCalories),
      totalActiveMinutes: Math.round(totalMinutes),
      averageWorkoutMinutes: avgMinutes,
      currentStreakDays: currentStreak,
      longestStreakDays: longestStreak,
      workoutsThisWeek: completed.filter((s) => inWindow(s, sevenDaysAgo)).length,
      workoutsThisMonth: completed.filter((s) => inWindow(s, thirtyDaysAgo)).length,
    };
  }

  private buildGoalStats(
    goals: Awaited<ReturnType<GoalRepository["findByUser"]>>
  ): ProfileDashboard["goals"] {
    const total = goals.length;
    const achieved = goals.filter((g) => g.isAchieved).length;
    return {
      total,
      achieved,
      inProgress: total - achieved,
      achievementRate:
        total === 0 ? 0 : Math.round((achieved / total) * 1000) / 10,
    };
  }
}
