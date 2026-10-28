import { Request, Response } from "express";
import BaseController from "@/core/base/base-controller.js";
import type { Signup } from "@/types/user.js";

class CreateUserController extends BaseController {
  protected async module(
    req: Request,
    res: Response,
  ): Promise<void | Response> {
    const data = req.body as Signup;

    const result = await this.Service.UserServices.CreateUser.call(data);

    if (!result) {
      return this.responseHandler(
        res,
        this.HTTP_STATUS.BAD_REQUEST,
        this.HTTP_MSG.BAD_REQUEST,
      );
    }

    const userData = this.Utils.omitProperty(result, [
      "password",
      "salt",
      "status",
    ]);

    const accessToken = this.Utils.Token.signAccess({
      payload: userData,
    });
    const refreshToken = this.Utils.Token.signRefresh({
      userId: userData.userId,
    });

    await this.Service.RefreshTokenServices.SaveRefreshToken.call({
      userId: result.userId,
      token: refreshToken,
    });

    this.Utils.Cookie.setAccessCookie(res, accessToken);
    this.Utils.Cookie.setRefreshCookie(res, refreshToken);

    return this.responseHandler(
      res,
      this.HTTP_STATUS.CREATED,
      this.HTTP_MSG.CREATED,
      userData,
    );
  }
}

export default CreateUserController;
