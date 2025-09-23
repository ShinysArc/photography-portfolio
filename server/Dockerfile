# --- Build stage ---
FROM golang:1.24-alpine AS build
WORKDIR /src

# Build tools & SSL roots (for fetching modules)
RUN apk add --no-cache ca-certificates git

# Cache deps
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest
COPY . .

# Build static binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -o /out/server ./cmd/server

# --- Runtime stage ---
# includes non-root user and CA certs
FROM gcr.io/distroless/base-debian12:nonroot

# App dir + data volume
WORKDIR /app
ENV PORT=8080 \
    DATA_DIR=/data
VOLUME ["/data"]

# Copy the binary
COPY --from=build /out/server /server

EXPOSE 8080
USER nonroot
ENTRYPOINT ["/server"]
