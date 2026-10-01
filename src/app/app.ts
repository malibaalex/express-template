import express, { Response, Request, Application } from "express";
import cookieParser from "cookie-parser";

import Base from "@/core/base/base.js";
import { IRoute } from "@/types/app.js";

class App extends Base {
  private app: Application;

  constructor(routes: IRoute[]) {
    super();
    this.app = express();
    this.initMiddlewares();
    this.initRoutes(routes);
    this.initDefaultRoute();
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

  public listen(): void {
    this.app.listen(this.Utils.port, () => {
      this.listening(this.Utils.port);
    });
  }
}

export default App;
