# Build stage
# To build locally: docker build -t zikstock-frontend -f frontend/Dockerfile .
FROM node:24-slim AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/types ./packages/types
COPY frontend/package.json frontend/tsconfig.json frontend/tsconfig.app.json frontend/tsconfig.node.json frontend/vite.config.ts frontend/index.html ./frontend/
COPY frontend/public ./frontend/public
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @zikstock/types build

# Pass build arguments to environment variables so Vite can embed them
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

COPY frontend/src ./frontend/src
WORKDIR /app/frontend
RUN pnpm build

# Serve stage using Nginx
FROM nginx:alpine
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
