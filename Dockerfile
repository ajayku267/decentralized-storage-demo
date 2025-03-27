# Use Node.js LTS version as base image
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm ci
RUN cd client && npm ci

# Copy project files
COPY . .

# Build the React app
RUN npm run build

# Use a smaller base image for the production deployment
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy server files and built client files from build stage
COPY --from=build /app/server ./server
COPY --from=build /app/client/build ./client/build

# Set environment variables for production
ENV NODE_ENV=production
ENV PORT=5001

# Create necessary directories
RUN mkdir -p server/logs
RUN mkdir -p server/uploads

# Expose the port the app runs on
EXPOSE 5001

# Configure health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:5001/api/health || exit 1

# Command to run the application
CMD ["node", "server/index.js"] 