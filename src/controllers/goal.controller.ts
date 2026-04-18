import { Response } from "express";
import { GoalService } from "../services/goal.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/asyncHandler";

export class GoalController {
  constructor(private readonly goals: GoalService = new GoalService()) {}

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { programId, title, targetValue, unit } = req.body;
    const goal = await this.goals.createGoal({
      userId: req.userId!,
      programId,
      title,
      targetValue,
      unit,
    });
    res.status(201).json(goal);
  });

  list = asyncHandler(async (req: AuthRequest, res: Response) => {
    const goals = await this.goals.getGoals(req.userId!);
    res.json(goals);
  });

  update = asyncHandler(async (req: AuthRequest, res: Response) => {
    const goal = await this.goals.updateGoal(req.params.id as string, req.body);
    res.json(goal);
  });

  markAchieved = asyncHandler(async (req: AuthRequest, res: Response) => {
    const goal = await this.goals.markAchieved(req.params.id as string);
    res.json(goal);
  });

  remove = asyncHandler(async (req: AuthRequest, res: Response) => {
    await this.goals.deleteGoal(req.params.id as string);
    res.status(204).send();
  });
}
