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
        this.UNAUTHORIZED_CODE,
        this.UNAUTHORIZED_MSG,
      );
    }

    const userData = this.Utils.omitProperty(user as User, [
      "salt",
      "password",
      "status",
    ]);

    return this.responseHandler(
      res,
      this.SUCCESS_CODE,
      this.SUCCESS_MSG,
      userData,
    );
  }
}

export default GetUserController;
