import { describe, it, expect } from "vitest";

import { api } from "./helpers/app.js";

describe("App", () => {
  it("GET / returns the welcome response", async () => {
    const res = await api().get("/");
    expect(res.status).toBe(200);
  });

  it("returns 404 for unknown routes", async () => {
    const res = await api().get("/does-not-exist");
    expect(res.status).toBe(404);
  });

  it("returns 405 for wrong method on /", async () => {
    const res = await api().post("/");
    expect(res.status).toBe(405);
  });
});
