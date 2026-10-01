export type Signup = {
  email: string;
  fullName: string;
  password: string;
};

export type SignIn = {
  email: string;
  fullName?: string;
  password: string;
};

export type JwtPayload = {
  payload: {
    userId: string;
    email: string;
    fullName: string;
    createdAt: Date;
    updatedAt: Date;
  };
  iat: number;
  exp: number;
};

export type AccessPayload = Omit<JwtPayload, "iat" | "exp">;

export type RefreshPayload = { userId: string };

export type VerifiedRefreshPayload = RefreshPayload & {
  iat: number;
  exp: number;
};
