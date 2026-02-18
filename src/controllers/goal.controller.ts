import { Request, Response } from "express";
import { GoalService } from "../services/goal.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const goalService = new GoalService();

export const createGoal = async (req: AuthRequest, res: Response) => {
  try {
    const { programId, title, targetValue, unit } = req.body;
    const goal = await goalService.createGoal({
      userId: req.userId,
      programId,
      title,
      targetValue,
      unit,
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getGoals = async (req: AuthRequest, res: Response) => {
  try {
    const goals = await goalService.getGoals(req.userId!);
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const markAchieved = async (req: AuthRequest, res: Response) => {
  try {
    const goal = await goalService.markAchieved(req.params.id as string);
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
