# Multi-stage build for React frontend
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage with simple static server
FROM --platform=linux/arm64 node:20-alpine

# Install http-server package globally
RUN npm install -g http-server --unsafe-perm

# Copy built files from builder stage
COPY --from=builder /app/build /app/build

# Set working directory
WORKDIR /app

# Expose port 3000
EXPOSE 3000

# Start http-server
CMD ["http-server", "build", "-p", "3000"]
