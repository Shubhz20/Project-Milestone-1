import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateRequest } from "../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";

const router = Router();
const controller = new AuthController();

router.get("/register", (_req, res) => {
  res.json({
    message: "Registration endpoint",
    method: "POST",
    body: { name: "string", email: "string", password: "string" },
    description: "Submit a POST request to register a new account.",
  });
});
router.post("/register", validateRequest(registerSchema), controller.register);

router.get("/login", (_req, res) => {
  res.json({
    message: "Login endpoint",
    method: "POST",
    body: { email: "string", password: "string" },
    description: "Submit a POST request with your credentials to receive a JWT.",
  });
});
router.post("/login", validateRequest(loginSchema), controller.login);

export default router;
