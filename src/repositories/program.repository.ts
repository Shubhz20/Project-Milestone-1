import { WorkoutProgram, IWorkoutProgram } from "../models/WorkoutProgram";
import { BaseRepository } from "./base.repository";

export class ProgramRepository extends BaseRepository<IWorkoutProgram> {
  constructor() {
    super(WorkoutProgram);
  }

  findByUser(userId: string): Promise<IWorkoutProgram[]> {
    return this.model.find({ userId }).sort({ createdAt: -1 }).exec();
  }
}
