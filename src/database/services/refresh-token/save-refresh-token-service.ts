import BaseService from "@/database/system/base-service.js";
import { type RefreshToken } from "@/generated/prisma/client.js";

interface SaveRefreshTokenInput {
  userId: string;
  token: string;
}

class SaveRefreshTokenService extends BaseService<
  SaveRefreshTokenInput,
  RefreshToken
> {
  protected async transaction(
    data: SaveRefreshTokenInput,
  ): Promise<RefreshToken | null> {
    return await this.database.refreshToken.create({
      data: {
        token: data.token,
        user_id: data.userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  }
}

export default SaveRefreshTokenService;
