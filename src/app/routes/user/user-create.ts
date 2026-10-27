import { Request, Response, NextFunction, Router } from "express";
import { IRoute } from "@/types/app.js";
import Controllers from "@/app/controllers/index.js";
import Validators from "@/app/validators/index.js";
import MiddleWares from "@/app/middlewares/index.js";

class CreateUserRoute implements IRoute {
  path: string;
  router;

  constructor(path: string) {
    this.path = path;
    this.router = Router();
    this.initRoute();
  }

  private initRoute(): void {
    this.router.route(`${this.path}signup`).post(
      (req: Request, res: Response, next: NextFunction) =>
        Validators.UserValidators.Signup.run(req, res, next),

      (req: Request, res: Response, next: NextFunction) =>
        MiddleWares.UserMiddleWares.CheckEmail.run(req, res, next),

      (req: Request, res: Response) =>
        Controllers.UserControllers.CreateUser.execute(req, res),
    );
  }
}

export default CreateUserRoute;
