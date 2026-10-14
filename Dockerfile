# Multi-stage production Dockerfile
# Stage 1: Build Frontend and Dependencies
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json package-lock.json ./

# Clean install all dependencies
RUN npm ci

# Copy full source tree
COPY . .

# Build frontend production bundle
RUN npm run build

# Stage 2: Production Runtime
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Copy package files and install only production dependencies + tsx
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm install -g tsx

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Copy backend server code and initial data
COPY server ./server
COPY data ./data

# Expose server port
EXPOSE 3001

# Start full-stack server (serves REST API + React static frontend)
CMD ["tsx", "server/src/server.ts"]
