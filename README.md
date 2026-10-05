# Express Template

Express 5 + TypeScript + Prisma + PostgreSQL, with JWT auth (access + refresh tokens) already wired up. Clone it, add your resources, ship.

What you get:

- **A working starting point**: Express 5, TypeScript, Prisma and PostgreSQL already connected, with JWT auth (access + refresh tokens) wired up
- **Example auth endpoints** (signup, signin, logout, refresh, profile, update profile) that show the pattern in action. Keep them, change them, or delete them to fit your app
- **A consistent structure**: every feature follows the same five-class layout, so adding a resource means repeating a pattern you've already seen (see [Adding endpoints](docs/04-adding-endpoints.md))
- **Endpoint tests** (Vitest + Supertest) that run against a real Postgres, as templates for testing your own routes
- **Deployment setup**: Dockerfile, Compose file and a CI pipeline that builds and pushes the image

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
5. [Testing](docs/05-testing.md): running and writing endpoint tests
6. [Deployment](docs/06-deployment.md): VPS, container platform, Vercel

## License

ISC