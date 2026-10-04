import request from "supertest";

import App from "@/app/app.js";
import routes from "@/app/routes/index.js";

const app = new App(routes).instance;

export const api = () => request(app);

export const browser = () => request.agent(app);

export const ROUTES = {
  signup: "/api/auth/signup",
  signin: "/api/auth/signin",
  logout: "/api/auth/logout",
  refresh: "/api/auth/refresh",
  profile: "/api/auth/profile",
  update: (id = "me") => `/api/auth/update/${id}`,
};

export const newUser = () => ({
  fullName: "John Doe",
  email: `user-${crypto.randomUUID()}@example.com`,
  password: "secret123",
});
