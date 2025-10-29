# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Public envs must be available at build-time to be embedded in the client bundle
ARG NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE=true
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE=${NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE}

COPY package.json package-lock.json ./

# Install dependencies (including dev dependencies needed for building)
RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Create the lean production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
# Expose public envs at runtime as well (not strictly required for baked client code,
# but useful for any server-side checks or runtime logs)
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE=${NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE}

ENV PORT 8007
EXPOSE 8007

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["npm", "start"]
