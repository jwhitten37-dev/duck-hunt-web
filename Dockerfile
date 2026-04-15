# ─── Stage 1: Build the TypeScript / Vite frontend ───────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build
# Output: /frontend/dist/


# ─── Stage 2: Build the Go server ────────────────────────────────────────────
FROM golang:1.22-alpine AS go-builder

WORKDIR /app
COPY go.mod ./
RUN go mod download

COPY cmd/ ./cmd/

# Inject the compiled frontend as the static asset directory
COPY --from=frontend-builder /frontend/dist ./static

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o duck-hunt-server ./cmd/server


# ─── Stage 3: Minimal runtime image ──────────────────────────────────────────
FROM alpine:3.19

# ca-certificates needed for any future TLS outbound calls
RUN apk --no-cache add ca-certificates

WORKDIR /app
COPY --from=go-builder /app/duck-hunt-server ./
COPY --from=go-builder /app/static          ./static

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:8080/healthz || exit 1

CMD ["./duck-hunt-server"]
