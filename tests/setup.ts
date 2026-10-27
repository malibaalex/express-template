process.env.NODE_ENV = "test";
process.env.PORT = "0";
process.env.DATABASE_URL ??=
  "postgresql://postgres:postgres123@localhost:5432/template_db";
process.env.JWT_ACCESS_SECRET_KEY ??= "test-access-secret";
process.env.JWT_ACCESS_SECRET_KEY_EXPIRES_IN ??= "900";
process.env.JWT_REFRESH_SECRET_KEY ??= "test-refresh-secret";
process.env.JWT_REFRESH_SECRET_KEY_EXPIRES_IN ??= "604800";
