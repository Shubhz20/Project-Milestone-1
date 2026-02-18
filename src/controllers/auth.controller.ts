import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

const service = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;

      const user = await service.register(
        name,
        email,
        password
      );

      res.json(user);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const token = await service.login(email, password);

      res.json({ token });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }
}
