<<<<<<< HEAD
# Use Node.js 20 base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Ensure entrypoint script is executable
RUN chmod +x ./entrypoint.sh

# Expose your app port (used in npm run dev -- -p 8004)
EXPOSE 9000

# Set the entrypoint
ENTRYPOINT ["sh", "./entrypoint.sh"]
=======
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

ENV PORT 8012
EXPOSE 8012

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["npm", "start"]
>>>>>>> 29b2f9aaa371021ed149224c567b9edf87333d43
