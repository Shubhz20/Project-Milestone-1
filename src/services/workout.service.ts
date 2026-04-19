import { WorkoutRepository } from "../repositories/workout.repository";
import { ProgramRepository } from "../repositories/program.repository";
import { UserRepository } from "../repositories/user.repository";
import { IWorkoutSession } from "../models/WorkoutSession";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "../errors/AppError";
import { CalorieStrategyFactory } from "./calorie/CalorieFactory";

export interface StartWorkoutInput {
  userId: string;
  programId: string;
  notes?: string;
}

/**
 * WorkoutService — coordinates workout lifecycle (start, end, list).
 *
 * `endWorkout` delegates the calorie estimate to a strategy resolved by the
 * CalorieStrategyFactory so WorkoutService itself knows nothing about MET
 * math. A user's weight, when available, is factored in.
 */
export class WorkoutService {
  constructor(
    private readonly sessions: WorkoutRepository = new WorkoutRepository(),
    private readonly programs: ProgramRepository = new ProgramRepository(),
    private readonly users: UserRepository = new UserRepository()
  ) {}

  async startWorkout(input: StartWorkoutInput): Promise<IWorkoutSession> {
    const program = await this.programs.findById(input.programId);
    if (!program) throw new NotFoundError("Program not found");
    if (program.userId.toString() !== input.userId) {
      throw new ForbiddenError("Program does not belong to the authenticated user");
    }

    // Enforce a single active session per user — prevents overlapping timers
    // that would produce garbage durations.
    const active = await this.sessions.findActiveByUser(input.userId);
    if (active) throw new ConflictError("You already have an active workout session");

    return this.sessions.create({
      userId: program.userId,
      programId: program._id,
      startTime: new Date(),
      notes: input.notes,
    } as Partial<IWorkoutSession>);
  }

  async endWorkout(id: string, requestingUserId?: string): Promise<IWorkoutSession> {
    const session = await this.sessions.findById(id);
    if (!session) throw new NotFoundError("Workout session not found");
    if (requestingUserId && session.userId.toString() !== requestingUserId) {
      throw new ForbiddenError("You do not have access to this resource");
    }
    if (session.endTime) throw new BadRequestError("Session has already ended");

    const endTime = new Date();
    const durationMinutes = Math.max(
      0,
      Math.round((endTime.getTime() - session.startTime.getTime()) / 60000)
    );

    const program = await this.programs.findById(session.programId.toString());
    const user = await this.users.findById(session.userId.toString());

    const strategy = CalorieStrategyFactory.for(program?.category);
    const caloriesBurned = strategy.estimate({
      durationMinutes,
      userWeightKg: user?.weight,
    });

    const updated = await this.sessions.updateById(id, {
      endTime,
      durationMinutes,
      caloriesBurned,
    } as Partial<IWorkoutSession>);

    if (!updated) throw new NotFoundError("Workout session not found");
    return updated;
  }

  getWorkouts(userId: string): Promise<IWorkoutSession[]> {
    return this.sessions.findByUser(userId);
  }
}
