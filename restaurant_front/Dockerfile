# Multi-stage build for React frontend
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

# Set working directoryx
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Final stage
FROM --platform=linux/arm64 node:20-alpine

# Set working directory
WORKDIR /app

# Copy built files from builder stage
COPY --from=builder /app/build /app/build

RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]
