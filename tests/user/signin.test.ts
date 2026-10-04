import { describe, expect, it } from "vitest";

import { api, newUser, ROUTES } from "../helpers/app.js";

describe("POST /signin", () => {
  it("signs in and sets cookies", async () => {
    const user = newUser();
    await api().post(ROUTES.signup).send(user);

    const res = await api()
      .post(ROUTES.signin)
      .send({ email: user.email, password: user.password });

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toHaveLength(2);
    expect(JSON.stringify(res.body)).not.toContain(user.password);
  });

  it("returns 400 for a wrong password", async () => {
    const user = newUser();
    await api().post(ROUTES.signup).send(user);

    const res = await api()
      .post(ROUTES.signin)
      .send({ email: user.email, password: "wrong-password" });

    console.log("WRONG PASSWORD:", {
      status: res.status,
      body: res.body,
      text: res.text,
    });

    expect(res.status).toBe(400);
  });

  it("returns 400 for an unknown email", async () => {
    const res = await api()
      .post(ROUTES.signin)
      .send({ email: newUser().email, password: "secret123" });

    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid body", async () => {
    const res = await api().post(ROUTES.signin).send({ email: "nope" });

    expect(res.status).toBe(400);
  });
});
