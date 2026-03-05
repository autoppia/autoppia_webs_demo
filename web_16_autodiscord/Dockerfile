# Stage 0: prod deps only
FROM node:20-alpine AS deps
WORKDIR /app
COPY web_16_autodiscord/package.json web_16_autodiscord/package-lock.json ./
RUN set -e; for i in 1 2 3; do npm ci --omit=dev && exit 0 || echo "Attempt $i failed, retrying..."; sleep 5; done; exit 1

# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY web_16_autodiscord/package.json web_16_autodiscord/package-lock.json ./
RUN set -e; for i in 1 2 3; do npm ci && exit 0 || echo "Attempt $i failed, retrying..."; sleep 5; done; exit 1
COPY web_16_autodiscord/ .
ARG API_URL=http://app:8090
ENV API_URL=$API_URL
ARG NEXT_PUBLIC_API_URL=http://localhost:8090
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ARG GIT_COMMIT_HASH=unknown
RUN BASE_VERSION=$(node -p "require('./package.json').version") && \
    if [ "$GIT_COMMIT_HASH" != "unknown" ] && [ -n "$GIT_COMMIT_HASH" ]; then \
      WEB_VERSION="${BASE_VERSION}+${GIT_COMMIT_HASH}"; \
    else \
      WEB_VERSION="$BASE_VERSION"; \
    fi && \
    echo "NEXT_PUBLIC_WEB_VERSION=$WEB_VERSION" > .env.local && \
    echo "WEB_VERSION=$WEB_VERSION" >> .env.local
RUN npm run build

# Stage 2: production
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
ENV PORT 8015
EXPOSE 8015
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
RUN npm ci --omit=dev --ignore-scripts
COPY --from=builder /app/.next ./.next
# No public directory in this app
# COPY --from=builder /app/public ./public
CMD ["npm", "start"]
