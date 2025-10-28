# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build argument
ARG ENABLE_DYNAMIC_HTML=false
ARG ENABLE_DYNAMIC_HTML_STRUCTURE=false

COPY package.json package-lock.json ./

# Install dependencies (including dev dependencies needed for building)
RUN npm ci

COPY . .

# Set environment variables for build
ENV ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}
ENV ENABLE_DYNAMIC_HTML_STRUCTURE=${ENABLE_DYNAMIC_HTML_STRUCTURE}
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE=${ENABLE_DYNAMIC_HTML_STRUCTURE}

# Debug: Print the environment variables during build
RUN echo "🔍 Build-time ENABLE_DYNAMIC_HTML: ${ENABLE_DYNAMIC_HTML}" \
 && echo "🔍 Build-time NEXT_PUBLIC_ENABLE_DYNAMIC_HTML: ${NEXT_PUBLIC_ENABLE_DYNAMIC_HTML}" \
 && echo "🔍 Build-time ENABLE_DYNAMIC_HTML_STRUCTURE: ${ENABLE_DYNAMIC_HTML_STRUCTURE}" \
 && echo "🔍 Build-time NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE: ${NEXT_PUBLIC_ENABLE_DYNAMIC_HTML_STRUCTURE}"

RUN npm run build

# Stage 2: Create the lean production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

ENV PORT 8006
EXPOSE 8006

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["npm", "start"]