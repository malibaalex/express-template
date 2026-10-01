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
        userId: data.userId,
        expiresAt: new Date(
          Date.now() + this.env.JWT_REFRESH__SECRET_KEY_EXPIRES_IN * 1000,
        ),
      },
    });
  }
}

export default SaveRefreshTokenService;
