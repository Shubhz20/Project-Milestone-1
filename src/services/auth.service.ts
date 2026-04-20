import { randomBytes } from "crypto";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import { env } from "../config/env";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/AppError";
import { IUser } from "../models/User";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegistrationPayload extends AuthCredentials {
  name: string;
}

export interface LoginResult {
  token: string;
  user: { id: string; name: string; email: string };
}

export interface ForgotPasswordResult {
  /** Opaque reset token. In production this should be emailed, not returned. */
  resetToken: string;
  /** ISO-8601 expiry timestamp. */
  expiresAt: string;
  /** Human-readable notice the client can surface to the user. */
  notice: string;
}

export interface ResetPasswordPayload {
  resetToken: string;
  newPassword: string;
}

/**
 * AuthService — orchestrates registration and login.
 *
 * Keeps bcrypt/jwt specifics out of the controllers. The repository is
 * injected through the constructor so tests (and future swaps) don't need
 * to monkey-patch the module.
 */
export class AuthService {
  private static readonly BCRYPT_ROUNDS = 10;

  constructor(private readonly users: UserRepository = new UserRepository()) {}

  async register(input: RegistrationPayload): Promise<LoginResult> {
    const { name, email, password } = input;
    if (!name || !email || !password) {
      throw new BadRequestError("Name, email, and password are required");
    }

    const existing = await this.users.findByEmail(email);
    if (existing) throw new ConflictError("An account with this email already exists");

    const hashed = await bcrypt.hash(password, AuthService.BCRYPT_ROUNDS);
    const created = await this.users.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
    } as Partial<IUser>);

    // Sign the JWT immediately so the client can use the returned token
    // without making a second `/login` call. This matters on serverless
    // platforms (e.g. Vercel) where the login request can land on a
    // different lambda replica than the register request, and — when the
    // app is running in the in-memory fallback mode — would otherwise not
    // see the newly-created user.
    const token = jwt.sign({ userId: created._id.toString() }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as SignOptions);

    return {
      token,
      user: {
        id: created._id.toString(),
        name: created.name,
        email: created.email,
      },
    };
  }

  async login({ email, password }: AuthCredentials): Promise<LoginResult> {
    const user = await this.users.findByEmail(email.toLowerCase());
    if (!user) throw new UnauthorizedError("Invalid email or password");

    const withPassword = await this.users.findByIdWithPassword(user._id.toString());
    if (!withPassword) throw new UnauthorizedError("Invalid email or password");

    const valid = await bcrypt.compare(password, withPassword.password);
    if (!valid) throw new UnauthorizedError("Invalid email or password");

    const token = jwt.sign({ userId: user._id.toString() }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as SignOptions);

    return {
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    };
  }

  /**
   * Forgot-password step 1: generate a short-lived reset token for the
   * account tied to `email` and persist it on the user record. In
   * production the token would be emailed; for this project we return
   * it in the response so the demo can proceed without a mailer, and the
   * UI makes that explicit.
   *
   * Security note: we deliberately do NOT reveal whether the email exists
   * when no user is found. Instead we throw NotFoundError only in the
   * service and the controller maps that to a generic success response.
   */
  async forgotPassword(email: string): Promise<ForgotPasswordResult> {
    if (!email) throw new BadRequestError("Email is required");

    const user = await this.users.findByEmail(email.toLowerCase());
    if (!user) throw new NotFoundError("No account found for that email");

    const resetToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(
      Date.now() + AuthService.RESET_TOKEN_TTL_MINUTES * 60 * 1000
    );

    await this.users.updateById(user._id.toString(), {
      resetPasswordToken: resetToken,
      resetPasswordExpires: expiresAt,
    } as Partial<IUser>);

    return {
      resetToken,
      expiresAt: expiresAt.toISOString(),
      notice:
        "In production this token would be emailed to you. For this demo, " +
        "copy the token above and paste it into the Reset Password form.",
    };
  }

  /**
   * Forgot-password step 2: consume a valid, un-expired reset token and
   * replace the password. The token is cleared on success so it can't be
   * re-used.
   */
  async resetPassword({ resetToken, newPassword }: ResetPasswordPayload): Promise<LoginResult> {
    if (!resetToken) throw new BadRequestError("Reset token is required");
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestError("New password must be at least 6 characters");
    }

    const user = await this.users.findByResetToken(resetToken);
    if (!user) {
      throw new BadRequestError("Reset token is invalid or has expired");
    }

    const hashed = await bcrypt.hash(newPassword, AuthService.BCRYPT_ROUNDS);

    // Unset the reset fields atomically with the new password so the token
    // can't be reused.
    await this.users.updateById(user._id.toString(), {
      password: hashed,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    } as Partial<IUser>);

    // Log the user in immediately so they can proceed without another form.
    const token = jwt.sign({ userId: user._id.toString() }, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    } as SignOptions);

    return {
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email },
    };
  }

  private static readonly RESET_TOKEN_TTL_MINUTES = 30;
}
