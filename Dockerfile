FROM golang:1.24.1-alpine3.21

WORKDIR /usr/src/app

COPY ./restaurant_manager/go.mod ./restaurant_manager/go.sum ./
RUN go mod download
COPY ./restaurant_manager .
RUN go build -v -o /usr/local/bin/app ./

CMD ["app"]