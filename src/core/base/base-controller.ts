import { Request, Response } from "express";

import Base from "./base.js";

abstract class BaseControlller extends Base {
  protected abstract module(
    req: Request,
    res: Response,
  ): Promise<void | Response>;

  public async execute(req: Request, res: Response): Promise<void | unknown> {
    try {
      await this.module(req, res);
    } catch (error) {
      console.error("Controller execution error:", error);
      this.responseHandler(
        res,
        this.HTTP_STATUS.SERVER_ERROR,
        this.HTTP_MSG.SERVER_ERROR,
      );
      return;
    }
  }
}

export default BaseControlller;
