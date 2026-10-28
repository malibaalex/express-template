# Getting Started

You need Node.js 24+, pnpm (pinned in `packageManager`, enable it with `corepack enable`), and a PostgreSQL database (local, Neon, Supabase, anything).

```bash
pnpm install
cp .env.example .env
```

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
pnpm prisma:generate   # generate the client (needed after every schema change)
pnpm prisma:migrate    # create and apply a migration in dev
```

## Scripts

| Command              | What it does                                     |
| -------------------- | ------------------------------------------------ |
| `pnpm dev`           | Dev server with hot reload (nodemon)             |
| `pnpm build`         | Compile to `dist/` (`tsc` + `tsc-alias`)         |
| `pnpm start`         | Run the compiled server                          |
| `pnpm test`          | Run the endpoint tests once                      |
| `pnpm test:watch`    | Re-run tests on change                           |
| `pnpm test:coverage` | Tests plus a coverage report                     |
| `pnpm check`         | Lint, format check and type-check (what CI runs) |
| `pnpm lint`          | ESLint (add `--fix` to auto-fix)                 |
| `pnpm format`        | Prettier, writes changes                         |
| `pnpm typecheck`     | `tsc --noEmit`                                   |
| `pnpm prisma:deploy` | Apply migrations in production                   |

There are no Git hooks, so run `pnpm check` before you commit. CI runs `pnpm check` and `pnpm test`, then builds the Docker image.