# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build arguments
ARG ENABLE_DYNAMIC_HTML=true
ARG ENABLE_DYNAMIC_STRUCTURE=true

COPY package.json package-lock.json ./

# Install dependencies (including dev libraries needed for building)
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

ENV NODE_ENV production

ENV PORT 8004
EXPOSE 8004

COPY --from=builder /app/.next ./.next
#COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["npm", "start"]
