# Getting Started

You need Node.js 24+, pnpm, and a PostgreSQL database (local, Neon, Supabase, anything).

```bash
pnpm install
cp .env.example .env
```

## Environment variables

Set these in `.env`. They are validated at startup in `src/core/utils/env-utils.ts`, so the app refuses to boot if a required one is missing.

| Variable | Required | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | yes | | Postgres connection string |
| `JWT_ACCESS_SECRET_KEY` | yes | | Generate with `openssl rand -base64 48` |
| `JWT_REFRESH_SECRET_KEY` | yes | | Same, use a different value |
| `JWT_ACCESS_SECRET_KEY_EXPIRES_IN` | yes | `900` | Seconds (15 min) |
| `JWT_REFRESH_SECRET_KEY_EXPIRES_IN` | yes | `604800` | Seconds (7 days) |
| `PORT` | no | `4001` | |
| `NODE_ENV` | no | `development` | `production` turns on secure cookies |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Compose only | | Create the local Postgres container |

## Database

```bash
pnpm prisma:generate   # generate the client (needed after every schema change)
pnpm prisma:migrate    # create and apply a migration in dev
```

## Scripts

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server with hot reload |
| `pnpm build` / `pnpm start` | Compile to `dist/` and run it |
| `pnpm test` | Run the endpoint tests once |
| `pnpm test:watch` | Re-run tests on change |
| `pnpm test:coverage` | Tests plus a coverage report |
| `pnpm typecheck` | Type-check `src` and `tests` |
| `pnpm lint` | ESLint |
| `pnpm format` / `pnpm format:check` | Prettier (formatting is Prettier's job, not ESLint's) |
| `pnpm prisma:deploy` | Apply migrations in production |

CI runs lint, format check, typecheck, tests and build, in that order.