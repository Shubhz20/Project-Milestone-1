import { Response } from "express";
import { ProgramService } from "../services/program.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { asyncHandler } from "../middlewares/asyncHandler";

export class ProgramController {
  constructor(private readonly programs: ProgramService = new ProgramService()) {}

  create = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, description, category } = req.body;
    const program = await this.programs.createProgram({
      userId: req.userId!,
      name,
      description,
      category,
    });
    res.status(201).json(program);
  });

  list = asyncHandler(async (req: AuthRequest, res: Response) => {
    const programs = await this.programs.getPrograms(req.userId!);
    res.json(programs);
  });

  remove = asyncHandler(async (req: AuthRequest, res: Response) => {
    await this.programs.deleteProgram(req.params.id as string);
    res.status(204).send();
  });
}
