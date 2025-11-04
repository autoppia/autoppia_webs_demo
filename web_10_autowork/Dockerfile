# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Build arguments for dynamic HTML and default seed-structure
ARG ENABLE_DYNAMIC_HTML=false
ARG DEFAULT_SEED_STRUCTURE=1
ARG DYNAMIC_HTML_STRUCTURE=false

COPY package.json package-lock.json ./

# Install dependencies (including dev dependencies needed for building)
RUN npm ci

COPY . .

# Set environment variables for build
ENV ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}
ENV NEXT_PUBLIC_DEFAULT_SEED_STRUCTURE=${DEFAULT_SEED_STRUCTURE}
ENV DYNAMIC_HTML_STRUCTURE=${DYNAMIC_HTML_STRUCTURE}
ENV NEXT_PUBLIC_DYNAMIC_HTML_STRUCTURE=${DYNAMIC_HTML_STRUCTURE}
ENV DOCKER_BUILD=true

RUN npm run build

# Stage 2: Create the lean production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

ENV PORT 8009
EXPOSE 8009

COPY --from=builder /app/.next ./.next
#COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["npm", "start"]
