import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../middlewares/asyncHandler";

/**
 * Controllers are intentionally thin: parse request, delegate to a service,
 * and shape the response. All error handling flows to the global error
 * middleware via `asyncHandler`.
 */
export class AuthController {
  constructor(private readonly auth: AuthService = new AuthService()) {}

  register = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.auth.register(req.body);
    res.status(201).json({ id: user._id, name: user.name, email: user.email });
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.auth.login(req.body);
    res.json(result);
  });
}
