import BaseMiddleWare from "@/core/base/base-middleware.js";
import { Request, Response, NextFunction } from "express";

class IdValidator extends BaseMiddleWare {
  protected async middleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const schema = this.z.object({
      id: this.z.string().uuid(),
    });

    this.paramHandler(req, res, next, schema);
  }
}

export default IdValidator;
