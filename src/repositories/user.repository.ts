import { User } from "../models/User";

export class UserRepository {
  async create(data: any) {
    return User.create(data);
  }

  async findByEmail(email: string) {
    return User.findOne({ email });
  }

  async findById(id: string, selectPassword: boolean = false) {
    if (selectPassword) {
      return User.findById(id).select("+password");
    }
    return User.findById(id);
  }
}
