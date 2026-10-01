import BaseService from "@/database/system/base-service.js";
import { User } from "@/generated/prisma/client.js";

class UpdateUserService extends BaseService<User, User> {
  protected async transaction(data: User): Promise<User | null> {
    const { hash, salt } = await this.Password.hash(data.password);

    const result = await this.database.user.update({
      where: { userId: data.userId },
      data: { ...data, salt, password: hash },
    });

    if (!result) return null;

    return result;
  }
}

export default UpdateUserService;
