import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";
import { env } from "../config/env";
import { BadRequestError, ConflictError, UnauthorizedError } from "../errors/AppError";
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

  async register(input: RegistrationPayload): Promise<IUser> {
    const { name, email, password } = input;
    if (!name || !email || !password) {
      throw new BadRequestError("Name, email, and password are required");
    }

    const existing = await this.users.findByEmail(email);
    if (existing) throw new ConflictError("An account with this email already exists");

    const hashed = await bcrypt.hash(password, AuthService.BCRYPT_ROUNDS);
    return this.users.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
    } as Partial<IUser>);
  }

  async login({ email, password }: AuthCredentials): Promise<LoginResult> {
    const user = await this.users.findByEmail(email);
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
}
