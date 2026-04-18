import { Router } from "express";
import { WorkoutController } from "../controllers/workout.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOwnership } from "../middlewares/ownership.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import { idParamSchema, startWorkoutSchema } from "../validators/workout.validator";
import { WorkoutSession } from "../models/WorkoutSession";

const router = Router();
const controller = new WorkoutController();

router.use(authMiddleware);

router.post("/start", validateRequest(startWorkoutSchema), controller.start);
router.get("/", controller.list);

// PATCH /api/workouts/:id/end — ownership check loads & verifies the session
// before the service runs its duration/calorie calculations.
router.patch(
  "/:id/end",
  validateRequest(idParamSchema, "params"),
  requireOwnership(WorkoutSession),
  controller.end
);

// Backward-compatible alias kept from the original TODO spec.
router.put(
  "/end/:id",
  validateRequest(idParamSchema, "params"),
  requireOwnership(WorkoutSession),
  controller.end
);

export default router;
