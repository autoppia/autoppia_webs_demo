# Stage 0: prod deps only (no dev deps like biome)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 1: build with dev deps
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

# Install dependencies (including dev dependencies needed for building)
RUN npm install

COPY . .

# Build args for environment flags and API URL
# Build arguments for dynamic HTML control
ARG ENABLE_DYNAMIC_HTML=false
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=$ENABLE_DYNAMIC_HTML

ARG ENABLE_DYNAMIC_HTML_STRUCTURE=false
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE=$ENABLE_DYNAMIC_HTML_STRUCTURE

# Debug: Print the environment variables
RUN echo "🔍 Build-time ENABLE_DYNAMIC_HTML: $ENABLE_DYNAMIC_HTML"
RUN echo "🔍 Build-time NEXT_PUBLIC_ENABLE_DYNAMIC_HTML: $NEXT_PUBLIC_ENABLE_DYNAMIC_HTML"
RUN echo "🔍 Build-time ENABLE_DYNAMIC_HTML_STRUCTURE: $ENABLE_DYNAMIC_HTML_STRUCTURE"
RUN echo "🔍 Build-time NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE: $NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE"

RUN npm run build

# Stage 2: Create the lean production image
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8003
EXPOSE 8003

# prod deps only (from deps stage)
COPY --from=deps /app/node_modules ./node_modules

# app artifacts
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

CMD ["npm", "start"]
