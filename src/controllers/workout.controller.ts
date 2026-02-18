import { Request, Response } from "express";
import { WorkoutService } from "../services/workout.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const workoutService = new WorkoutService();

export const startWorkout = async (req: AuthRequest, res: Response) => {
  try {
    const { programId } = req.body;
    const session = await workoutService.startWorkout({
      userId: req.userId,
      programId,
      startTime: new Date(),
    });
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const endWorkout = async (req: AuthRequest, res: Response) => {
  try {
    const session = await workoutService.endWorkout(req.params.id as string);
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getWorkouts = async (req: AuthRequest, res: Response) => {
  try {
    const sessions = await workoutService.getWorkouts(req.userId!);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
