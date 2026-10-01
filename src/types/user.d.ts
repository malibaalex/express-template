export type Signup = {
  email: string;
  fullName: string;
  password: string;
};

export type JwtPayload = {
  payload: {
    userId: string;
    fullName: string;
    email: string;
    createdAt: string;
  };
  iat: number;
  exp: number;
};

export type LogIn = {
  email: string;
  fullName?: string;
  password: string;
};

export type RefreshPayload = { userId: string };

export type AccessPayload = Omit<JwtPayload, "iat" | "exp">;

export type RefreshPayload = { userId: string };

export type VerifiedRefreshPayload = RefreshPayload & {
  iat: number;
  exp: number;
};
