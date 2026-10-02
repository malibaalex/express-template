# ==============================================================================
# STAGE 1: Base
# ==============================================================================
FROM node:24-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Corepack reads "packageManager" from package.json and installs that pnpm version.
RUN corepack enable

WORKDIR /app

# ==============================================================================
# STAGE 2: All dependencies
# ==============================================================================
FROM base AS deps

# pnpm-workspace.yaml holds the approved build scripts (prisma, esbuild, etc.).
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ==============================================================================
# STAGE 3: Build
# ==============================================================================
FROM deps AS build

# --------------------------------------------------------------------------
# SECURITY NOTE:
# DATABASE_URL below is ONLY a dummy build-time value so Prisma config can
# load during `prisma generate`.
#
# NEVER put a real database URL, password, API key, JWT secret, or other
# credential here.
#
# Real secrets must be supplied at runtime through environment variables or
# your deployment platform's secret manager.
# --------------------------------------------------------------------------
ARG DATABASE_URL="postgresql://postgres:postgres@localhost:5432/build"
ENV DATABASE_URL=$DATABASE_URL

COPY . .

RUN pnpm prisma:generate
RUN pnpm build

# ==============================================================================
# STAGE 4: Production-only dependencies
# ==============================================================================
FROM base AS prod-deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod

# ==============================================================================
# STAGE 5: Runtime
# ==============================================================================
FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

# --------------------------------------------------------------------------
# SECURITY NOTE:
# NODE_ENV is safe to bake into the image.
#
# Do NOT add application secrets here, for example:
#
#   ENV DATABASE_URL="..."
#   ENV JWT_ACCESS_SECRET="..."
#   ENV JWT_REFRESH_SECRET="..."
#   ENV API_KEY="..."
#
# Runtime secrets should be injected by Docker Compose, the hosting
# platform, or another secret-management mechanism.
# --------------------------------------------------------------------------

RUN apt-get update && \
    apt-get upgrade -y && \
    rm -rf /var/lib/apt/lists/*

RUN groupadd --system nodeapp && useradd --system --gid nodeapp nodeapp

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

USER nodeapp

EXPOSE 4001

CMD ["node", "dist/index.js"]
