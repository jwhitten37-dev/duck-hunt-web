# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [0.1.0] — 2026-04-15

Initial release.

### Added

#### Gameplay
- Ducks spawn from the bottom of the screen in pairs per round, fly in random directions, bounce off screen edges, and escape upward if not shot in time
- Three duck color variants (brown, blue, red) each with 11 sprite-sheet animation frames: right-flight (3), up-flight (3), hit (1), falling (4)
- Hit detection with generous hitbox; ducks flash on hit and fall with gravity
- 3 shots per round; empty-gun click plays a dry metallic sound and flashes the ammo area
- 3 lives; losing all ducks in a round costs a life; game over on zero lives
- Duck speed increases every round (+7% per round)

#### Dog
- **Intro sequence** — dog sprints in from left using 5 animated run frames, slows to a nose-to-ground sniff-walk toward the screen center, perks up with an alert jump (cycling dog_jump frames), then dives into the bush foreground
- **Scene sequence** — after each round the dog emerges from the bushes: celebrates holding 1 or 2 ducks (matching `dog_success_1` / `dog_success_2` sprites based on ducks hit) or laughs at the player (alternating `dog_fail` frames) if no ducks were hit
- Dog lower body is occluded by the bush foreground during both the intro dive and the scene emerge

#### Scoring
- Flat 500 points per duck landed
- 500 point flat bonus for a perfect round (all ducks hit)
- Consecutive perfect-round streak multiplier: each additional perfect round applies `round_total × streak × 10%` bonus
- Streak resets on any non-perfect round
- Floating score popups rise from the duck landing spot

#### Graphics
- PNG sprite sheet support with automatic canvas-primitive fallback if `sprites.png` is absent
- NES background sprite split at the bush line — sky/tree layer drawn behind ducks, bush/ground layer drawn in front (correct depth ordering)
- Title screen animated duck (uses sprite sheet when available)
- `SpriteSheet` loader handles browser cache edge cases (`image.complete` check)

#### Audio (Web Audio API — no external files)
- Gunshot: white-noise crack + sine-wave thump
- Duck hit: descending square-wave squawk
- Duck escape: rising-then-falling sine whistle
- Empty gun: short bandpass noise click
- Dog laugh: three square-wave "ha-ha-ha" pulses
- Score fanfare: ascending four-note square-wave arpeggio
- Background music: looping square-wave melody + triangle-wave bass (original composition, G major, 128 BPM)
- Global mute toggle (M key) with smooth gain ramp

#### HUD
- Score, hi-score, round number, shots remaining (bullet icons), ducks hit/escaped, and lives display
- "FASTER!" notification overlay at every third round

#### Pause / Quit
- ESC toggles pause from the playing state
- Q quits to game over while paused
- Click resumes from pause

#### Leaderboard
- Arcade-style top-10 board stored server-side as JSON, persisted across container restarts via a Docker named volume
- `localStorage` fallback used automatically when the Go API is unreachable (dev without backend)
- 3-letter initials entry screen with arrow-key navigation and blink cursor
- New entry highlighted with pulsing color on the leaderboard
- Auto-dismiss after 14 seconds or on click

#### Infrastructure
- Multi-stage Dockerfile: Node 20 Alpine builds Vite frontend → Go 1.22 Alpine builds server → Alpine 3.19 minimal runtime
- `docker-compose.yml` with named volume scoped to `/app/data` (scores only, not app binaries)
- `.dockerignore` excludes `node_modules`, `dist`, `bin`, `static`, `scores.json`, VCS, and editor files
- `Makefile` with targets: `serve`, `dev-frontend`, `dev-server`, `build-frontend`, `build-server`, `build`, `docker`, `docker-run`, `clean`
- Vite dev proxy: `/api` → `http://localhost:8080` for hot-reload development
- `/healthz` endpoint for Docker healthcheck

---

[0.1.0]: https://github.com/jwhitten37-dev/duck-hunt-web/releases/tag/v0.1.0
