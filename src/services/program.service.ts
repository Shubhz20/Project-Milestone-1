import { ProgramRepository } from "../repositories/program.repository";
import { IWorkoutProgram } from "../models/WorkoutProgram";
import { NotFoundError } from "../errors/AppError";

export interface CreateProgramInput {
  userId: string;
  name: string;
  description?: string;
  category?: string;
}

export class ProgramService {
  constructor(private readonly repo: ProgramRepository = new ProgramRepository()) {}

  createProgram(input: CreateProgramInput): Promise<IWorkoutProgram> {
    return this.repo.create(input as unknown as Partial<IWorkoutProgram>);
  }

  getPrograms(userId: string): Promise<IWorkoutProgram[]> {
    return this.repo.findByUser(userId);
  }

  async deleteProgram(id: string): Promise<void> {
    const ok = await this.repo.deleteById(id);
    if (!ok) throw new NotFoundError("Program not found");
  }
}
