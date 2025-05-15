# Use Node.js 20 on Alpine
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your project
COPY . .

# Make the entrypoint script executable
RUN chmod +x ./entrypoint.sh

# Expose the port your app runs on
EXPOSE 8002

# Default command (let docker-compose override entrypoint)
CMD ["npm", "run", "dev", "--", "-p", "8002"]
