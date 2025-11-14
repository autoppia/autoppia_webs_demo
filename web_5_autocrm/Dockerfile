# Stage 0: prod deps only (no dev deps like biome)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 1: build with dev deps
FROM node:20-alpine AS builder

WORKDIR /app

# Build args for environment flags and API URL
ARG ENABLE_DYNAMIC_HTML=false
ARG ENABLE_DYNAMIC_HTML_STRUCTURE=false
ARG ENABLE_DATA_GENERATION=false
ARG ENABLE_DB_MODE=false
ARG NEXT_PUBLIC_API_URL
ARG API_URL
ARG NEXT_PUBLIC_ENABLE_DB_MODE=false
ARG DATA_SEED_VALUE
ARG NEXT_PUBLIC_DATA_SEED_VALUE

COPY package.json package-lock.json ./

# Install dependencies (including dev dependencies needed for building)
RUN npm ci

COPY . .

# Set environment variables for build
ENV ENABLE_DYNAMIC_HTML=$ENABLE_DYNAMIC_HTML \
    ENABLE_DYNAMIC_HTML_STRUCTURE=$ENABLE_DYNAMIC_HTML_STRUCTURE \
    NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=$ENABLE_DYNAMIC_HTML \
    NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE=$ENABLE_DYNAMIC_HTML_STRUCTURE \
    ENABLE_DATA_GENERATION=$ENABLE_DATA_GENERATION \
    NEXT_PUBLIC_DATA_GENERATION=$ENABLE_DATA_GENERATION \
    ENABLE_DB_MODE=$ENABLE_DB_MODE \
    NEXT_PUBLIC_ENABLE_DB_MODE=$NEXT_PUBLIC_ENABLE_DB_MODE \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    API_URL=$API_URL \
    DATA_SEED_VALUE=$DATA_SEED_VALUE \
    NEXT_PUBLIC_DATA_SEED_VALUE=$NEXT_PUBLIC_DATA_SEED_VALUE \
    DOCKER_BUILD=true

# Debug: Print environment variables
RUN echo "🔍 Build environment variables:"
RUN echo "  ENABLE_DYNAMIC_HTML: ${ENABLE_DYNAMIC_HTML}"
RUN echo "  NEXT_PUBLIC_ENABLE_DYNAMIC_HTML: ${ENABLE_DYNAMIC_HTML}"
RUN echo "  ENABLE_DYNAMIC_HTML_STRUCTURE: ${ENABLE_DYNAMIC_HTML_STRUCTURE}"
RUN echo "  NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE: ${ENABLE_DYNAMIC_HTML_STRUCTURE}"
RUN echo "  ENABLE_DATA_GENERATION: ${ENABLE_DATA_GENERATION}"
RUN echo "  NEXT_PUBLIC_DATA_GENERATION: ${ENABLE_DATA_GENERATION}"
RUN echo "  ENABLE_DB_MODE: ${ENABLE_DB_MODE}"
RUN echo "  NEXT_PUBLIC_ENABLE_DB_MODE: ${NEXT_PUBLIC_ENABLE_DB_MODE}"
RUN echo "  NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}"
RUN echo "  API_URL: ${API_URL}"
RUN echo "  DATA_SEED_VALUE: ${DATA_SEED_VALUE}"
RUN echo "  NEXT_PUBLIC_DATA_SEED_VALUE: ${NEXT_PUBLIC_DATA_SEED_VALUE}"
RUN echo "  DOCKER_BUILD: ${DOCKER_BUILD}"

RUN npm run build

# Stage 2: Create the lean production image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8004
EXPOSE 8004

# prod deps only (from deps stage)
COPY --from=deps /app/node_modules ./node_modules

# app artifacts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./next.config.js
# This app has no public directory

CMD ["npm", "start"]
