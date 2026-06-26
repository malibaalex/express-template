import BaseMiddleWare from "@/core/base/base-middleware.js";
import { Request, Response, NextFunction } from "express";

class UpdateUserValidator extends BaseMiddleWare {
  protected async middleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const schema = this.z.object({
      fullname: this.z.string().optional(),
      email: this.z.string().email().optional(),
      password: this.z.string().min(6).optional(),
    });

    this.bodyHandler(req, res, next, schema);
  }
}

export default UpdateUserValidator;
