# 🦆 Duck Hunt — NES Web Recreation

A faithful browser-based recreation of the NES classic Duck Hunt, built with TypeScript, Go, and the Web Audio API. No external audio files or game ROMs — every sound is synthesized from scratch and every sprite is rendered from an original PNG sprite sheet.

## Features

- **Authentic NES gameplay** — flying ducks, dog intro animation, per-round scoring, and lives system
- **3 duck color variants** with sprite-sheet animations (right-flight, up-flight, hit, falling)
- **Dog animation sequence** — runs in, sniffs toward center, perks up on alert, jumps into bushes, then emerges with duck(s) or mocks the player
- **NES-accurate sprite background** — sky, trees, and bush foreground with correct depth layering
- **Synthesized audio** — gunshot, duck hit, duck escape, dog laugh, score fanfare, and looping background music (all via Web Audio API, zero audio files)
- **Scoring system** — 500 pts per duck + 500 flat perfect-round bonus + consecutive-perfect streak multiplier (×10% per streak)
- **Arcade leaderboard** — top-10 scores with 3-letter initials entry, persisted server-side (or falls back to `localStorage` without the Go server)
- **Pause / quit** — ESC to pause, Q to quit to game over, M to mute
- **Fully containerized** — single `docker compose up --build` to run

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | TypeScript · Vite · Canvas 2D · Web Audio API |
| Backend | Go 1.22 · `net/http` (no framework) |
| Container | Docker multi-stage build · Docker Compose |
| Audio | Web Audio API (oscillators, noise buffers, envelope shaping) |
| Graphics | HTML5 Canvas + PNG sprite sheet |

## Quick Start

**Requires:** Docker and Docker Compose.

```bash
git clone https://github.com/jwhitten37-dev/duck-hunt-web.git
cd duck-hunt
docker compose up --build
```

Open **http://localhost:8080** and click to start.

> **Sprite sheet:** place your `sprites.png` at `frontend/public/sprites.png` before building.
> The game falls back to procedural canvas graphics without it.

## Local Development

Three workflows are available depending on what you're working on:

### Full build + Go server (closest to production)
```bash
make serve
# http://localhost:8080
```
Builds the frontend once with Vite, then serves everything from Go. Re-run after frontend changes.

### Hot-reload frontend (recommended for UI work)
```bash
# Terminal 1 — Go API
make dev-server

# Terminal 2 — Vite dev server with HMR
make dev-frontend
# http://localhost:5173
```
Vite proxies `/api` calls to the Go server automatically.

### Docker (full container simulation)
```bash
docker compose up --build
# http://localhost:8080
```
Leaderboard scores persist in a named Docker volume (`scores-data`). Use `docker compose down -v` to wipe the board.

## Project Structure

```
duck-hunt/
├── cmd/server/          # Go HTTP server — static file serving + scores API
├── frontend/
│   ├── public/          # Static assets (sprites.png goes here)
│   └── src/game/
│       ├── Animator.ts          # Frame-cycling utility
│       ├── Dog.ts               # Dog intro + scene actor
│       ├── Duck.ts              # Duck entity (flight, hit, fall)
│       ├── Game.ts              # Root game loop + state machine
│       ├── HUD.ts               # Score/ammo/lives display
│       ├── InputManager.ts      # Mouse/click input
│       ├── LeaderboardScreen.ts # Arcade-style top-10 display
│       ├── NameEntryScreen.ts   # 3-letter initials entry
│       ├── Scene.ts             # Background + foreground rendering
│       ├── ScorePopup.ts        # Floating "+N" score popups
│       ├── SoundManager.ts      # All audio synthesis
│       ├── SpriteMap.ts         # Sprite sheet frame coordinate table
│       ├── SpriteSheet.ts       # Sprite atlas loader + draw utilities
│       └── TitleScreen.ts       # Animated title card
├── Dockerfile
├── docker-compose.yml
├── Makefile
└── go.mod
```

## Controls

| Input | Action |
|-------|--------|
| Click | Shoot / Start game / Resume |
| ESC | Pause |
| Q *(while paused)* | Quit to game over |
| M | Toggle mute |
| Arrow keys | Navigate initials entry |
| Enter / Space | Confirm initial |

## Scoring

| Event | Points |
|-------|--------|
| Duck hit | +500 |
| Perfect round (all ducks hit) | +500 bonus |
| Consecutive perfect streak | +(round total × streak × 10%) |
| Duck escaped | 0 |
| Round with zero hits | −1 life |

## API

The Go server exposes a minimal scores API:

```
GET  /api/scores          → returns top-10 as JSON array
POST /api/scores          → { "name": "AAA", "score": 1500 } → returns updated top-10
GET  /healthz             → "ok" (used by Docker healthcheck)
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | HTTP listen port |
| `STATIC_DIR` | `./static` | Path to the compiled frontend assets |
| `SCORES_FILE` | `./scores.json` | Path to the leaderboard JSON file |

## Credits

- **Sprite sheet** — sourced from [The Spriters Resource](https://www.spriters-resource.com/) (Duck Hunt — NES). Credit to the original ripper(s) listed on that page.
- **Original game** — Duck Hunt © Nintendo, 1984. All character designs, gameplay concepts, and audio motifs belong to Nintendo.

## Legal

This project is an unofficial fan recreation made for educational and personal use only. It is not affiliated with, endorsed by, or sponsored by Nintendo Co., Ltd. Duck Hunt and all associated characters are trademarks of Nintendo.

No Nintendo ROMs, audio files, or proprietary assets are distributed with this project. The sprite sheet (`sprites.png`) is **not included** in this repository — you must supply your own copy before building. The synthesized audio is an original implementation using the Web Audio API.

This project is not intended for commercial use.

## License

MIT — see [LICENSE](LICENSE).
