import BaseControlller from "@/core/base/base-controller.js";
import { User } from "@/generated/prisma/client.js";
import { Request, Response } from "express";

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
        this.HTTP_STATUS.UNAUTHORIZED,
        this.HTTP_MSG.UNAUTHORIZED,
      );
    }

    const result = await this.Service.UserServices.UpdateUser.call({
      ...data,
      userId: user.userId,
    });

    if (!result) {
      return this.responseHandler(
        res,
        this.HTTP_STATUS.BAD_REQUEST,
        this.HTTP_MSG.BAD_REQUEST,
      );
    }

    const userData = this.Utils.omitProperty(result as User, [
      "salt",
      "password",
      "status",
    ]);

    const newAccessToken = this.Utils.Token.signAccess({
      payload: userData,
    });
    const newRefreshToken = this.Utils.Token.signRefresh({
      userId: result.userId,
    });

    if (!newAccessToken || !newRefreshToken) {
      return this.responseHandler(
        res,
        this.HTTP_STATUS.BAD_REQUEST,
        this.HTTP_MSG.BAD_REQUEST,
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
      userId: result.userId,
      token: newRefreshToken,
    });

    this.Utils.Cookie.setAccessCookie(res, newAccessToken);
    this.Utils.Cookie.setRefreshCookie(res, newRefreshToken);

    return this.responseHandler(
      res,
      this.HTTP_STATUS.SUCCESS,
      this.HTTP_MSG.SUCCESS,
      userData,
    );
  }
}

export default UpdateUserController;
