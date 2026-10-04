import request from "supertest";

import App from "@/app/app.js";
import routes from "@/app/routes/index.js";

export const createTestApp = () => new App(routes).instance;

export const api = () => request(createTestApp());
