import { Request, Response } from "express";

import BaseController from "@/core/base/base-controller.js";
import { clearAuthCookies } from "@/core/utils/coockie-util.js";

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

    clearAuthCookies(res);

    return this.responseHandler(
      res,
      this.SUCCESS_CODE,
      "Logged out successfully",
    );
  }
}

export default LogOutUserController;
