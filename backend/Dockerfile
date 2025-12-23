# Base stage with FFmpeg (using Debian instead of Alpine for Remotion compatibility)
FROM node:20-slim AS base

# Install FFmpeg, canvas dependencies, and Chrome dependencies for Remotion
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libcairo2-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libgif-dev \
    librsvg2-dev \
    libpixman-1-dev \
    python3 \
    build-essential \
    # Chrome/Chromium dependencies for Remotion
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    fonts-liberation \
    xdg-utils \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Build shared package
FROM base AS shared-builder
COPY shared/package*.json ./shared/
COPY shared/src ./shared/src
COPY shared/tsconfig.json ./shared/
WORKDIR /app/shared
RUN npm install && npm run build

# Build stage
FROM base AS builder
COPY --from=shared-builder /app/shared /app/shared
WORKDIR /app/backend
COPY backend/package*.json ./
# Link shared package before installing
RUN mkdir -p node_modules/@card0r && \
    ln -s /app/shared node_modules/@card0r/shared && \
    npm install --legacy-peer-deps
COPY backend/ .
RUN npm run build

# Pre-download Chrome Headless Shell for Remotion
RUN node -e "require('@remotion/renderer').ensureBrowser()"

# Production stage
FROM base AS production

ENV NODE_ENV=production

WORKDIR /app

# Copy shared package
COPY --from=shared-builder /app/shared /app/shared

# Copy dependencies, built files, and pre-downloaded Chrome
COPY --from=builder /app/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/backend/remotion-bundle ./remotion-bundle
COPY backend/package*.json ./

# Ensure Chrome cache is properly copied (Remotion stores it in node_modules/.remotion)
# The COPY above should include it, but let's verify the directory exists
RUN ls -la node_modules/.remotion/ || echo "Chrome cache not found"

# Re-link shared package in production
RUN mkdir -p node_modules/@card0r && \
    ln -sf /app/shared node_modules/@card0r/shared

# Create directories for videos and temp files
RUN mkdir -p videos temp

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the server
CMD ["node", "dist/server.js"]
