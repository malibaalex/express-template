import { Router } from "express";
import { User } from "@/generated/prisma/client.js";

interface IRoute {
  path: string;
  router: Router;
}

declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}
