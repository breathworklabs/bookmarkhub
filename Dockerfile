# Use Node.js 22 Alpine
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Upgrade npm to match local version (lock file compatibility)
RUN npm install -g npm@11.6.0

# Copy package files
COPY package*.json ./

# Install dependencies (npm install is more forgiving than npm ci across platforms)
RUN npm install --no-audit --no-fund

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Upgrade npm to match lock file version (generated with npm 11)
RUN npm install -g npm@11.6.0

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --no-audit --no-fund --omit=dev && \
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