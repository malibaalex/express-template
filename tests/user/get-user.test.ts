import { describe, expect, it } from "vitest";

import { api, browser, newUser, ROUTES } from "../helpers/app.js";

describe("GET /profile", () => {
  it("returns 401 when not logged in", async () => {
    const res = await api().get(ROUTES.profile);

    expect(res.status).toBe(401);
  });

  it("returns the logged in user without secrets", async () => {
    const user = newUser();
    const agent = browser();
    await agent.post(ROUTES.signup).send(user);

    const res = await agent.get(ROUTES.profile);

    expect(res.status).toBe(200);
    expect(JSON.stringify(res.body)).toContain(user.email);
    expect(JSON.stringify(res.body)).not.toContain(user.password);
    expect(res.body).not.toHaveProperty("data.salt");
  });
});
