import { describe, expect, it } from "vitest";

import { browser, newUser, ROUTES } from "../helpers/app.js";

describe("POST /logout", () => {
  it("logs the user out", async () => {
    const agent = browser();
    await agent.post(ROUTES.signup).send(newUser());

    const res = await agent.post(ROUTES.logout);
    const profile = await agent.get(ROUTES.profile);

    expect(res.status).toBe(200);
    expect(profile.status).toBe(401);
  });

  it("returns 200 even when not logged in", async () => {
    const res = await browser().post(ROUTES.logout);

    expect(res.status).toBe(200);
  });
});
