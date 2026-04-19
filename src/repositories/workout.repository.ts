import { WorkoutSession, IWorkoutSession } from "../models/WorkoutSession";
import { BaseRepository } from "./base.repository";

export class WorkoutRepository extends BaseRepository<IWorkoutSession> {
  constructor() {
    super(WorkoutSession);
  }

  async findByUser(userId: string): Promise<IWorkoutSession[]> {
    return this.findMany({ userId });
  }

  async findActiveByUser(userId: string): Promise<IWorkoutSession | null> {
    return this.findOne({ userId, endTime: { $exists: false } });
  }
}
