import { Response } from "express";
import { WorkoutService } from "../services/workout.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/asyncHandler";

export class WorkoutController {
  constructor(private readonly workouts: WorkoutService = new WorkoutService()) {}

  start = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { programId, notes } = req.body;
    const session = await this.workouts.startWorkout({
      userId: req.userId!,
      programId,
      notes,
    });
    res.status(201).json(session);
  });

  end = asyncHandler(async (req: AuthRequest, res: Response) => {
    const session = await this.workouts.endWorkout(req.params.id as string);
    res.json(session);
  });

  list = asyncHandler(async (req: AuthRequest, res: Response) => {
    const sessions = await this.workouts.getWorkouts(req.userId!);
    res.json(sessions);
  });
}
