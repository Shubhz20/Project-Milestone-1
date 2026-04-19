import { FitnessGoal, IFitnessGoal } from "../models/FitnessGoal";
import { BaseRepository } from "./base.repository";

export class GoalRepository extends BaseRepository<IFitnessGoal> {
  constructor() {
    super(FitnessGoal);
  }

  async findByUser(userId: string): Promise<IFitnessGoal[]> {
    return this.findMany({ userId });
  }

  async findByProgram(programId: string): Promise<IFitnessGoal[]> {
    return this.findMany({ programId });
  }
}
