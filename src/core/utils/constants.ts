export const PORT = "4001";

export const HTTP_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  SERVER_ERROR: 500,
} as const;

export const HTTP_MSG = {
  SUCCESS: "success",
  CREATED: "created successfully",
  BAD_REQUEST: "bad request",
  UNAUTHORIZED: "unauthorized",
  NOT_FOUND: "not found",
  CONFLICT: "conflict",
  FORBIDDEN: "forbidden",
  SERVER_ERROR: "server error",
  WELCOME: "welcome to the API",
  INVALID_ROUTE: "invalid route",
  INVALID_METHOD: "invalid method",
  ALREADY_EXISTS: "already exists",
} as const;

export type HttpStatusCode = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
