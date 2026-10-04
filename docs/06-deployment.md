# Deployment

Pick one path:

| Option | Runs | Best for |
|---|---|---|
| A. VPS | Docker image + Compose | Full control, predictable cost |
| B. Container platform | Docker image | Managed hosting, same image as A |
| C. Vercel | Source code as a function | Small APIs, git-push deploys |

A and B use the same Docker image. CI builds it and pushes it to `ghcr.io/<owner>/<repo>` on every push to `develop`, but only if lint, format, typecheck, tests and build all pass. C doesn't use the image at all.

Never bake secrets into the image. Every option injects them at runtime.

---

## Option A: VPS (Docker Compose)

Compose runs three services: `api`, `db`, and `migrate` (only on demand).

**1. Set up the server.** Install Docker, then copy `docker-compose.yml`, `Dockerfile` and the project files onto it (or clone the repo).

**2. Create `.env`.**

```bash
cp .env.example .env
```

Set at least `DB_PASSWORD`, `JWT_ACCESS_SECRET_KEY`, `JWT_REFRESH_SECRET_KEY`, `NODE_ENV=production` and `IMAGE_NAME` (e.g. `ghcr.io/owner/repo`). Compose builds `DATABASE_URL` for the `api` service itself.

**3. Start the database, migrate, start the API.**

```bash
docker compose up -d db
docker compose --profile tools run --rm migrate
docker compose up -d api
```

**Update to a new version:**

```bash
docker compose pull api
docker compose --profile tools run --rm migrate
docker compose up -d api
```

Put a reverse proxy (Caddy or Nginx) in front for HTTPS. Auth cookies are `secure` in production, so HTTPS is required.

---

## Option B: Container platform

Cloud Run, ECS/Fargate, Azure Container Apps, Fly.io, Railway, Render, and similar. Deploy the image as is.

Don't deploy the Compose `db` or `migrate` services, and don't carry over volumes, networks, `depends_on` or port mappings. The platform replaces all of them.

**1. Create a managed PostgreSQL database** (Neon, Supabase, RDS, Cloud SQL). It usually needs `?sslmode=require`. Many instances can open connections at once, so use the provider's pooled connection string if it has one.

**2. Give the platform the image.** CI already pushes to `ghcr.io`. Point the platform at it (private images need a registry credential) or push the same image to the platform's own registry.

**3. Create the service from the image.** Set the container port to match `PORT` (default `4001`). Many platforms inject `PORT` themselves, and the app reads it.

**4. Set environment variables in the platform's secret store.**

| Variable | Value |
|---|---|
| `DATABASE_URL` | Managed DB connection string |
| `JWT_ACCESS_SECRET_KEY` | secret |
| `JWT_REFRESH_SECRET_KEY` | secret |
| `NODE_ENV` | `production` |
| `JWT_*_EXPIRES_IN` | optional |

**5. Run migrations before the new revision gets traffic.** The runtime image has no Prisma CLI, so run them from CI or the platform's release command:

```bash
pnpm install --frozen-lockfile
DATABASE_URL="<managed db url>" pnpm prisma:deploy
```

Store the real `DATABASE_URL` as a repository secret and use it only in this step. Don't reuse the dummy value from the build job. If your platform runs the release command from your image, use the `build` target (it contains Prisma), not `runtime`.

Always use `prisma migrate deploy` in production, never `migrate dev`.

**6. Deploy and check.**

```bash
curl https://<your-service-url>/
# {"status":200,"message":"welcome to the API"}
```

Keep the app stateless (sessions live in the DB, not in memory) so the platform can scale and restart it freely.

---

## Option C: Vercel (no Docker)

Vercel runs the Express app as a single function. The `Dockerfile`, Compose file and GHCR job are unused on this path. Use managed PostgreSQL as in Option B.

### Code change

Vercel needs the Express app exported instead of calling `listen()`. The `instance` getter on `App` already exists (the tests use it), so only `src/index.ts` changes:

```ts
import App from "@/app/app.js";
import routes from "@/app/routes/index.js";

const app = new App(routes);

if (!process.env.VERCEL) {
  app.listen();
}

export default app.instance;
```

`pnpm dev` and Docker keep working because `VERCEL` is only set on Vercel.

### Steps

**1. Create a managed PostgreSQL database** and copy the **pooled** connection string. Every function instance opens its own connections.

**2. Import the repo in Vercel** (dashboard or `vercel` CLI).

**3. Add `vercel.json`** at the project root:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm prisma:generate && pnpm build"
}
```

The Prisma client is generated into `src/generated/prisma` (gitignored), so it has to be generated at build time. `pnpm build` already uses `tsconfig.build.json`, so tests are excluded. You can set the same command in Project Settings instead; if both exist, `vercel.json` wins.

**4. Set environment variables** (Project Settings → Environment Variables) for Production and Preview, and make them available at build time because `prisma.config.ts` reads `DATABASE_URL`:

`DATABASE_URL`, `JWT_ACCESS_SECRET_KEY`, `JWT_REFRESH_SECRET_KEY`, `NODE_ENV=production`.

**5. Run migrations from CI, not from Vercel.** Vercel has no release step for this:

```bash
pnpm install --frozen-lockfile
DATABASE_URL="<managed db url>" pnpm prisma:deploy
```

Run it before promoting a deployment that changes the schema.

**6. Deploy a preview first and check it.**

```bash
curl https://<your-project>.vercel.app/
```

> **Check on the first preview deploy:** the `@/` path aliases. Your build resolves them with `tsc-alias`, but Vercel compiles the entry file itself and may not. If imports fail, switch to relative imports or bundle with `tsup`/`esbuild`. Also confirm the entry file location against Vercel's Express docs.

### Limits to know

- No long-running processes, background workers or WebSockets.
- Function limits apply (bundle size, execution time).
- Many instances means many DB connections, so use the pooled connection string.
- Migrations run separately from CI.
- Cost can exceed a small VPS at steady high traffic.

Choose Vercel for a small API, a prototype, or when your frontend is already there. Choose A or B for one portable image, long-running work, or predictable cost.