export type Signup = {
  email: string;
  fullname: string;
  password: string;
};

export type JwtPayload = {
  payload: {
    user_id: string;
    name: string;
    email: string;
    createdAt: string;
  };
  iat: number;
  exp: number;
};

export type LogIn = {
  email: string;
  fullname?: string;
  password: string;
};

export type RefreshPayload = { user_id: string };

export type AccessPayload = Omit<JwtPayload, "iat" | "exp">;

export type RefreshPayload = { user_id: string };

export type VerifiedRefreshPayload = RefreshPayload & {
  iat: number;
  exp: number;
};
