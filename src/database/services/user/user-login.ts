import BaseService from "@/database/system/base-service.js";
import { type User } from "@/generated/prisma/client.js";
import type { LogIn } from "@/types/user.js";

class SiginUserService extends BaseService<LogIn, User> {
  protected async transaction(data: LogIn): Promise<User | null> {
    const result = await this.database.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!result) return null;

    const isPassword = this.Password.compare(
      data.password,
      result.password,
      result.salt,
    );

    if (!isPassword) return null;
    return result;
  }
}

export default SiginUserService;
