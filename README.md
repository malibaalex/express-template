# Express Template

Express 5 + TypeScript + Prisma + PostgreSQL, with JWT auth (access + refresh tokens) already wired up. Clone it, add your resources, ship.

What you get:

- Signup, signin, logout, refresh, profile and update endpoints
- A layered structure where every feature is the same five small classes
- Endpoint tests (Vitest + Supertest) against a real Postgres
- Dockerfile, Compose file and a CI pipeline that builds and pushes the image

## Quick start

```bash
pnpm install
cp .env.example .env     # set DATABASE_URL and the two JWT secrets
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev                 # http://localhost:4001
```

Run the tests (needs a Postgres, see [Testing](docs/06-testing.md)):

```bash
pnpm test
```

## Docs

1. [Getting started](docs/01-getting-started.md): env vars, database, scripts
2. [Architecture](docs/02-architecture.md): how a request flows, where things live
3. [API](docs/03-api.md): endpoints, response format, auth
4. [Adding endpoints](docs/04-adding-endpoints.md): the main thing you'll do with this template
5. [Deployment](docs/05-deployment.md): VPS, container platform, Vercel
6. [Testing](docs/06-testing.md): running and writing endpoint tests

## License

ISC