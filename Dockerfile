# Multi-stage build for Task Management App
# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app

# Copy frontend package files
COPY package*.json ./
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY tsconfig.node.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source
COPY src ./src
COPY index.html ./
COPY postcss.config.mjs ./

# Build frontend (API will be served from same origin, so use relative path)
ENV VITE_API_URL=/api
RUN npm run build

# Stage 2: Build backend
FROM node:18-alpine AS backend-builder

WORKDIR /app

# Copy backend package files
COPY server/package*.json ./

# Install backend dependencies
RUN npm ci

# Copy backend source
COPY server/src ./src
COPY server/tsconfig.json ./
COPY server/prisma ./prisma

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Stage 3: Production
FROM node:18-alpine

WORKDIR /app

# Install dumb-init and OpenSSL for Prisma
RUN apk add --no-cache dumb-init openssl1.1-compat

# Copy backend package files
COPY server/package*.json ./

# Install production dependencies only
RUN npm ci --only=production

# Copy built backend from builder
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/prisma ./prisma
COPY --from=backend-builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=backend-builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy built frontend
COPY --from=frontend-builder /app/dist ./public

# Create directory for database (SQLite)
RUN mkdir -p /app/data

# Set environment variables (can be overridden in CapRover)
ENV NODE_ENV=production
ENV PORT=80
ENV DATABASE_URL="file:./data/production.db"

# Expose port
EXPOSE 80

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "dist/index.js"]

