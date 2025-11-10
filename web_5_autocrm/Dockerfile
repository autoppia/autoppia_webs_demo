# Stage 0: prod deps only (no dev deps like biome)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 1: build with dev deps
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments
ARG ENABLE_DYNAMIC_HTML=true
ARG ENABLE_DYNAMIC_STRUCTURE=true

COPY package.json package-lock.json ./

# Install dependencies (including dev dependencies needed for building)
RUN npm ci

COPY . .

# Set environment variables for build
ENV ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE=${ENABLE_DYNAMIC_STRUCTURE}
ENV DOCKER_BUILD=true

# Debug: Print environment variables
RUN echo "🔍 Build environment variables:"
RUN echo "  ENABLE_DYNAMIC_HTML: ${ENABLE_DYNAMIC_HTML}"
RUN echo "  NEXT_PUBLIC_ENABLE_DYNAMIC_HTML: ${ENABLE_DYNAMIC_HTML}"
RUN echo "  NEXT_PUBLIC_ENABLE_DYNAMIC_STRUCTURE: ${ENABLE_DYNAMIC_STRUCTURE}"
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
