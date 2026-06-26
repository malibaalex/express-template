import { Response } from "express";

const IS_PROD = process.env.NODE_ENV === "production";

const BASE_OPTIONS = {
  httpOnly: true,
  secure: IS_PROD,
  sameSite: "strict" as const,
};

export const setAccessCookie = (res: Response, token: string): void => {
  res.cookie("access_token", token, {
    ...BASE_OPTIONS,
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
};

export const setRefreshCookie = (res: Response, token: string): void => {
  res.cookie("refresh_token", token, {
    ...BASE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie("access_token", BASE_OPTIONS);
  res.clearCookie("refresh_token", BASE_OPTIONS);
};
