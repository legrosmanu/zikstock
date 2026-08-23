# Base image with Node.js 24 and pnpm
# To build locally: docker build -t zikstock-backend -f backend/Dockerfile .
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Build stage
FROM base AS builder
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/types ./packages/types
COPY backend/package.json backend/tsconfig.json ./backend/
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @zikstock/types build
COPY backend/src ./backend/src
WORKDIR /app/backend
RUN pnpm build

# Production dependencies stage
FROM base AS prod-deps
WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/types ./packages/types
COPY backend/package.json ./backend/
RUN pnpm install --prod --frozen-lockfile
RUN pnpm --filter @zikstock/types build

# Final production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=prod-deps /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/backend/dist ./dist
COPY backend/package.json ./

EXPOSE 8080
CMD [ "node", "dist/index.js" ]
