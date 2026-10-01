import { NextFunction, Request, Response } from "express";
import { ZodError, z } from "zod";

import Base from "@/core/base/base.js";

abstract class BaseMiddleWare extends Base {
  protected z = z;

  protected bodyHandler(
    req: Request,
    res: Response,
    next: NextFunction,
    schema: z.ZodType,
  ): Response | void {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      return this.zodError(res, result.error);
    }
    return next();
  }

  protected paramHandler(
    req: Request,
    res: Response,
    next: NextFunction,
    schema: z.ZodType,
  ): Response | void {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return this.zodError(res, result.error);
    }
    return next();
  }

  protected queryHandler(
    req: Request,
    res: Response,
    next: NextFunction,
    schema: z.ZodType,
  ): Response | void {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return this.zodError(res, result.error);
    }
    return next();
  }

  zodError(res: Response, error: ZodError): Response {
    const message = error.issues[0].message.replace(/[^a-zA-Z0-9 ]/g, "");
    return this.responseHandler(res, this.HTTP_STATUS.BAD_REQUEST, message);
  }

  protected abstract middleware(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void;

  public async run(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await this.middleware(req, res, next);
    } catch (error) {
      console.error("Middleware error:", error);
      this.responseHandler(
        res,
        this.HTTP_STATUS.SERVER_ERROR,
        this.HTTP_MSG.SERVER_ERROR,
      );
    }
  }
}

export default BaseMiddleWare;
