import express from "express";
import { getGoals, createGoal, markAchieved } from "../controllers/goal.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(authMiddleware as any);

router.post("/", createGoal);
router.get("/", getGoals);
router.put("/:id/achieve", markAchieved);

export default router;
