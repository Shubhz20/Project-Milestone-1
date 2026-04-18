import { FitnessGoal, IFitnessGoal } from "../models/FitnessGoal";
import { BaseRepository } from "./base.repository";

export class GoalRepository extends BaseRepository<IFitnessGoal> {
  constructor() {
    super(FitnessGoal);
  }

  findByUser(userId: string): Promise<IFitnessGoal[]> {
    return this.model.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  findByProgram(programId: string): Promise<IFitnessGoal[]> {
    return this.model.find({ programId }).exec();
  }
}
