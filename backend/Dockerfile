# Base stage with FFmpeg
FROM node:20-alpine AS base

# Install FFmpeg and canvas dependencies
RUN apk add --no-cache \
    ffmpeg \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    python3 \
    make \
    g++

WORKDIR /app

# Dependencies stage
FROM base AS dependencies

COPY package*.json ./
RUN npm ci --only=production

# Build stage
FROM base AS builder

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM base AS production

ENV NODE_ENV=production

WORKDIR /app

# Copy dependencies and built files
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Create directories for videos and temp files
RUN mkdir -p videos temp

# Expose port
EXPOSE 3001

# Start the server
CMD ["node", "dist/server.js"]
