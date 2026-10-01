import { Response } from "express";
import Util from "@/core/utils/index.js";
import Services from "@/database/services/index.js";
import { HTTP_STATUS, HTTP_MSG } from "./constants.js";

class Base {
  protected readonly Utils = Util;
  protected readonly Service = Services;
  protected readonly HTTP_STATUS = HTTP_STATUS;
  protected readonly HTTP_MSG = HTTP_MSG;

  protected listening(port: number | boolean): string {
    return `App listening on port ${port}`;
  }

  protected welcome(_req: Request, res: Response) {
    return this.responseHandler(
      res,
      this.HTTP_STATUS.SUCCESS,
      this.HTTP_MSG.WELCOME,
    );
  }

  protected responseHandler(
    res: Response,
    httpCode: number,
    message: string,
    data?: unknown,
  ): Response {
    return res.status(httpCode).json({ status: httpCode, message, data });
  }
}

export default Base;
