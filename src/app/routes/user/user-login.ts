import { Request, Response, NextFunction, Router } from "express";
import { IRoute } from "@/types/app.js";
import Controllers from "@/app/controllers/index.js";
import Validators from "@/app/validators/index.js";

class SignInUserRoute implements IRoute {
  path: string;
  router;

  constructor(path: string) {
    this.path = path;
    this.router = Router();
    this.initRoute();
  }

  private initRoute(): void {
    this.router.route(`${this.path}signin`).post(
      (req: Request, res: Response, next: NextFunction) =>
        Validators.UserValidators.SignIn.run(req, res, next),

      (req: Request, res: Response) =>
        Controllers.UserControllers.SignIn.execute(req, res),
    );
  }
}

export default SignInUserRoute;
