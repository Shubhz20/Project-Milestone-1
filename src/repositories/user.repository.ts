import { User, IUser } from "../models/User";
import { BaseRepository } from "./base.repository";

export class UserRepository extends BaseRepository<IUser> {
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return this.findOne({ email: email.toLowerCase() });
  }

  /**
   * Password is `select: false` on the schema, so a normal `findById` will
   * omit it. This method explicitly opts back in when connected to DB.
   * In-memory mode always includes all fields.
   */
  async findByIdWithPassword(id: string): Promise<IUser | null> {
    if (this.model.db.readyState === 1) {
      return this.model.findById(id).select("+password").exec();
    }
    return this.findById(id);
  }
}
