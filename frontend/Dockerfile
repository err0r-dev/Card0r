# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy and build shared package first
COPY shared/package*.json ./shared/
COPY shared/src ./shared/src
COPY shared/tsconfig.json ./shared/
WORKDIR /app/shared
RUN npm install && npm run build

# Now setup frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./

# Create node_modules and link shared package before npm install
RUN mkdir -p node_modules/@card0r && \
    ln -s /app/shared node_modules/@card0r/shared

# Install other dependencies (shared is already linked)
RUN npm install --legacy-peer-deps --ignore-scripts || true

# Copy source files
COPY frontend/ .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built files and ensure proper permissions
COPY --from=builder /app/frontend/dist /usr/share/nginx/html
RUN chmod -R 755 /usr/share/nginx/html && find /usr/share/nginx/html -type f -exec chmod 644 {} \;

# Copy nginx configuration
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
