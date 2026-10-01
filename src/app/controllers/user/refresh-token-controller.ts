import { Request, Response } from "express";
import BaseController from "@/core/base/base-controller.js";
import omitProperty from "@/core/utils/omit-property.js";

class RefreshTokenController extends BaseController {
  protected async module(
    req: Request,
    res: Response,
  ): Promise<void | Response> {
    const incomingRefreshToken = this.Utils.Token.extractRefresh(req);

    if (!incomingRefreshToken) {
      return this.responseHandler(
        res,
        this.HTTP_STATUS.UNAUTHORIZED,
        "No refresh token",
      );
    }

    // verify signature + expiry
    const decoded = this.Utils.Token.verifyRefresh(incomingRefreshToken);
    if (!decoded) {
      return this.responseHandler(
        res,
        this.HTTP_STATUS.UNAUTHORIZED,
        "Invalid refresh token",
      );
    }

    // check it exists in DB (not revoked)
    const stored =
      await this.Service.RefreshTokenServices.FindRefreshToken.call(
        incomingRefreshToken,
      );
    if (!stored) {
      return this.responseHandler(
        res,
        this.HTTP_STATUS.UNAUTHORIZED,
        "Refresh token revoked",
      );
    }

    // check it hasn't expired in DB
    if (stored.expiresAt < new Date()) {
      await this.Service.RefreshTokenServices.RevokeRefreshToken.call(
        incomingRefreshToken,
      );
      return this.responseHandler(
        res,
        this.HTTP_STATUS.UNAUTHORIZED,
        "Refresh token expired",
      );
    }

    const user = await this.Service.UserServices.getUserById.call(
      stored.userId,
    );
    if (!user) {
      await this.Service.RefreshTokenServices.RevokeRefreshToken.call(
        incomingRefreshToken,
      );
      return this.responseHandler(
        res,
        this.HTTP_STATUS.UNAUTHORIZED,
        "User not found",
      );
    }

    const userData = omitProperty(user, ["password", "salt", "status"]);

    const newAccessToken = this.Utils.Token.signAccess({
      payload: userData,
    });
    const newRefreshToken = this.Utils.Token.signRefresh({
      userId: userData.userId,
    });

    await this.Service.RefreshTokenServices.SaveRefreshToken.call({
      userId: user.userId,
      token: newRefreshToken,
    });
    await this.Service.RefreshTokenServices.RevokeRefreshToken.call(
      incomingRefreshToken,
    );

    this.Utils.Cookie.setAccessCookie(res, newAccessToken);
    this.Utils.Cookie.setRefreshCookie(res, newRefreshToken);

    return this.responseHandler(
      res,
      this.HTTP_STATUS.SUCCESS,
      this.HTTP_MSG.SUCCESS,
    );
  }
}

export default RefreshTokenController;
