import { Router } from "express";
import { ProfileController } from "../controllers/profile.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import {
  logWeightSchema,
  updateProfileSchema,
} from "../validators/profile.validator";

/**
 * /api/profile — authenticated routes that expose the user's profile, the
 * computed personal dashboard, weight logging, and personalised program
 * recommendations.
 */
const router = Router();
const controller = new ProfileController();

router.use(authMiddleware);

router.get("/", controller.getDashboard);
router.put("/", validateRequest(updateProfileSchema), controller.updateProfile);
router.post(
  "/weight",
  validateRequest(logWeightSchema),
  controller.logWeight
);
router.get("/recommendations", controller.recommendations);

export default router;
