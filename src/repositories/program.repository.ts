import { WorkoutProgram, IWorkoutProgram } from "../models/WorkoutProgram";
import { BaseRepository } from "./base.repository";

export class ProgramRepository extends BaseRepository<IWorkoutProgram> {
  constructor() {
    super(WorkoutProgram);
  }

  async findByUser(userId: string): Promise<IWorkoutProgram[]> {
    return this.findMany({ userId });
  }
}
