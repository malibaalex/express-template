import SaveRefreshTokenService from "@/database/services/refresh-token/save-refresh-token-service.js";
import FindRefreshTokenService from "@/database/services/refresh-token/find-refresh-token-service.js";
import RevokeRefreshTokenService from "@/database/services/refresh-token/revoke-refresh-token-service.js";

const SaveRefreshToken = new SaveRefreshTokenService();
const FindRefreshToken = new FindRefreshTokenService();
const RevokeRefreshToken = new RevokeRefreshTokenService();

const RefreshTokenServices = {
  SaveRefreshToken,
  FindRefreshToken,
  RevokeRefreshToken,
};

export default RefreshTokenServices;
