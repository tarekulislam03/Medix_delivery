# Multi-stage production Dockerfile for Medix Express API Server
FROM node:20-alpine AS base

# Install security patches
RUN apk update && apk upgrade && rm -rf /var/cache/apk/*

WORKDIR /app

# Copy dependency manifests first for Docker cache optimization
COPY package*.json ./

# Production dependency stage
FROM base AS dependencies
RUN npm ci --only=production

# Final runtime image
FROM base AS runner
ENV NODE_ENV=production
ENV PORT=5000

WORKDIR /app

# Copy installed production node_modules
COPY --from=dependencies /app/node_modules ./node_modules
# Copy server source code
COPY . .

# Run as non-root user for security
USER node

EXPOSE 5000

CMD ["node", "src/index.js"]
