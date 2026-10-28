import BaseService from "@/database/system/base-service.js";
import { type User } from "@/generated/prisma/client.js";
import type { SignIn } from "@/types/user.js";

class SignInUserService extends BaseService<SignIn, User> {
  protected async transaction(data: SignIn): Promise<User | null> {
    const result = await this.database.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!result) return null;

    const isPassword = await this.Password.compare(
      data.password,
      result.password,
      result.salt,
    );

    if (!isPassword) return null;

    return result;
  }
}

export default SignInUserService;
