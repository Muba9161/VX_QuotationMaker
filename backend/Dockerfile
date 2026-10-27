# ==============================================================================
# Production Multi-Stage Dockerfile for VX_QuotationMaker Backend
# ==============================================================================

# --- Stage 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json tsconfig.json ./

# Install dependencies
RUN npm ci

# Copy application source code and scripts
COPY src ./src
COPY scripts ./scripts

# Build TypeScript to JavaScript
RUN npm run build

# --- Stage 2: Production Runtime ---
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=4000

# Install curl for container health check
RUN apk add --no-cache curl

# Create non-root user and directories for local file storage
RUN mkdir -p /app/storage /app/logs && \
    chown -R node:node /app

# Copy dependency files and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Use non-root user
USER node

# Expose backend API port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:4000/api/v1/health || exit 1

# Start the server
CMD ["node", "dist/src/index.js"]
