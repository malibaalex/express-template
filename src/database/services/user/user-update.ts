import BaseService from "@/database/system/base-service.js";
import { type User } from "@/generated/prisma/client.js";

import type { UpdateUser } from "@/types/user.js";

class UpdateUserService extends BaseService<UpdateUser, User> {
  protected async transaction(data: UpdateUser): Promise<User | null> {
    const { userId, password, ...userData } = data;

    const updateData: {
      email?: string;
      fullName?: string;
      password?: string;
      salt?: string;
    } = {
      ...userData,
    };

    if (password !== undefined) {
      const { hash, salt } = await this.Password.hash(password);

      updateData.password = hash;
      updateData.salt = salt;
    }

    return this.database.user.update({
      where: { userId },
      data: updateData,
    });
  }
}

export default UpdateUserService;
