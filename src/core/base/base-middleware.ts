import { NextFunction, Request, Response } from "express";
import { ZodSchema, ZodError, z } from "zod";

import Base from "@/core/base/base.js";

abstract class BaseMiddleWare extends Base {
  protected z = z;

  protected bodyHandler(
    req: Request,
    res: Response,
    next: NextFunction,
    schema: ZodSchema,
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
    schema: ZodSchema,
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
    schema: ZodSchema,
  ): Response | void {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      return this.zodError(res, result.error);
    }
    return next();
  }

  zodError(res: Response, error: ZodError): Response {
    const message = error.issues[0].message.replace(/[^a-zA-Z0-9 ]/g, "");
    return this.responseHandler(res, this.BAD_REQUEST_CODE, message);
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
      this.responseHandler(res, this.SERVER_ERROR_CODE, this.SERVER_ERROR_MSG);
    }
  }
}

export default BaseMiddleWare;
