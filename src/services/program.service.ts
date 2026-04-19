import { ProgramRepository } from "../repositories/program.repository";
import { IWorkoutProgram } from "../models/WorkoutProgram";
import { NotFoundError, BadRequestError, ForbiddenError } from "../errors/AppError";
import { PROGRAM_TEMPLATES } from "./recommendation.service";

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

  /**
   * Materialise a template from the recommendation library into a real
   * program owned by the user. Templates are static catalog entries; this
   * is what makes them actionable.
   */
  async createFromTemplate(
    userId: string,
    templateKey: string
  ): Promise<IWorkoutProgram> {
    const tpl = PROGRAM_TEMPLATES.find((t) => t.key === templateKey);
    if (!tpl) throw new BadRequestError(`Unknown template: ${templateKey}`);
    return this.createProgram({
      userId,
      name: tpl.name,
      description: tpl.description,
      category: tpl.category,
    });
  }

  getPrograms(userId: string): Promise<IWorkoutProgram[]> {
    return this.repo.findByUser(userId);
  }

  async deleteProgram(id: string, requestingUserId?: string): Promise<void> {
    if (requestingUserId) {
      const prog = await this.repo.findById(id);
      if (!prog) throw new NotFoundError("Program not found");
      if (prog.userId.toString() !== requestingUserId) {
        throw new ForbiddenError("You do not have access to this resource");
      }
    }
    const ok = await this.repo.deleteById(id);
    if (!ok) throw new NotFoundError("Program not found");
  }
}
