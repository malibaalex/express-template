import { describe, expect, it } from "vitest";

import { api, newUser, ROUTES } from "../helpers/app.js";

describe("POST /signup", () => {
  it("creates a user and sets cookies", async () => {
    const user = newUser();
    const res = await api().post(ROUTES.signup).send(user);

    expect(res.status).toBe(201);
    expect(res.headers["set-cookie"]).toHaveLength(2);
    expect(JSON.stringify(res.body)).toContain(user.email);
    expect(JSON.stringify(res.body)).not.toContain(user.password);
  });

  it("rejects a duplicate email", async () => {
    const user = newUser();
    await api().post(ROUTES.signup).send(user);

    const res = await api().post(ROUTES.signup).send(user);

    expect([400, 409]).toContain(res.status);
  });

  it.each([
    ["missing fullName", { email: "a@b.com", password: "secret123" }],
    ["invalid email", { ...newUser(), email: "nope" }],
    ["short password", { ...newUser(), password: "123" }],
  ])("returns 400 for %s", async (_label, body) => {
    const res = await api().post(ROUTES.signup).send(body);

    expect(res.status).toBe(400);
  });
});
