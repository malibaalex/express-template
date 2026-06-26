import BaseControlller from "@/core/base/base-controller.js";
import { User } from "@/generated/prisma/client.js";
import { Request, Response } from "express";
import {
  setAccessCookie,
  setRefreshCookie,
} from "@/core/utils/coockie-util.js";

class UpdateUserController extends BaseControlller {
  protected async module(
    req: Request,
    res: Response,
  ): Promise<void | Response> {
    const data: User = req.body;
    const user = req.currentUser;

    if (!user) {
      return this.responseHandler(
        res,
        this.UNAUTHORIZED_CODE,
        this.UNAUTHORIZED_MSG,
      );
    }

    const result = await this.Service.UserServices.UpdateUser.call({
      ...data,
      user_id: user.user_id,
    });

    if (!result) {
      return this.responseHandler(
        res,
        this.BAD_REQUEST_CODE,
        this.BAD_REQUEST_MSG,
      );
    }

    const userData = this.Utils.omitProperty(result as User, [
      "salt",
      "password",
      "status",
    ]);

    const accessToken = this.Utils.Token.generateAccess(userData);
    const newRefreshToken = this.Utils.Token.generateRefresh({
      userId: result.user_id,
    });

    if (!accessToken || !newRefreshToken) {
      return this.responseHandler(
        res,
        this.BAD_REQUEST_CODE,
        this.BAD_REQUEST_MSG,
      );
    }

    // rotate refresh token — user data changed so old token payload is stale
    const oldRefreshToken = this.Utils.Token.extractRefresh(req);
    if (oldRefreshToken) {
      await this.Service.RefreshTokenServices.RevokeRefreshToken.call(
        oldRefreshToken,
      );
    }

    await this.Service.RefreshTokenServices.SaveRefreshToken.call({
      userId: result.user_id,
      token: newRefreshToken,
    });

    setAccessCookie(res, accessToken);
    setRefreshCookie(res, newRefreshToken);

    return this.responseHandler(
      res,
      this.SUCCESS_CODE,
      this.SUCCESS_MSG,
      userData,
    );
  }
}

export default UpdateUserController;
