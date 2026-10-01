import { Request, Response } from "express";
import { User } from "@/generated/prisma/client.js";

import BaseControlller from "@/core/base/base-controller.js";

class GetUserController extends BaseControlller {
  protected async module(
    req: Request,
    res: Response,
  ): Promise<void | Response> {
    const user = req.currentUser;

    if (!user) {
      return this.responseHandler(
        res,
        this.HTTP_STATUS.UNAUTHORIZED,
        this.HTTP_MSG.UNAUTHORIZED,
      );
    }

    const userData = this.Utils.omitProperty(user as User, [
      "salt",
      "password",
      "status",
    ]);

    return this.responseHandler(
      res,
      this.HTTP_STATUS.SUCCESS,
      this.HTTP_MSG.SUCCESS,
      userData,
    );
  }
}

export default GetUserController;
