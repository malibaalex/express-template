import { Request, Response } from "express";
import Util from "@/core/utils/index.js";
import Services from "@/database/services/index.js";
import { HTTP_MSG, HTTP_STATUS } from "../utils/constants.js";

class Base {
  protected readonly Utils = Util;
  protected readonly Service = Services;
  protected readonly HTTP_STATUS = HTTP_STATUS;
  protected readonly HTTP_MSG = HTTP_MSG;

  protected listening(port: number | boolean): string {
    const message = `App listening on port ${port}`;

    if (this.Utils.env.NODE_ENV === "development") {
      console.log(message);
    }

    return message;
  }

  protected welcome(_req: Request, res: Response): Response {
    return this.responseHandler(
      res,
      this.HTTP_STATUS.SUCCESS,
      this.HTTP_MSG.WELCOME,
      {
        timestamp: new Date().toISOString(),
        port: this.Utils.port,
      },
    );
  }

  protected responseHandler(
    res: Response,
    httpCode: number,
    message: string,
    data?: unknown,
  ): Response {
    return res.status(httpCode).json({
      status: httpCode,
      message,
      data,
    });
  }
}

export default Base;
