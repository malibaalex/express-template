# Getting Started

## Requirements

- Node.js 24+
- pnpm
- A PostgreSQL database (local, Neon, Supabase, ...)

## Install

```bash
pnpm install
cp .env.example .env
```

## Environment variables

Edit `.env`. Every variable is validated at startup (`src/core/utils/env-utils.ts`); the app won't boot if a required one is missing.

| Variable | Required | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | yes | | Postgres connection string |
| `JWT_ACCESS_SECRET_KEY` | yes | | `openssl rand -base64 48` |
| `JWT_ACCESS_SECRET_KEY_EXPIRES_IN` | no | `900` | Seconds (15 min) |
| `JWT_REFRESH_SECRET_KEY` | yes | | `openssl rand -base64 48` |
| `JWT_REFRESH_SECRET_KEY_EXPIRES_IN` | no | `604800` | Seconds (7 days) |
| `PORT` | no | `4001` | |
| `NODE_ENV` | no | `development` | `production` enables secure cookies |
| `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Docker Compose only | | Used to create the local Postgres container |

## Database

```bash
pnpm prisma:generate   # generate the Prisma client
pnpm prisma:migrate    # create/apply migrations (dev)
```

## Run

```bash
pnpm dev               # hot reload
pnpm build && pnpm start
```

## Scripts

| Script | Does |
|---|---|
| `pnpm dev` | Dev server (nodemon + tsx) |
| `pnpm build` | Compile TS and rewrite `@/` aliases |
| `pnpm start` | Run `dist/index.js` |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm format` / `format:check` | Prettier |
| `pnpm prisma:generate` | Generate Prisma client |
| `pnpm prisma:migrate` | `prisma migrate dev` |
| `pnpm prisma:deploy` | `prisma migrate deploy` (production) |