import { Request, Response, NextFunction, Router } from "express";
import { IRoute } from "@/types/app.js";
import Controllers from "@/app/controllers/index.js";
import Middlewares from "@/app/middlewares/index.js";

class GetUserRoute implements IRoute {
  path: string;
  router;

  constructor(path: string) {
    this.path = path;
    this.router = Router();
    this.initRoute();
  }

  private initRoute(): void {
    this.router.route(`${this.path}profile`).get(
      (req: Request, res: Response, next: NextFunction) =>
        Middlewares.UserMiddleWares.UserAuth.run(req, res, next),
      (req: Request, res: Response) =>
        Controllers.UserControllers.GetUser.execute(req, res),
    );
  }
}

export default GetUserRoute;
