import BaseService from "@/database/system/base-service.js";
import { User } from "@/generated/prisma/client.js";

class GetOneUserByEmailService extends BaseService<string, User> {
  protected async transaction(email: string): Promise<User | null> {
    const result = await this.database.user.findUnique({
      where: { email },
    });

    if (!result) return null;

    return result;
  }
}

export default GetOneUserByEmailService;
