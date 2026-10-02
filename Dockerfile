# ==============================================================================
# STAGE 1: Base
# ==============================================================================
FROM node:24-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# ==============================================================================
# STAGE 2: Dependencies
# ==============================================================================
FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# ==============================================================================
# STAGE 3: Build
# ==============================================================================
FROM deps AS build

# SECURITY:
# This is a dummy build-time value required by Prisma config.
# Never put real credentials, API keys, or secrets in ARG/ENV here.
# Runtime secrets must be injected by the deployment environment.
ARG DATABASE_URL="postgresql://postgres:postgres@localhost:5432/build"
ENV DATABASE_URL=$DATABASE_URL

COPY . .

RUN pnpm prisma:generate
RUN pnpm build

# ==============================================================================
# STAGE 4: Production dependencies
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

RUN groupadd --system nodeapp && \
    useradd --system --gid nodeapp nodeapp

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

# SECURITY:
# Do not bake DATABASE_URL, JWT secrets, API keys, or other credentials
# into the image. Inject them at runtime through the hosting environment.

USER nodeapp

CMD ["node", "dist/index.js"]
