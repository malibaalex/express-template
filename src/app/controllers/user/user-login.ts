import { Request, Response } from "express";
import BaseController from "@/core/base/base-controller.js";
import { type User } from "@/generated/prisma/client.js";
import { type SignIn } from "@/types/user.js";

class LogInUserController extends BaseController {
  protected async module(
    req: Request,
    res: Response,
  ): Promise<void | Response> {
    const body: SignIn = req.body;

    const result = await this.Service.UserServices.SignInUser.call(body);
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

    const accessToken = this.Utils.Token.signAccess({
      payload: userData,
    });
    const refreshToken = this.Utils.Token.signRefresh({
      userId: userData.userId,
    });

    if (!accessToken || !refreshToken) {
      return this.responseHandler(
        res,
        this.HTTP_STATUS.BAD_REQUEST,
        this.HTTP_MSG.BAD_REQUEST,
      );
    }

    await this.Service.RefreshTokenServices.SaveRefreshToken.call({
      userId: result.userId,
      token: refreshToken,
    });

    this.Utils.Cookie.setAccessCookie(res, accessToken);
    this.Utils.Cookie.setRefreshCookie(res, refreshToken);

    return this.responseHandler(
      res,
      this.HTTP_STATUS.SUCCESS,
      this.HTTP_MSG.SUCCESS,
      userData,
    );
  }
}

export default LogInUserController;
