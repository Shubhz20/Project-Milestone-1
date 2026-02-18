import express from "express";
import { startWorkout, endWorkout, getWorkouts } from "../controllers/workout.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(authMiddleware as any);

router.post("/start", startWorkout);
router.put("/end/:id", endWorkout);
router.get("/", getWorkouts);

export default router;
