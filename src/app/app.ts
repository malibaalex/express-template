import express, { Response, Request, NextFunction, Application } from "express";
import cookieParser from "cookie-parser";

import Base from "@/core/base/base.js";
import { IRoute } from "@/types/app.js";
import ErrorHandler from "./middlewares/error-handler.js";

class App extends Base {
  private app: Application;
  private errorHandler = new ErrorHandler();

  constructor(routes: IRoute[]) {
    super();
    this.app = express();
    this.initMiddlewares();
    this.initRoutes(routes);
    this.initDefaultRoute();
    this.initErrorHandler(); // must be registered last
  }

  private initMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initRoutes(routes: IRoute[]): void {
    routes.forEach((route) => {
      this.app.use("/api", route.router);
    });
  }

  private initDefaultRoute(): void {
    this.app.get("/", (_req: Request, res: Response) => {
      this.responseHandler(
        res,
        this.HTTP_STATUS.SUCCESS,
        this.HTTP_MSG.WELCOME,
      );
    });

    this.app.all("/", (_req: Request, res: Response) => {
      this.responseHandler(
        res,
        this.HTTP_STATUS.METHOD_NOT_ALLOWED,
        this.HTTP_MSG.INVALID_METHOD,
      );
    });

    this.app.use("*splat", (_req: Request, res: Response) => {
      this.responseHandler(
        res,
        this.HTTP_STATUS.NOT_FOUND,
        this.HTTP_MSG.INVALID_ROUTE,
      );
    });
  }

  private initErrorHandler(): void {
    this.app.use(this.errorHandler.handle);
  }

  public listen(): void {
    this.app.listen(this.Utils.port, () => {
      this.listening(this.Utils.port);
    });
  }
}

export default App;
