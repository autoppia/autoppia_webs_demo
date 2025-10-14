# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./

# Install dependencies (including dev dependencies needed for building)
RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Create the lean production image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

ENV PORT 8008
EXPOSE 8008

COPY --from=builder /app/.next ./.next
#COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["npm", "start"]
