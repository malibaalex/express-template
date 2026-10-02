# Express Template

Express 5 + TypeScript + Prisma + PostgreSQL backend template with JWT auth (access + refresh tokens) and a class-based, layered structure.

## Quick start

```bash
pnpm install
cp .env.example .env     # fill in DATABASE_URL and JWT secrets
pnpm prisma:generate
pnpm prisma:migrate
pnpm dev                 # http://localhost:4001
```

## Docs

- [Getting started](docs/01-getting-started.md)
- [Architecture](docs/02-architecture.md)
- [API](docs/03-api.md)
- [Adding endpoints](docs/04-adding-endpoints.md)
- [Deployment (VPS or serverless)](docs/05-deployment.md)

## License

ISC