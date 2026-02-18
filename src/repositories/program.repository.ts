import { WorkoutProgram } from "../models/WorkoutProgram";

export class ProgramRepository {
  async create(data: any) {
    return WorkoutProgram.create(data);
  }

  async findByUser(userId: string) {
    return WorkoutProgram.find({ userId });
  }

  async delete(id: string) {
    return WorkoutProgram.findByIdAndDelete(id);
  }
}
