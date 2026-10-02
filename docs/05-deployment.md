# Deployment

Options A and B use the same Docker image. It is built by CI (`.github/workflows/ci.yml`) and pushed to `ghcr.io/<owner>/<repo>` on every push to `develop`. Option C (Vercel) does not use the image; it runs your source code as a function. Pick one path below.

| Option | Runs | Best for |
|---|---|---|
| A. VPS | Docker image + Compose | Full control, predictable cost |
| B. Container platform | Docker image | Managed hosting, same image as A |
| C. Vercel | Source code as a function | Small APIs, git-push deploys, frontend already on Vercel |

| | VPS | Serverless / container platform |
|---|---|---|
| Database | Compose `db` service | Managed PostgreSQL |
| Migrations | Compose `migrate` service | Release step (CI or platform) |
| Config | `.env` file on the server | Platform env vars / secrets |
| Networking, restarts, TLS | Compose + you | Platform |

Never bake secrets into the image. Both paths inject them at runtime.

---

## Option A: VPS (Docker Compose)

Compose runs `api`, `db`, and `migrate` (the `migrate` service only runs on demand).

**1. Set up the server**

Install Docker, then copy `docker-compose.yml`, `Dockerfile`, and the project files (or clone the repo) onto the server.

**2. Create `.env`**

```bash
cp .env.example .env
```

Set at minimum: `DB_PASSWORD`, `JWT_ACCESS_SECRET_KEY`, `JWT_REFRESH_SECRET_KEY`, `NODE_ENV=production`, and `IMAGE_NAME` (e.g. `ghcr.io/owner/repo`). Compose builds `DATABASE_URL` for the `api` service itself.

**3. Start the database**

```bash
docker compose up -d db
```

**4. Run migrations**

```bash
docker compose --profile tools run --rm migrate
```

**5. Start the API**

```bash
docker compose up -d api
```

**Update to a new version**

```bash
docker compose pull api
docker compose --profile tools run --rm migrate
docker compose up -d api
```

Put a reverse proxy (Caddy or Nginx) in front for HTTPS. Auth cookies are `secure` in production, so HTTPS is required.

---

## Option B: Serverless / container platform

Examples: Google Cloud Run, AWS ECS/Fargate, Azure Container Apps, Fly.io, Railway, Render. The image is deployed as is; don't change it.

**Do not deploy** the Compose `db` or `migrate` services, and don't use Compose volumes, networks, `depends_on`, or port mappings. The platform replaces all of them.

**1. Create a managed PostgreSQL database**

Neon, Supabase, RDS, Cloud SQL, etc. Copy the connection string. It usually needs `?sslmode=require`. On serverless, many instances can open connections at once, so use the provider's pooled connection string if it has one.

**2. Make the image available to the platform**

CI already pushes to `ghcr.io`. Either:
- point the platform at the GHCR image (private images need a registry credential), or
- push the same image to the platform's own registry.

**3. Create the service from the image**

Set the container port to match `PORT` (default `4001`). Many platforms inject `PORT` themselves; the app already reads it.

**4. Set environment variables / secrets in the platform**

| Variable | Value |
|---|---|
| `DATABASE_URL` | Managed DB connection string (use the platform's secret store) |
| `JWT_ACCESS_SECRET_KEY` | secret |
| `JWT_REFRESH_SECRET_KEY` | secret |
| `NODE_ENV` | `production` |
| `JWT_*_EXPIRES_IN` | optional |

**5. Run migrations as part of the release**

The runtime image does not include the Prisma CLI, so run migrations from CI (or the platform's release/pre-deploy command) *before* the new revision receives traffic:

```bash
pnpm install --frozen-lockfile
DATABASE_URL="<managed db url>" pnpm prisma:deploy
```

In CI, store `DATABASE_URL` as a repository secret. Don't reuse the dummy value from the build job. If your platform has a release command that runs from your image, use the `build` target image (it contains Prisma), not `runtime`.

Always use `prisma migrate deploy` (`pnpm prisma:deploy`) in production, never `migrate dev`.

**6. Deploy and verify**

```bash
curl https://<your-service-url>/
# {"status":200,"message":"welcome to the API"}
```

### Who handles what

| Platform handles | Your app handles |
|---|---|
| Running and restarting containers | Reading config from env vars (`env-utils.ts`) |
| Scaling instances up and down | Staying stateless (sessions live in the DB, not memory) |
| HTTPS / TLS and the public URL | `secure` + `sameSite` cookies |
| Routing traffic to the container port | Listening on `PORT` |
| Storing and injecting secrets | Never logging or baking secrets |
| Hosting, backups, and patching of the managed DB | Schema, via `prisma migrate deploy` |
| Health checks (if configured) | Responding on `GET /` |

---

## Option C: Vercel (no Docker)

Vercel runs your Express app as a single Vercel Function. It does **not** use the Docker image, so the `Dockerfile`, Compose file, and the GHCR job in CI are unused on this path. Use managed PostgreSQL, as in Option B.

### Code changes (required)

Vercel needs the Express app exported instead of calling `listen()`.

**1. Expose the Express instance** in `src/app/app.ts`, inside the `App` class:

```ts
public get instance(): Application {
  return this.app;
}
```

**2. Export it** from `src/index.ts`, and only listen when running outside Vercel:

```ts
import App from "@/app/app.js";
import routes from "@/app/routes/index.js";

const app = new App(routes);

if (!process.env.VERCEL) {
  app.listen();
}

export default app.instance;
```

Local `pnpm dev` and Docker keep working because `VERCEL` is only set on Vercel.

### Steps

**1. Create a managed PostgreSQL database** and copy the **pooled** connection string. Every function instance opens its own connections, so pooling matters here.

**2. Import the repo in Vercel** (dashboard or `vercel` CLI).

**3. Set the build command** (Project Settings → Build and Deployment):

```
pnpm prisma:generate && pnpm build
```

The Prisma client is generated into `src/generated/prisma` (gitignored), so it must be generated at build time.

**4. Set environment variables** (Project Settings → Environment Variables). Add them for Production and Preview, and make sure they are available at build time, because `prisma.config.ts` reads `DATABASE_URL`:

`DATABASE_URL`, `JWT_ACCESS_SECRET_KEY`, `JWT_REFRESH_SECRET_KEY`, `NODE_ENV=production`.

**5. Run migrations from CI, not from Vercel.** Vercel has no release step for this:

```bash
pnpm install --frozen-lockfile
DATABASE_URL="<managed db url>" pnpm prisma:deploy
```

Run it before promoting a deployment that changes the schema.

**6. Deploy and verify** with a preview deployment first:

```bash
curl https://<your-project>.vercel.app/
```

> **Check on the first preview deploy:** the `@/` path aliases. Your build resolves them with `tsc-alias`, but Vercel compiles the entry file itself and may not. If imports fail, either switch to relative imports or bundle with a tool like `tsup`/`esbuild`. Also confirm the entry file location against Vercel's Express docs.

### Tradeoffs

| Pros | Cons |
|---|---|
| Git push → live, no servers or containers | Doesn't use your Docker image; two deploy models to maintain |
| HTTPS, scaling, and logs handled for you | Needs the code changes above |
| Free/cheap for low traffic | Function limits apply (250MB bundle, execution time caps) |
| Preview deployment per pull request | No long-running processes, background workers, or WebSockets |
| | Many instances → many DB connections; pooled connection string required |
| | Cost can exceed a small VPS at steady high traffic |
| | Migrations must be run separately from CI |

**Choose Vercel** for a small or medium API, a prototype, or when your frontend is already on Vercel. **Choose A or B** if you want one portable image, long-running work, or predictable cost.