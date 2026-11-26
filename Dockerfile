FROM golang:1.24-alpine AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /fish-eater .

FROM scratch
COPY --from=build /fish-eater /fish-eater
VOLUME /data
EXPOSE 8080
ENTRYPOINT ["/fish-eater", "-data", "/data/scores.json"]
