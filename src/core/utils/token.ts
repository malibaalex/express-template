import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request } from "express";

dotenv.config();

const { JWT_SECRET_KEY, JWT_REFRESH_SECRET_KEY } = process.env;

export default class TokenUtils {
  protected secret_key = JWT_SECRET_KEY;
  protected refresh_secret_key = JWT_REFRESH_SECRET_KEY;

  generateAccess(payload: Record<string, unknown>): string | null {
    if (!Object.keys(payload).length) return null;
    return jwt.sign({ payload }, this.secret_key as string, {
      expiresIn: "15m",
    });
  }

  generateRefresh(payload: Record<string, unknown>): string | null {
    if (!Object.keys(payload).length) return null;
    return jwt.sign({ payload }, this.refresh_secret_key as string, {
      expiresIn: "7d",
    });
  }

  decodeAccess(token: string): jwt.JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret_key as string);
      if (typeof decoded === "string") return null; // narrow out the string case
      return decoded;
    } catch {
      return null;
    }
  }

  decodeRefresh(token: string): jwt.JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.refresh_secret_key as string);
      if (typeof decoded === "string") return null;
      return decoded;
    } catch {
      return null;
    }
  }

  extract(req: Request): { token: string; source: "cookie" | "header" } | null {
    const fromCookie: string | undefined = req.cookies?.access_token;
    if (fromCookie) return { token: fromCookie, source: "cookie" };

    const { authorization = "" } = req.headers;
    if (authorization.startsWith("Bearer ")) {
      return { token: authorization.slice(7), source: "header" };
    }

    return null;
  }

  extractRefresh(req: Request): string | null {
    return req.cookies?.refresh_token ?? null;
  }
}
