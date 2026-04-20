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

  /**
   * Look up a user by an un-expired reset-password token. Returns `null`
   * if no match, the token is empty, or the stored expiry has passed.
   * The reset-token fields are `select: false`, so we opt-in explicitly
   * when Mongo is connected; the in-memory store carries them already.
   */
  async findByResetToken(token: string): Promise<IUser | null> {
    if (!token) return null;
    if (this.model.db.readyState === 1) {
      return this.model
        .findOne({
          resetPasswordToken: token,
          resetPasswordExpires: { $gt: new Date() },
        })
        .select("+resetPasswordToken +resetPasswordExpires")
        .exec();
    }
    // In-memory fallback: linear scan.
    const all = await this.findMany({} as any);
    const match = all.find(
      (u: any) =>
        u.resetPasswordToken === token &&
        u.resetPasswordExpires instanceof Date &&
        u.resetPasswordExpires.getTime() > Date.now()
    );
    return (match as IUser | undefined) ?? null;
  }
}
