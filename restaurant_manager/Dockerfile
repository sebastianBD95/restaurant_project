FROM --platform=$BUILDPLATFORM golang:1.24.1-alpine3.21 AS builder

WORKDIR /usr/src/app

COPY ./go.mod ./go.sum ./
RUN go mod download
COPY . .
COPY ./.env.prod.template /usr/src/app/.env

# Build for the target platform
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -v -o /usr/local/bin/app ./

# Final stage
FROM --platform=linux/arm64 alpine:3.21

WORKDIR /usr/local/bin

# Copy the binary from builder stage
COPY --from=builder /usr/local/bin/app /usr/local/bin/app

# Copy environment template and rename to .env
COPY ./.env.prod.template /usr/local/bin/.env

# Copy resources directory (needed for YAML config files)
COPY ./resources /usr/local/bin/resources

# Copy JWT keys (if they exist in the build context)
COPY ./resources/private.key /usr/local/bin/resources/private.key
COPY ./resources/public.key /usr/local/bin/resources/public.key

CMD ["app"]