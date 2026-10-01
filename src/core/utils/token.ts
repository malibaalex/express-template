import jwt from "jsonwebtoken";
import type { Request } from "express";
import type { Env } from "./env-utils.js";
import {
  AccessPayload,
  JwtPayload,
  RefreshPayload,
  VerifiedRefreshPayload,
} from "@/types/user.js";

type JwtEnv = Pick<
  Env,
  | "JWT_ACCESS_SECRET_KEY"
  | "JWT_ACCESS_SECRET_KEY_EXPIRES_IN"
  | "JWT_REFRESH_SECRET_KEY"
  | "JWT_REFRESH__SECRET_KEY_EXPIRES_IN"
>;

export type ExtractResult = { token: string; source: "cookie" | "header" };

class TokenUtils {
  constructor(private readonly env: JwtEnv) {}

  signAccess(payload: AccessPayload): string {
    return jwt.sign(payload, this.env.JWT_ACCESS_SECRET_KEY, {
      expiresIn: this.env.JWT_ACCESS_SECRET_KEY_EXPIRES_IN,
    });
  }

  signRefresh(payload: RefreshPayload): string {
    return jwt.sign(payload, this.env.JWT_REFRESH_SECRET_KEY, {
      expiresIn: this.env.JWT_REFRESH__SECRET_KEY_EXPIRES_IN,
    });
  }

  verifyAccess(token: string): JwtPayload | null {
    return this.verify<JwtPayload>(token, this.env.JWT_ACCESS_SECRET_KEY);
  }

  verifyRefresh(token: string): VerifiedRefreshPayload | null {
    return this.verify<VerifiedRefreshPayload>(
      token,
      this.env.JWT_REFRESH_SECRET_KEY,
    );
  }

  extractAccess(req: Request): ExtractResult | null {
    const fromCookie = (req.cookies as Record<string, unknown> | undefined)
      ?.access_token;
    if (typeof fromCookie === "string") {
      return { token: fromCookie, source: "cookie" };
    }

    const authorization = req.headers.authorization || "";
    if (authorization.startsWith("Bearer ")) {
      return { token: authorization.slice(7), source: "header" };
    }

    return null;
  }

  extractRefresh(req: Request): string | null {
    const fromCookie = (req.cookies as Record<string, unknown> | undefined)
      ?.refresh_token;
    return typeof fromCookie === "string" ? fromCookie : null;
  }

  private verify<T>(token: string, secret: string): T | null {
    try {
      const decoded = jwt.verify(token, secret);
      if (!decoded || typeof decoded === "string") return null;
      return decoded as unknown as T;
    } catch {
      return null;
    }
  }
}

export default TokenUtils;
