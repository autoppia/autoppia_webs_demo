# Stage 0: prod deps only (no dev deps like biome)
FROM node:20-alpine AS deps
WORKDIR /app
COPY web_4_autodining/package.json web_4_autodining/package-lock.json ./
RUN npm ci --omit=dev

# Stage 1: build with dev deps
FROM node:20-alpine AS builder

WORKDIR /app

COPY web_4_autodining/package.json web_4_autodining/package-lock.json ./

# Install dependencies (including dev dependencies needed for building)
RUN npm install

COPY web_4_autodining/ .
# Copy original dataset files for fallback
COPY webs_server/initial_data/web_4_autodining/original/ webs_server/initial_data/web_4_autodining/original/

# Build args for environment flags and API URL
# Build arguments for dynamic versions
ARG ENABLE_DYNAMIC_V1=false
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_V1=$ENABLE_DYNAMIC_V1

ARG ENABLE_DYNAMIC_V2_AI_GENERATE=false
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_V2_AI_GENERATE=$ENABLE_DYNAMIC_V2_AI_GENERATE

ARG ENABLE_DYNAMIC_V2_DB_MODE=false
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE=$ENABLE_DYNAMIC_V2_DB_MODE

ARG ENABLE_DYNAMIC_V3=false
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_V3=$ENABLE_DYNAMIC_V3

ARG ENABLE_DYNAMIC_V4=false
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_V4=$ENABLE_DYNAMIC_V4

ARG API_URL=http://app:8080
ENV API_URL=$API_URL

ARG NEXT_PUBLIC_API_URL=http://localhost:8090
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Debug: Print the environment variables
RUN echo "🔍 Build-time ENABLE_DYNAMIC_V1: $ENABLE_DYNAMIC_V1"
RUN echo "🔍 Build-time NEXT_PUBLIC_ENABLE_DYNAMIC_V1: $NEXT_PUBLIC_ENABLE_DYNAMIC_V1"
RUN echo "🔍 Build-time ENABLE_DYNAMIC_V2_DB_MODE: $ENABLE_DYNAMIC_V2_DB_MODE"
RUN echo "🔍 Build-time NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE: $NEXT_PUBLIC_ENABLE_DYNAMIC_V2_DB_MODE"

RUN npm run build

# Stage 2: Create the lean production image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8003
EXPOSE 8003

# Note: NEXT_PUBLIC_* variables are embedded at build time in the .next bundle,
# so they don't need to be set here. They're already in the JavaScript code.

# prod deps only (from deps stage)
COPY --from=deps /app/node_modules ./node_modules

# app artifacts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

CMD ["npm", "start"]
