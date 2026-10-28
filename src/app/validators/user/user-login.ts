import BaseMiddleWare from "@/core/base/base-middleware.js";
import { Request, Response, NextFunction } from "express";

class SignInUserValidator extends BaseMiddleWare {
  protected async middleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const schema = this.z.object({
      email: this.z.email("Invalid email address").trim(),
      password: this.z.string("Password is required").trim(),
    });

    this.bodyHandler(req, res, next, schema);
  }
}

export default SignInUserValidator;
