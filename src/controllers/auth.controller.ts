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
    const result = await this.auth.register(req.body);
    // Return the same shape as /login ({ token, user }) so the client can
    // persist the JWT immediately without a second round-trip.
    res.status(201).json(result);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.auth.login(req.body);
    res.json(result);
  });

  /**
   * Start a password-reset flow. Responds 200 with the reset token so the
   * demo can proceed without an email provider. In a production build,
   * the notice text makes it clear this would normally be emailed.
   *
   * If no account is found we still respond 200 with `accountExists:false`
   * to avoid leaking which emails are registered, but we include a
   * friendly message so the UI can surface it.
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body ?? {};
    try {
      const result = await this.auth.forgotPassword(email);
      res.json({ accountExists: true, ...result });
    } catch (err: any) {
      if (err?.code === "NOT_FOUND") {
        res.json({
          accountExists: false,
          notice: "If an account exists for that email, a reset link has been prepared.",
        });
        return;
      }
      throw err;
    }
  });

  /**
   * Finish the reset: consume the token and return a fresh JWT so the
   * client can skip the extra /login round-trip — mirrors what we already
   * do for /register.
   */
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.auth.resetPassword(req.body);
    res.json(result);
  });
}
