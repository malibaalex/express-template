import BaseService from "@/database/system/base-service.js";
import { RefreshToken } from "@/generated/prisma/client.js";

class FindRefreshTokenService extends BaseService<string, RefreshToken> {
  protected async transaction(token: string): Promise<RefreshToken | null> {
    return await this.database.refreshToken.findUnique({
      where: { token },
    });
  }
}

export default FindRefreshTokenService;
