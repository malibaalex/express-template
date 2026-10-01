import BaseMiddleWare from "@/core/base/base-middleware.js";
import { Request, Response, NextFunction } from "express";

class UserAuthentication extends BaseMiddleWare {
  protected async middleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const extracted = this.Utils.Token.extractAccess(req);

    if (!extracted) {
      this.responseHandler(
        res,
        this.HTTP_STATUS.UNAUTHORIZED,
        this.HTTP_MSG.UNAUTHORIZED,
      );
      return;
    }

    const decoded = this.Utils.Token.verifyAccess(extracted.token);

    if (!decoded) {
      this.responseHandler(
        res,
        this.HTTP_STATUS.UNAUTHORIZED,
        this.HTTP_MSG.UNAUTHORIZED,
      );
      return;
    }

    const user = await this.Service.UserServices.getUserById.call(
      decoded.payload.userId,
    );

    if (!user) {
      this.responseHandler(
        res,
        this.HTTP_STATUS.UNAUTHORIZED,
        this.HTTP_MSG.UNAUTHORIZED,
      );
      return;
    }

    req.currentUser = user;

    return next();
  }
}

export default UserAuthentication;
