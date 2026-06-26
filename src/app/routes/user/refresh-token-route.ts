import { Request, Response, Router } from "express";
import { IRoute } from "@/types/app.js";
import Controllers from "@/app/controllers/index.js";

class RefreshTokenRoute implements IRoute {
  path: string;
  router;

  constructor(path: string) {
    this.path = path;
    this.router = Router();
    this.initRoute();
  }

  private initRoute(): void {
    this.router
      .route(`${this.path}refresh`)
      .post((req: Request, res: Response) =>
        Controllers.UserControllers.RefreshToken.execute(req, res),
      );
  }
}

export default RefreshTokenRoute;
