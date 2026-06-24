# Base image with Node.js 24 and pnpm
# To build locally: docker build -t zikstock-backend .
FROM node:24-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Build stage
FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml tsconfig.json pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY src ./src
RUN pnpm build

# Production dependencies stage
FROM base AS prod-deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Final production runner
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

EXPOSE 8080
CMD [ "node", "dist/index.js" ]
