import express from "express";
import { getPrograms, createProgram, deleteProgram } from "../controllers/program.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = express.Router();

router.use(authMiddleware as any);

router.post("/", createProgram);
router.get("/", getPrograms);
router.delete("/:id", deleteProgram);

export default router;
