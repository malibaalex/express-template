import { describe, expect, it } from "vitest";

import { api, browser, newUser, ROUTES } from "../helpers/app.js";

describe("POST /refresh", () => {
  it("returns 401 without a refresh token", async () => {
    const res = await api().post(ROUTES.refresh);

    expect(res.status).toBe(401);
  });

  it("issues new cookies for a logged in user", async () => {
    const agent = browser();
    await agent.post(ROUTES.signup).send(newUser());

    const res = await agent.post(ROUTES.refresh);

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toHaveLength(2);
  });
});
