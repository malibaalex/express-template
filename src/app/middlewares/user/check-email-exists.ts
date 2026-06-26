import BaseMiddleWare from "@/core/base/base-middleware.js";
import { Request, Response, NextFunction } from "express";

class CheckEmailExists extends BaseMiddleWare {
  protected async middleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const { email } = req.body;

    const user = await this.Service.UserServices.GetUserByEmail.call(email);

    if (user) {
      this.responseHandler(res, this.BAD_REQUEST_CODE, this.ALREAD_EXISTS_MSG);
    }

    return next();
  }
}

export default CheckEmailExists;
