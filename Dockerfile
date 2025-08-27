FROM golang:1.24.1-alpine3.21

WORKDIR /usr/src/app

COPY ./restaurant_manager/go.mod ./restaurant_manager/go.sum ./
RUN go mod download
COPY ./restaurant_manager .

# Copy environment template and rename to .env
COPY ./restaurant_manager/.env.prod.template ./.env

# Copy JWT keys (if they exist in the build context)
COPY ./restaurant_manager/resources/private.key ./resources/private.key
COPY ./restaurant_manager/resources/public.key ./resources/public.key

RUN go build -v -o /usr/local/bin/app ./

CMD ["app"]