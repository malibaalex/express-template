import { Request, Response } from "express";
import BaseController from "@/core/base/base-controller.js";
import { type User } from "@/generated/prisma/client.js";
import { type LogIn } from "@/types/user.js";
import {
  setAccessCookie,
  setRefreshCookie,
} from "@/core/utils/coockie-util.js";

class LogInUserController extends BaseController {
  protected async module(
    req: Request,
    res: Response,
  ): Promise<void | Response> {
    const body: LogIn = req.body;

    const result = await this.Service.UserServices.SignInUser.call(body);
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
    const refreshToken = this.Utils.Token.generateRefresh({
      userId: result.user_id,
    });

    if (!accessToken || !refreshToken) {
      return this.responseHandler(
        res,
        this.BAD_REQUEST_CODE,
        this.BAD_REQUEST_MSG,
      );
    }

    await this.Service.RefreshTokenServices.SaveRefreshToken.call({
      userId: result.user_id,
      token: refreshToken,
    });

    setAccessCookie(res, accessToken);
    setRefreshCookie(res, refreshToken);

    return this.responseHandler(
      res,
      this.SUCCESS_CODE,
      this.SUCCESS_MSG,
      userData,
    );
  }
}

export default LogInUserController;
