# Testing

Tests hit the real endpoints through Supertest, against a real Postgres. No mocks, no spying on internals. If a test passes, the endpoint works.

## Run

Start a throwaway database once (port 5433 so it doesn't clash with your dev DB):

```bash
docker run -d --name test-db -p 5433:5432 \
  -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=test postgres:17
```

Then:

```bash
pnpm test
```

To use another database, set `DATABASE_URL` in your shell. The default in `tests/setup.ts` is only used when it's unset.

## How it works

```
tests/
  setup.ts          Sets test env vars before any src code loads
  global-setup.ts   Runs `prisma migrate deploy` once before all tests
  helpers/app.ts    api(), browser(), ROUTES, newUser()
  auth/             One file per endpoint
```

- `api()` is a plain request with no cookies. Use it for "not logged in" cases.
- `browser()` is an agent that keeps cookies between requests, like a real browser. Use it for anything that needs a session.
- `newUser()` returns a user with a random email. Every test signs up its own user, so tests don't depend on each other and there's nothing to clean up.
- `ROUTES` holds every URL. If you change a path, change it there.

Your `.env` is never read during tests. `setup.ts` sets the variables first and `dotenv` doesn't override existing ones.

## Writing a test

Sign up through the endpoint, then use the same agent:

```ts
const agent = browser();
await agent.post(ROUTES.signup).send(newUser());

const res = await agent.get(ROUTES.profile);
expect(res.status).toBe(200);
```

Rules of thumb:

- Test through HTTP only. Don't import services or controllers.
- Assert status codes, and the parts of the body you care about.
- Never reuse an email between tests. Use `newUser()`.
- One file per endpoint, grouped in a folder per module (`tests/auth/`, `tests/posts/`).

## Notes

- `tests/` is excluded from the production build (`tsconfig.build.json`) but still type-checked by `pnpm typecheck`.
- Add `tests`, `coverage` and `vitest.config.ts` to `.dockerignore` so they stay out of the image.
- CI starts a Postgres service and runs `pnpm test:coverage`. See `.github/workflows/ci.yml`.