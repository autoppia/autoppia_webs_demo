# Stage 0: prod deps only (no dev deps like biome)
FROM node:20-alpine AS deps
WORKDIR /app
# Update npm to latest version to avoid registry issues
RUN npm install -g npm@latest
COPY package.json package-lock.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Stage 1: build with dev deps
FROM node:20-alpine AS builder

WORKDIR /app

# Update npm to latest version to avoid registry issues
RUN npm install -g npm@latest

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
ARG NEXT_PUBLIC_ENABLE_DATA_GENERATION=false

# Set environment variables
ENV ENABLE_DYNAMIC_HTML=$ENABLE_DYNAMIC_HTML \
    ENABLE_DYNAMIC_HTML_STRUCTURE=$ENABLE_DYNAMIC_HTML_STRUCTURE \
    NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=$ENABLE_DYNAMIC_HTML \
    NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE=$ENABLE_DYNAMIC_HTML_STRUCTURE \
    ENABLE_DATA_GENERATION=$ENABLE_DATA_GENERATION \
    NEXT_PUBLIC_ENABLE_DATA_GENERATION=$NEXT_PUBLIC_ENABLE_DATA_GENERATION \
    ENABLE_DB_MODE=$ENABLE_DB_MODE \
    NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    API_URL=$API_URL \
    NEXT_PUBLIC_ENABLE_DB_MODE=$NEXT_PUBLIC_ENABLE_DB_MODE \
    DATA_SEED_VALUE=$DATA_SEED_VALUE \
    NEXT_PUBLIC_DATA_SEED_VALUE=$NEXT_PUBLIC_DATA_SEED_VALUE

# Copy package files and install dependencies
COPY package.json package-lock.json ./

# Install dependencies (including dev dependencies needed for building)
# Use npm install instead of npm ci to handle optional dependencies across platforms
RUN npm install --legacy-peer-deps

# Verify next is installed
RUN npm list next || (echo "ERROR: next not found in node_modules" && npm list && exit 1)

# Copy source code
COPY . .

# Build the application using npx to ensure correct path
RUN npx next build

# Stage 2: Create the lean production image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8007
# Note: NEXT_PUBLIC_* variables are baked into the build at build time
# Runtime env vars are set via docker-compose.yml environment section
EXPOSE 8007

# prod deps only (from deps stage)
COPY --from=deps /app/node_modules ./node_modules

# app artifacts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

CMD ["npm", "start"]