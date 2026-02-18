import { FitnessGoal } from "../models/FitnessGoal";

export class GoalRepository {
  async create(data: any) {
    return FitnessGoal.create(data);
  }

  async findByUser(userId: string) {
    return FitnessGoal.find({ userId });
  }

  async update(id: string, data: any) {
    return FitnessGoal.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string) {
    return FitnessGoal.findByIdAndDelete(id);
  }
}
