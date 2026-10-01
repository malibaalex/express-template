import BaseService from "@/database/system/base-service.js";
import { User } from "@/generated/prisma/client.js";
import { Signup } from "@/types/user.js";

class CreateUserService extends BaseService<Signup, User> {
  protected async transaction(data: Signup): Promise<User | null> {
    const { hash, salt } = await this.Password.hash(data.password);

    const result = await this.database.user.create({
      data: {
        ...data,
        password: hash,
        salt,
      },
    });

    if (!result) return null;

    return result;
  }
}

export default CreateUserService;
