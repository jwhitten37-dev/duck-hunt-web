# ─── Stage 1: Build the TypeScript / Vite frontend ───────────────────────────
FROM node:24-alpine AS frontend-builder

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build
# Output: /frontend/dist/


# ─── Stage 2: Build the Go server ────────────────────────────────────────────
FROM golang:1.26-alpine AS go-builder

WORKDIR /app
COPY go.mod ./
RUN go mod download

COPY cmd/ ./cmd/

# Inject the compiled frontend as the static asset directory
COPY --from=frontend-builder /frontend/dist ./static

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o duck-hunt-server ./cmd/server


# ─── Stage 3: Minimal runtime image ──────────────────────────────────────────
FROM alpine:3.23

RUN apk --no-cache add ca-certificates

# Non-root user for production security
RUN addgroup -S -g 1001 duckhunt && adduser -S -u 1001 -G duckhunt duckhunt

WORKDIR /app
COPY --from=go-builder /app/duck-hunt-server ./
COPY --from=go-builder /app/static          ./static

# Create scores data directory and transfer ownership before dropping privileges
RUN mkdir -p /app/data && chown -R duckhunt:duckhunt /app

USER duckhunt

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/healthz || exit 1

CMD ["./duck-hunt-server"]
