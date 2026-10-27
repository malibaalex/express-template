# Deployment

Not deployed yet.

What exists today:

- The `Dockerfile` builds the `runtime` image.
- `docker-compose.yml` runs the API and Postgres locally. See the steps below.
- CI runs `pnpm check` and `pnpm test`, then builds the image. It does not push it anywhere.

This page will describe the real VPS setup once it has been done and tested.

## Run it locally with Docker

```bash
cp .env.example .env     # set DB_PASSWORD and the JWT secrets
docker compose up -d db
docker compose --profile tools run --rm migrate
docker compose up -d api
curl localhost:4001/
```