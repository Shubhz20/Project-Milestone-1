import { Router } from "express";
import { GoalController } from "../controllers/goal.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOwnership } from "../middlewares/ownership.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import {
  createGoalSchema,
  idParamSchema,
  updateGoalSchema,
} from "../validators/goal.validator";
import { FitnessGoal } from "../models/FitnessGoal";

const router = Router();
const controller = new GoalController();

router.use(authMiddleware);

router.post("/", validateRequest(createGoalSchema), controller.create);
router.get("/", controller.list);

router.patch(
  "/:id",
  validateRequest(idParamSchema, "params"),
  validateRequest(updateGoalSchema),
  requireOwnership(FitnessGoal),
  controller.update
);

router.put(
  "/:id/achieve",
  validateRequest(idParamSchema, "params"),
  requireOwnership(FitnessGoal),
  controller.markAchieved
);

router.delete(
  "/:id",
  validateRequest(idParamSchema, "params"),
  requireOwnership(FitnessGoal),
  controller.remove
);

export default router;
