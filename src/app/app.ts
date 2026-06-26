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
    this.app.get("/", (req: Request, res: Response) => {
      this.responseHandler(res, this.SUCCESS_CODE, this.WELCOME_MSG);
      return;
    });

    this.app.all("/", (req: Request, res: Response) => {
      this.responseHandler(res, this.BAD_REQUEST_CODE, this.INVALID_METHOD_MSG);
      return;
    });

    this.app.use("*splat", (req: Request, res: Response) => {
      this.responseHandler(res, this.NOT_FOUND_CODE, this.INVALID_ROUTE_MSG);
    });
    return;
  }

  public listen(): void {
    this.app.listen(this.Utils.port, () => {
      this.listening(this.Utils.port);
    });
  }
}

export default App;
