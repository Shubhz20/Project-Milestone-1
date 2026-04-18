import { WorkoutSession, IWorkoutSession } from "../models/WorkoutSession";
import { BaseRepository } from "./base.repository";

export class WorkoutRepository extends BaseRepository<IWorkoutSession> {
  constructor() {
    super(WorkoutSession);
  }

  findByUser(userId: string): Promise<IWorkoutSession[]> {
    return this.model.find({ userId }).sort({ startTime: -1 }).exec();
  }

  findActiveByUser(userId: string): Promise<IWorkoutSession | null> {
    return this.model.findOne({ userId, endTime: { $exists: false } }).exec();
  }
}
