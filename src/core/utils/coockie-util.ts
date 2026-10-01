import { Response, CookieOptions } from "express";
import { Env } from "./env-utils.js";

type CookieEnv = Pick<
  Env,
  | "NODE_ENV"
  | "JWT_ACCESS_SECRET_KEY_EXPIRES_IN"
  | "JWT_REFRESH__SECRET_KEY_EXPIRES_IN"
>;

export class CookieUtils {
  private readonly options: CookieOptions;

  constructor(private readonly env: CookieEnv) {
    this.options = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    };
  }

  setAccessCookie(res: Response, token: string): void {
    res.cookie("access_token", token, {
      ...this.options,
      maxAge: this.env.JWT_ACCESS_SECRET_KEY_EXPIRES_IN * 1000, // cookie maxAge is ms
    });
  }

  setRefreshCookie(res: Response, token: string): void {
    res.cookie("refresh_token", token, {
      ...this.options,
      maxAge: this.env.JWT_REFRESH__SECRET_KEY_EXPIRES_IN * 1000,
    });
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie("access_token", this.options);
    res.clearCookie("refresh_token", this.options);
  }
}
