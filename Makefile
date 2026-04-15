.PHONY: dev-frontend dev-server serve build docker docker-run clean

# ── Local development ────────────────────────────────────────────────────────

# Closest to the container experience without Docker:
#   builds the frontend once, then serves everything (game + API) from Go on :8080.
#   Re-run after frontend changes.  Access at http://localhost:8080
serve: build-frontend
	STATIC_DIR=./frontend/dist go run ./cmd/server

# Hot-reload workflow (two terminals):
#   Terminal 1 — make dev-server   (Go API on :8080, also serves last built frontend)
#   Terminal 2 — make dev-frontend (Vite on :5173, proxies /api to :8080 automatically)
#   Access at http://localhost:5173 for hot reload.

# Run the Vite dev server with HMR (hot module reload) at http://localhost:5173
dev-frontend:
	cd frontend && npm run dev

# Run the Go server pointed at the already-built frontend dist.
# Run `make build-frontend` first if you haven't yet.
dev-server:
	STATIC_DIR=./frontend/dist go run ./cmd/server

# ── Build ────────────────────────────────────────────────────────────────────

build-frontend:
	cd frontend && npm ci && npm run build

# Copy the Vite output into ./static so `go run` can serve it directly
copy-static: build-frontend
	rm -rf ./static/*
	cp -r ./frontend/dist/. ./static/

build-server:
	go build -o bin/duck-hunt-server ./cmd/server

build: copy-static build-server

# ── Docker ───────────────────────────────────────────────────────────────────

docker:
	docker build -t duck-hunt:latest .

docker-run:
	docker run --rm -p 8080:8080 duck-hunt:latest

# ── Cleanup ──────────────────────────────────────────────────────────────────

clean:
	rm -rf bin/ frontend/dist/ static/*
