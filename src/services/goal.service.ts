import { GoalRepository } from "../repositories/goal.repository";
import { FitnessGoal } from "../models/FitnessGoal";

export class GoalService {
  private goalRepo: GoalRepository;

  constructor() {
    this.goalRepo = new GoalRepository();
  }

  async createGoal(data: any) {
    return this.goalRepo.create(data);
  }

  async getGoals(userId: string) {
    return this.goalRepo.findByUser(userId);
  }

  async markAchieved(id: string) {
    return this.goalRepo.update(id, { isAchieved: true });
  }

  async deleteGoal(id: string) {
    return this.goalRepo.delete(id);
  }
}
