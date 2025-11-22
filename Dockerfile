# Use Node.js 18 Alpine for smaller image size
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install dependencies
RUN npm clean-install --prefer-offline --no-audit --no-fund

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm clean-install --prefer-offline --no-audit --no-fund --omit=dev && \
    npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./server.js

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]