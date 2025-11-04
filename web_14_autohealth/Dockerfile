# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

ARG ENABLE_DYNAMIC_HTML=false
ARG DYNAMIC_HTML_STRUCTURE=false
ENV ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}
ENV DYNAMIC_HTML_STRUCTURE=${DYNAMIC_HTML_STRUCTURE}
ENV NEXT_PUBLIC_DYNAMIC_HTML_STRUCTURE=${DYNAMIC_HTML_STRUCTURE}

COPY package.json package-lock.json ./

# Install dependencies (including dev dependencies needed for building)
RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Create the lean production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

ENV PORT 8013
ENV ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}
ENV NEXT_PUBLIC_ENABLE_DYNAMIC_HTML=${ENABLE_DYNAMIC_HTML}
ENV DYNAMIC_HTML_STRUCTURE=${DYNAMIC_HTML_STRUCTURE}
ENV NEXT_PUBLIC_DYNAMIC_HTML_STRUCTURE=${DYNAMIC_HTML_STRUCTURE}
EXPOSE 8013

COPY --from=builder /app/.next ./.next
#COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["npm", "start"]
