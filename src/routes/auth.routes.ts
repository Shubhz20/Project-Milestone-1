import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateRequest } from "../middlewares/validate.middleware";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validators/auth.validator";

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

/**
 * Password-reset flow.
 *   POST /forgot-password { email }
 *     → { resetToken, expiresAt, notice }   (demo returns the token inline)
 *   POST /reset-password  { resetToken, newPassword }
 *     → { token, user }                      (logs the user in on success)
 */
router.post(
  "/forgot-password",
  validateRequest(forgotPasswordSchema),
  controller.forgotPassword
);
router.post(
  "/reset-password",
  validateRequest(resetPasswordSchema),
  controller.resetPassword
);

export default router;
