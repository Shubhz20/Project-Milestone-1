import { Router } from "express";
import { ProgramController } from "../controllers/program.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireOwnership } from "../middlewares/ownership.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import { createProgramSchema, idParamSchema } from "../validators/program.validator";
import { WorkoutProgram } from "../models/WorkoutProgram";

const router = Router();
const controller = new ProgramController();

router.use(authMiddleware);

router.post("/", validateRequest(createProgramSchema), controller.create);
router.get("/", controller.list);

router.delete(
  "/:id",
  validateRequest(idParamSchema, "params"),
  requireOwnership(WorkoutProgram),
  controller.remove
);

export default router;
