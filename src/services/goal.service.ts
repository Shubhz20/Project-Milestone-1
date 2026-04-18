import { GoalRepository } from "../repositories/goal.repository";
import { ProgramRepository } from "../repositories/program.repository";
import { IFitnessGoal } from "../models/FitnessGoal";
import { ForbiddenError, NotFoundError } from "../errors/AppError";

export interface CreateGoalInput {
  userId: string;
  programId: string;
  title: string;
  targetValue: number;
  unit: string;
}

export class GoalService {
  constructor(
    private readonly goals: GoalRepository = new GoalRepository(),
    private readonly programs: ProgramRepository = new ProgramRepository()
  ) {}

  async createGoal(input: CreateGoalInput): Promise<IFitnessGoal> {
    // Explicit cross-entity ownership check: the program linked to this goal
    // must belong to the same user. Without this, a malicious client could
    // attach goals to someone else's program.
    const program = await this.programs.findById(input.programId);
    if (!program) throw new NotFoundError("Program not found");
    if (program.userId.toString() !== input.userId) {
      throw new ForbiddenError("Program does not belong to the authenticated user");
    }

    return this.goals.create(input as unknown as Partial<IFitnessGoal>);
  }

  getGoals(userId: string): Promise<IFitnessGoal[]> {
    return this.goals.findByUser(userId);
  }

  getGoalsByProgram(programId: string): Promise<IFitnessGoal[]> {
    return this.goals.findByProgram(programId);
  }

  async markAchieved(id: string): Promise<IFitnessGoal> {
    const updated = await this.goals.updateById(id, {
      isAchieved: true,
      achievedAt: new Date(),
    } as Partial<IFitnessGoal>);
    if (!updated) throw new NotFoundError("Goal not found");
    return updated;
  }

  async updateGoal(id: string, patch: Partial<IFitnessGoal>): Promise<IFitnessGoal> {
    const updated = await this.goals.updateById(id, patch);
    if (!updated) throw new NotFoundError("Goal not found");
    return updated;
  }

  async deleteGoal(id: string): Promise<void> {
    const ok = await this.goals.deleteById(id);
    if (!ok) throw new NotFoundError("Goal not found");
  }
}
