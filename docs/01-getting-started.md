# Getting Started

You need [Vite+](https://viteplus.dev) (`vp`), Node.js 24+, and a PostgreSQL database (local, Neon, Supabase, anything). pnpm is the package manager (pinned in `packageManager`), and `vp install` uses it for you.

Install Vite+:

```bash
curl -fsSL https://vite.plus | bash   # macOS / Linux
irm https://vite.plus/ps1 | iex       # Windows (PowerShell)
```

Then, in the project:

```bash
vp install
cp .env.example .env
```

`vp install` also sets up the Git hooks (the `prepare` script runs `vp config`). On commit, staged files go through `vp check --fix`.

## Environment variables

Set these in `.env`. They are validated at startup in `src/core/utils/env-utils.ts`, so the app refuses to boot if a required one is missing.

| Variable                            | Required     | Default       | Notes                                   |
| ----------------------------------- | ------------ | ------------- | --------------------------------------- |
| `DATABASE_URL`                      | yes          |               | Postgres connection string              |
| `JWT_ACCESS_SECRET_KEY`             | yes          |               | Generate with `openssl rand -base64 48` |
| `JWT_REFRESH_SECRET_KEY`            | yes          |               | Same, use a different value             |
| `JWT_ACCESS_SECRET_KEY_EXPIRES_IN`  | yes          | `900`         | Seconds (15 min)                        |
| `JWT_REFRESH_SECRET_KEY_EXPIRES_IN` | yes          | `604800`      | Seconds (7 days)                        |
| `PORT`                              | no           | `4001`        |                                         |
| `NODE_ENV`                          | no           | `development` | `production` turns on secure cookies    |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Compose only |               | Create the local Postgres container     |

## Database

```bash
vp run prisma:generate   # generate the client (needed after every schema change)
vp run prisma:migrate    # create and apply a migration in dev
```

## Scripts

| Command                  | What it does                                       |
| ------------------------ | -------------------------------------------------- |
| `vp install`             | Install dependencies                               |
| `vp run dev`             | Dev server with hot reload (`tsx watch`)           |
| `vp run build`           | Compile to `dist/` (`tsc` + `tsc-alias`)           |
| `vp run start`           | Run the compiled server                            |
| `vp test`                | Run the endpoint tests once                        |
| `vp test watch`          | Re-run tests on change                             |
| `vp test run --coverage` | Tests plus a coverage report                       |
| `vp check`               | Format check, lint and type-check in one pass      |
| `vp check --fix`         | Same, and auto-fix what it can                     |
| `vp lint` / `vp fmt`     | Run the linter or the formatter on their own       |
| `vp run typecheck`       | Plain `tsc --noEmit` (`vp check` also type-checks) |
| `vp run prisma:deploy`   | Apply migrations in production                     |

> **`vp dev` and `vp build` are not the same as `vp run dev` and `vp run build`.**
> `vp dev` and `vp build` are Vite built-ins (dev server and bundler). This is a plain Node server, so use `vp run dev` and `vp run build`, which run the scripts from `package.json`.

The scripts in `package.json` are normal scripts, so `pnpm dev`, `pnpm build` and so on also work. Production and Docker only need pnpm and Node, never `vp` (see [Deployment](06-deployment.md)).

CI sets up Vite+, installs with `vp install --frozen-lockfile`, generates the Prisma client, then runs `vp check`, `vp test run --coverage` and the build, in that order.
