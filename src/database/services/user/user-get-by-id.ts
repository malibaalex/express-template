import BaseService from "@/database/system/base-service.js";
import { User } from "@/generated/prisma/client.js";

class GetUserByIdService extends BaseService<string, User> {
  protected async transaction(userId: string): Promise<User | null> {
    const result = await this.database.user.findUnique({
      where: { userId },
    });

    if (!result) return null;

    return result;
  }
}

export default GetUserByIdService;
