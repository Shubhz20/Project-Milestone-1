import { ProgramRepository } from "../repositories/program.repository";
import { WorkoutProgram } from "../models/WorkoutProgram";

export class ProgramService {
  private programRepo: ProgramRepository;

  constructor() {
    this.programRepo = new ProgramRepository();
  }

  async createProgram(data: any) {
    return this.programRepo.create(data);
  }

  async getPrograms(userId: string) {
    return this.programRepo.findByUser(userId);
  }

  async deleteProgram(id: string) {
    return this.programRepo.delete(id);
  }
}
