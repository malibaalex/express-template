/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";

import Base from "@/core/base/base.js";

abstract class BaseControlller extends Base {
  protected abstract module(
    req: Request,
    res: Response,
  ): Promise<void | Response>;

  public async execute(req: Request, res: Response): Promise<void | any> {
    try {
      await this.module(req, res);
    } catch (error) {
      console.error("Controller execution error:", error);
      this.responseHandler(res, this.SERVER_ERROR_CODE, this.SERVER_ERROR_MSG);
      return;
    }
  }
}

export default BaseControlller;
