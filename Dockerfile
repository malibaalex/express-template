# ==============================================================================
# STAGE 1: Base
# ==============================================================================
FROM node:24-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# Corepack reads "packageManager" from package.json and installs that pnpm version
RUN corepack enable

WORKDIR /app

# ==============================================================================
# STAGE 2: All dependencies (cached until package.json or the lockfile changes)
# ==============================================================================
FROM base AS deps

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ==============================================================================
# STAGE 3: Build (prisma generate + tsc + tsc-alias)
# ==============================================================================
FROM deps AS build

# prisma.config.ts needs DATABASE_URL to load. This dummy value is only used at
# build time, and nothing connects to it.
ARG DATABASE_URL="postgresql://postgres:postgres@localhost:5432/build"
ENV DATABASE_URL=$DATABASE_URL

COPY . .

RUN pnpm prisma:generate
RUN pnpm build

# ==============================================================================
# STAGE 4: Production-only dependencies
# ==============================================================================
FROM base AS prod-deps

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod

# ==============================================================================
# STAGE 5: Runtime
# ==============================================================================
FROM node:24-bookworm-slim AS runtime

ENV NODE_ENV=production
WORKDIR /app

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