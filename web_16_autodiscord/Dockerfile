# Stage 0: prod deps only (no dev deps like biome)
FROM node:20 AS deps
WORKDIR /app

# Copy package files
COPY web_16_autodiscord/package.json web_16_autodiscord/package-lock.json ./

# Retry npm ci up to 3 times on network errors, install only production deps
RUN set -e; for i in 1 2 3; do npm ci --omit=dev && exit 0 || echo "Attempt $i failed, retrying..."; sleep 5; done; exit 1


# Stage 1: build with dev deps
FROM node:20 AS builder
WORKDIR /app

# Copy package files
COPY web_16_autodiscord/package.json web_16_autodiscord/package-lock.json ./

# Install dev dependencies for building
RUN set -e; for i in 1 2 3; do npm ci && exit 0 || echo "Attempt $i failed, retrying..."; sleep 5; done; exit 1

# Copy source code
COPY web_16_autodiscord/ .

# Dynamic system flags (V1/V2/V3) – baked into client at build time
ARG ENABLE_DYNAMIC_V1=false
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_V1=$ENABLE_DYNAMIC_V1

ARG ENABLE_DYNAMIC_V2=false
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_V2=$ENABLE_DYNAMIC_V2

ARG ENABLE_DYNAMIC_V3=false
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_V3=$ENABLE_DYNAMIC_V3

# Build args for API URL
ARG API_URL=http://app:8090
ENV API_URL=$API_URL

ARG NEXT_PUBLIC_API_URL=http://localhost:8090
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Git commit hash for automatic versioning
ARG GIT_COMMIT_HASH=unknown

# Auto-versioning from package.json + git hash
RUN BASE_VERSION=$(node -p "require('./package.json').version") && \
    if [ "$GIT_COMMIT_HASH" != "unknown" ] && [ -n "$GIT_COMMIT_HASH" ]; then \
      WEB_VERSION="${BASE_VERSION}+${GIT_COMMIT_HASH}"; \
    else \
      WEB_VERSION="$BASE_VERSION"; \
    fi && \
    echo "NEXT_PUBLIC_WEB_VERSION=$WEB_VERSION" > .env.local && \
    echo "WEB_VERSION=$WEB_VERSION" >> .env.local && \
    echo "✅ Auto-version: $WEB_VERSION"

# Build Next.js project
RUN npm run build


# Stage 2: Create the lean production image
FROM node:20 AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8015
EXPOSE 8015

# Copy package files for production deps
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts

# Copy build artifacts
COPY --from=builder /app/.next ./.next

# No public directory in this app
# COPY --from=builder /app/public ./public

# Start the app
CMD ["npm", "start"]
