import { WorkoutSession } from "../models/WorkoutSession";

export class WorkoutRepository {
  async create(data: any) {
    return WorkoutSession.create(data);
  }

  async findByUser(userId: string) {
    return WorkoutSession.find({ userId });
  }

  async findById(id: string) {
    return WorkoutSession.findById(id);
  }

  async update(id: string, data: any) {
    return WorkoutSession.findByIdAndUpdate(id, data, { new: true });
  }
}
