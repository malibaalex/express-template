import BaseMiddleWare from "@/core/base/base-middleware.js";
import { Request, Response, NextFunction } from "express";

class SignupUserValidator extends BaseMiddleWare {
  protected async middleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const schema = this.z.object({
      fullname: this.z.string(),
      email: this.z.email(),
      password: this.z.string().min(6),
    });

    this.bodyHandler(req, res, next, schema);
  }
}

export default SignupUserValidator;
