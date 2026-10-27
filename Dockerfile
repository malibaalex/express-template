FROM node:24-bookworm-slim AS build
RUN corepack enable
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/build"
COPY . .
RUN pnpm prisma:generate && pnpm build

FROM build AS prod-deps
RUN pnpm prune --prod

FROM node:24-bookworm-slim AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./
USER node
CMD ["node", "dist/server.js"]