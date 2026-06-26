import BaseService from "@/database/system/base-service.js";
import { User } from "@/generated/prisma/client.js";

class UpdateUserService extends BaseService<User, User> {
  protected async transaction(data: User): Promise<User | null> {
    const salt = this.Password.salt();
    const password = this.Password.hash(data.password, salt);

    const result = await this.database.user.update({
      where: { user_id: data.user_id },
      data: { ...data, salt, password },
    });

    if (!result) return null;
    return result;
  }
}

export default UpdateUserService;
