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
EXPOSE 8004

# Set the entrypoint
ENTRYPOINT ["sh", "./entrypoint.sh"]