import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserRepository } from "../repositories/user.repository";

export class AuthService {
  repo = new UserRepository();

  async register(name: string, email: string, password: string) {
    if (!name || !email || !password) {
      throw new Error("Name, email, and password are required");
    }

    const exists = await this.repo.findByEmail(email);

    if (exists) throw new Error("User exists");

    const hashed = await bcrypt.hash(password, 10);

    return this.repo.create({
      name,
      email,
      password: hashed
    });
  }

  async login(email: string, password: string) {
    const user = await this.repo.findByEmail(email);

    if (!user) throw new Error("User not found");

    // Since password has select: false, we need to explicitly select it
    const userWithPassword = await this.repo.findById(user._id.toString(), true);

    if (!userWithPassword) throw new Error("User not found");

    const valid = await bcrypt.compare(password, userWithPassword.password);

    if (!valid) throw new Error("Invalid password");

    return jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "24h" }
    );
  }
}
