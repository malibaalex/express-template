import { describe, expect, it } from "vitest";

import { api, browser, newUser, ROUTES } from "../helpers/app.js";

describe("PUT /update/:id", () => {
  it("returns 401 when not logged in", async () => {
    const res = await api().put(ROUTES.update()).send({ email: "a@b.com" });

    expect(res.status).toBe(401);
  });

  it("updates the logged in user", async () => {
    const agent = browser();
    const user = newUser();

    await agent.post(ROUTES.signup).send(user);

    const updatedEmail = `updated-${crypto.randomUUID()}@example.com`;

    const res = await agent.put(ROUTES.update()).send({ email: updatedEmail });

    const profile = await agent.get(ROUTES.profile);

    expect(res.status).toBe(200);
    expect(JSON.stringify(profile.body)).toContain(updatedEmail);
  });

  it("returns 400 for invalid data", async () => {
    const agent = browser();
    await agent.post(ROUTES.signup).send(newUser());

    const res = await agent.put(ROUTES.update()).send({ email: "nope" });

    expect(res.status).toBe(400);
  });
});
