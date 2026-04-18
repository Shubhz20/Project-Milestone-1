import { User, IUser } from "../models/User";
import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  findByEmail(email: string): Promise<IUser | null> {
    return this.model.findOne({ email: email.toLowerCase() }).exec();
  }

  /**
   * Password is `select: false` on the schema, so a normal `findById` will
   * omit it. This method explicitly opts back in — used only by the auth
   * service during login.
   */
  findByIdWithPassword(id: string): Promise<IUser | null> {
    return this.model.findById(id).select("+password").exec();
  }
}
