import { Request, Response, NextFunction } from "express";
import Base from "@/core/base/base.js";

class ErrorHandler extends Base {
  // Arrow function so `this` stays bound when Express calls it.
  // The 4-parameter signature is how Express recognizes an error handler,
  // so `_next` must stay even though it's unused.
  public handle = (
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ): Response | void => {
    if (res.headersSent) return;

    // Body parsers (e.g. express.json() on malformed JSON) throw errors
    // carrying status 400. That's a client mistake, not a server fault,
    // so return 400 instead of a misleading 500.
    const status = (err as { status?: number }).status;
    if (status === 400) {
      return this.responseHandler(
        res,
        this.HTTP_STATUS.BAD_REQUEST,
        this.HTTP_MSG.BAD_REQUEST,
      );
    }

    console.error(err);

    return this.responseHandler(
      res,
      this.HTTP_STATUS.SERVER_ERROR,
      this.HTTP_MSG.SERVER_ERROR,
    );
  };
}

export default ErrorHandler;
