import { Request, Response } from "express";
import { User } from "@/generated/prisma/client.js";

import BaseControlller from "@/core/base/base-controller.js";
import {
  setAccessCookie,
  setRefreshCookie,
} from "@/core/utils/coockie-util.js";

class CreateUserController extends BaseControlller {
  protected async module(
    req: Request,
    res: Response,
  ): Promise<void | Response> {
    const data: User = req.body;

    const result = await this.Service.UserServices.CreateUser.call(data);

    if (!result) {
      return this.responseHandler(
        res,
        this.BAD_REQUEST_CODE,
        this.BAD_REQUEST_MSG,
      );
    }

    const userData = this.Utils.omitProperty(result as User, [
      "password",
      "salt",
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
      this.CREATED_CODE,
      this.CREATED_MSG,
      userData,
    );
  }
}

export default CreateUserController;
