import { Request, Response } from "express";

import BaseController from "@/core/base/base-controller.js";

class LogOutUserController extends BaseController {
  protected async module(
    req: Request,
    res: Response,
  ): Promise<void | Response> {
    const refreshToken = this.Utils.Token.extractRefresh(req);

    if (refreshToken) {
      await this.Service.RefreshTokenServices.RevokeRefreshToken.call(
        refreshToken,
      );
    }

    this.Utils.Cookie.clearAuthCookies(res);

    return this.responseHandler(
      res,
      this.HTTP_STATUS.SUCCESS,
      "Logged out successfully",
    );
  }
}

export default LogOutUserController;
