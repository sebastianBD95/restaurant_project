FROM --platform=$BUILDPLATFORM golang:1.24.1-alpine3.21 AS builder

WORKDIR /usr/src/app

COPY ./restaurant_manager/go.mod ./restaurant_manager/go.sum ./
RUN go mod download
COPY ./restaurant_manager .

# Build for the target platform
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -v -o /usr/local/bin/app ./

# Final stage
FROM --platform=linux/arm64 alpine:3.21

WORKDIR /usr/src/app

# Copy the binary from builder stage
COPY --from=builder /usr/local/bin/app /usr/local/bin/app

# Copy environment template and rename to .env
COPY ./restaurant_manager/.env.prod.template ./.env

# Copy JWT keys (if they exist in the build context)
COPY ./restaurant_manager/resources/private.key ./resources/private.key
COPY ./restaurant_manager/resources/public.key ./resources/public.key

CMD ["app"]