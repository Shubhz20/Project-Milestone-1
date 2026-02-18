import { Request, Response } from "express"; 
import { ProgramService } from "../services/program.service";
import { AuthRequest } from "../middlewares/auth.middleware";

const programService = new ProgramService();

export const createProgram = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const program = await programService.createProgram({
      userId: req.userId,
      name,
      description,
    });
    res.status(201).json(program);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getPrograms = async (req: AuthRequest, res: Response) => {
  try {
    const programs = await programService.getPrograms(req.userId!);
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteProgram = async (req: AuthRequest, res: Response) => {
  try {
    await programService.deleteProgram(req.params.id as string);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
