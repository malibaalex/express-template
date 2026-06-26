import { Request, Response } from "express";
import BaseController from "@/core/base/base-controller.js";
import {
  setAccessCookie,
  setRefreshCookie,
} from "@/core/utils/coockie-util.js";

class RefreshTokenController extends BaseController {
  protected async module(
    req: Request,
    res: Response,
  ): Promise<void | Response> {
    const incomingRefreshToken = this.Utils.Token.extractRefresh(req);

    if (!incomingRefreshToken) {
      return this.responseHandler(
        res,
        this.UNAUTHORIZED_CODE,
        "No refresh token",
      );
    }

    // verify signature + expiry
    const decoded = this.Utils.Token.decodeRefresh(incomingRefreshToken);
    if (!decoded) {
      return this.responseHandler(
        res,
        this.UNAUTHORIZED_CODE,
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
        this.UNAUTHORIZED_CODE,
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
        this.UNAUTHORIZED_CODE,
        "Refresh token expired",
      );
    }

    // rotate — revoke old, issue new
    await this.Service.RefreshTokenServices.RevokeRefreshToken.call(
      incomingRefreshToken,
    );

    const payload = decoded.payload;
    const newAccessToken = this.Utils.Token.generateAccess(payload);
    const newRefreshToken = this.Utils.Token.generateRefresh({
      userId: stored.user_id,
    });

    if (!newAccessToken || !newRefreshToken) {
      return this.responseHandler(
        res,
        this.BAD_REQUEST_CODE,
        this.BAD_REQUEST_MSG,
      );
    }

    await this.Service.RefreshTokenServices.SaveRefreshToken.call({
      userId: stored.user_id,
      token: newRefreshToken,
    });

    setAccessCookie(res, newAccessToken);
    setRefreshCookie(res, newRefreshToken);

    return this.responseHandler(res, this.SUCCESS_CODE, this.SUCCESS_MSG);
  }
}

export default RefreshTokenController;
