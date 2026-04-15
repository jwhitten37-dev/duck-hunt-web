/**
 * Game — root class for Duck Hunt web recreation.
 *
 * Phase 7: Polish
 *   • Gun flash        — white screen tint on every shot (80 ms)
 *   • Empty-gun click  — dry click sound + red bullet-area flash (no ammo)
 *   • Score popups     — floating "+N" text rises from duck landing spot
 *   • Perfect banner   — "PERFECT!" overlay + bonus points on full-clear rounds
 *   • Speed-up notif   — "FASTER!" overlay at round milestones (every 3 rounds)
 *
 * Full state machine
 * ──────────────────
 *   title → round_intro → playing → [round_banner] → round_pause
 *             ↑                          ↓ (lives=0)      ↓
 *             └──────── spawn_pause ← dog_scene      game_over → title
 */
import { Scene }                          from './Scene'
import { Duck }                          from './Duck'
import { Dog }                           from './Dog'
import { HUD, HUDData }                  from './HUD'
import { InputManager }                  from './InputManager'
import { SoundManager }                  from './SoundManager'
import { TitleScreen }                   from './TitleScreen'
import { ScorePopup }                    from './ScorePopup'
import { NameEntryScreen }               from './NameEntryScreen'
import { LeaderboardScreen, BoardEntry } from './LeaderboardScreen'
import { SpriteSheet }                   from './SpriteSheet'

// ─── Constants ────────────────────────────────────────────────────────────────

const NES_W           = 256
const NES_H           = 240
const DUCKS_PER_ROUND = 2
const SHOTS_PER_ROUND = 3
const MAX_LIVES       = 3

const ROUND_END_PAUSE   = 600
const SPAWN_START_PAUSE = 400

const GUN_FLASH_MS    = 80
const EMPTY_FLASH_MS  = 380
const BANNER_MS       = 3200
const SPEED_NOTIF_MS  = 1400

// Fixed points per duck (independent of round)
const POINTS_PER_DUCK = 500

// Flat bonus awarded for a perfect round (all ducks hit)
const PERFECT_BONUS = 500

// ─── Types ────────────────────────────────────────────────────────────────────

type GamePhase =
  | 'title'
  | 'round_intro'
  | 'playing'
  | 'paused'
  | 'round_banner'   // "PERFECT!" overlay — shown after dog scene on a perfect round
  | 'round_pause'
  | 'dog_scene'
  | 'spawn_pause'
  | 'game_over'
  | 'name_entry'     // arcade initials entry after a qualifying score
  | 'leaderboard'    // top-10 display

// ─── Game ─────────────────────────────────────────────────────────────────────

export class Game {
  static readonly WIDTH         = NES_W
  static readonly HEIGHT        = NES_H
  static readonly SCALE         = 3
  static readonly FIXED_STEP_MS = 1000 / 60

  private readonly canvas:       HTMLCanvasElement
  private readonly ctx:          CanvasRenderingContext2D
  private readonly sheet:        SpriteSheet | null
  private readonly scene:        Scene
  private readonly input:        InputManager
  private readonly hud:          HUD
  private readonly dog:          Dog
  private readonly sound:        SoundManager
  private readonly titleScreen:  TitleScreen
  private readonly popups:       ScorePopup
  private readonly nameEntry:    NameEntryScreen
  private readonly leaderboard:  LeaderboardScreen

  // Loop bookkeeping
  private animationId = 0
  private lastTime    = 0
  private accumulator = 0

  // Core game state
  private phase:    GamePhase = 'title'
  private phaseTimer = 0
  private round      = 1
  private score      = 0
  private hiScore    = 0
  private lives      = MAX_LIVES
  private shotsLeft  = SHOTS_PER_ROUND
  private ducks:     Duck[] = []

  // Round tracking
  private ducksHitThisRound     = 0
  private ducksEscapedThisRound = 0

  // Consecutive-perfect streak (0 = no multiplier, 1 = ×0.1, 2 = ×0.2 …)
  private perfectStreak       = 0
  private lastMultiplierBonus = 0   // stored for banner display
  private roundWasPerfect     = false

  // Audio gate
  private audioStarted = false

  // Leaderboard fetch state
  private boardLoaded  = false
  private cachedBoard: BoardEntry[] = []

  // ── Polish timers ─────────────────────────────────────────────────────────
  private gunFlashTimer   = 0   // white screen flash after shooting
  private emptyFlashTimer = 0   // red bullet-area flash when out of ammo
  private bannerTimer     = 0   // "PERFECT!" overlay
  private speedNotifTimer = 0   // "FASTER!" overlay at round milestones

  // Pause
  private pausedFrom: GamePhase = 'playing'

  // Game-over screen
  private gameOverBlink      = true
  private gameOverBlinkTimer = 0
  private gameOverAutoTimer  = 0    // auto-advances once board is loaded
  private readonly GAME_OVER_HOLD_MS = 1400

  // ─── Constructor ────────────────────────────────────────────────────────────

  constructor(canvas: HTMLCanvasElement, sheet: SpriteSheet | null = null) {
    this.canvas = canvas
    this.canvas.width  = NES_W * Game.SCALE
    this.canvas.height = NES_H * Game.SCALE

    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not acquire 2D rendering context')
    this.ctx = ctx
    this.ctx.imageSmoothingEnabled = false

    this.sheet        = sheet
    this.scene        = new Scene(Game.SCALE, sheet)
    this.input        = new InputManager(canvas, Game.SCALE)
    this.hud          = new HUD(Game.SCALE)
    this.dog          = new Dog(sheet)
    this.sound        = new SoundManager()
    this.titleScreen  = new TitleScreen(sheet)
    this.popups       = new ScorePopup()
    this.nameEntry    = new NameEntryScreen()
    this.leaderboard  = new LeaderboardScreen()

    this.input.onShot((x, y) => this.handleClick(x, y))

    window.addEventListener('keydown', (e) => {
      if (e.key === 'm' || e.key === 'M') this.sound.toggleMute()
      if (e.key === 'Escape')             this.handleEscape()
      if ((e.key === 'q' || e.key === 'Q') && this.phase === 'paused') this.quitToGameOver()

      // Route all keys to name entry while active
      if (this.phase === 'name_entry') {
        this.nameEntry.handleKey(e.key)
        if (this.nameEntry.isDone) void this.submitScore()
      }
    })
  }

  // ─── Public ─────────────────────────────────────────────────────────────────

  start(): void {
    this.lastTime = performance.now()
    this.loop(this.lastTime)
  }

  stop(): void {
    cancelAnimationFrame(this.animationId)
  }

  // ─── Game loop ──────────────────────────────────────────────────────────────

  private loop(timestamp: number): void {
    this.animationId = requestAnimationFrame((t) => this.loop(t))

    const dt = timestamp - this.lastTime
    this.lastTime = timestamp
    this.accumulator += Math.min(dt, 100)

    while (this.accumulator >= Game.FIXED_STEP_MS) {
      this.update(Game.FIXED_STEP_MS)
      this.accumulator -= Game.FIXED_STEP_MS
    }

    this.render()
  }

  // ─── Update ─────────────────────────────────────────────────────────────────

  private update(dt: number): void {
    // Polish timers tick in all states
    if (this.gunFlashTimer   > 0) this.gunFlashTimer   = Math.max(0, this.gunFlashTimer   - dt)
    if (this.emptyFlashTimer > 0) this.emptyFlashTimer = Math.max(0, this.emptyFlashTimer - dt)
    if (this.speedNotifTimer > 0) this.speedNotifTimer = Math.max(0, this.speedNotifTimer - dt)

    this.popups.update(dt)

    switch (this.phase) {

      case 'title':
        this.titleScreen.update(dt)
        break

      case 'round_intro':
        this.dog.update(dt)
        if (this.dog.introIsDone) this.phase = 'playing'
        break

      case 'playing':
        this.updatePlaying(dt)
        break

      case 'round_banner':
        this.bannerTimer -= dt
        if (this.bannerTimer <= 0) {
          this.phase      = 'spawn_pause'
          this.phaseTimer = SPAWN_START_PAUSE
        }
        break

      case 'round_pause':
        this.phaseTimer -= dt
        if (this.phaseTimer <= 0) {
          const mood = this.ducksHitThisRound > 0 ? 'celebrating' : 'laughing'
          this.dog.show(mood, this.ducksHitThisRound)
          if (mood === 'laughing') this.sound.playDogLaugh()
          this.phase = 'dog_scene'
        }
        break

      case 'dog_scene':
        this.dog.update(dt)
        if (this.dog.isDone) {
          if (this.roundWasPerfect) {
            this.phase       = 'round_banner'
            this.bannerTimer = BANNER_MS
          } else {
            this.phase      = 'spawn_pause'
            this.phaseTimer = SPAWN_START_PAUSE
          }
        }
        break

      case 'spawn_pause':
        this.phaseTimer -= dt
        if (this.phaseTimer <= 0) {
          this.round++
          // Speed-up notification every 3 rounds
          if (this.round % 3 === 0) {
            this.speedNotifTimer = SPEED_NOTIF_MS
          }
          this.phase = 'round_intro'
          this.dog.showIntro(() => this.spawnRound())
        }
        break

      case 'paused':
        this.gameOverBlinkTimer += dt
        if (this.gameOverBlinkTimer >= 520) {
          this.gameOverBlinkTimer = 0
          this.gameOverBlink = !this.gameOverBlink
        }
        break

      case 'name_entry':
        this.nameEntry.update(dt)
        break

      case 'leaderboard':
        this.leaderboard.update(dt)
        if (this.leaderboard.isDismissed) this.resetToTitle()
        break

      case 'game_over':
        this.gameOverBlinkTimer += dt
        if (this.gameOverBlinkTimer >= 520) {
          this.gameOverBlinkTimer = 0
          this.gameOverBlink = !this.gameOverBlink
        }
        this.gameOverAutoTimer += dt
        // Auto-advance once the minimum hold time is up AND board is loaded
        if (this.gameOverAutoTimer >= this.GAME_OVER_HOLD_MS && this.boardLoaded) {
          this.advanceFromGameOver()
        }
        break
    }
  }

  private updatePlaying(dt: number): void {
    for (const duck of this.ducks) duck.update(dt)

    // Collect resolved ducks
    const resolved = this.ducks.filter(d => d.isResolved)
    for (const duck of resolved) {
      if (duck.landed) {
        // Flat 500 per duck regardless of round
        this.score  += POINTS_PER_DUCK
        this.hiScore = Math.max(this.hiScore, this.score)
        this.ducksHitThisRound++
        this.sound.playScore()
        this.popups.add(duck.x, duck.y, POINTS_PER_DUCK)
      } else {
        this.ducksEscapedThisRound++
        this.sound.playDuckEscape()
      }
    }
    this.ducks = this.ducks.filter(d => !d.isResolved)

    // Round over
    if (this.ducks.length === 0) {
      if (this.ducksHitThisRound === 0) {
        this.lives = Math.max(0, this.lives - 1)
      }

      if (this.lives === 0) {
        this.ducks = []
        this.dog.hide()
        this.sound.stopMusic()
        this.gameOverAutoTimer = 0
        this.phase = 'game_over'
        void this.fetchLeaderboard()
        return
      }

      if (this.ducksHitThisRound === DUCKS_PER_ROUND) {
        // Perfect round: flat bonus + consecutive-streak multiplier
        //   roundTotal = (ducks × 500) + 500 flat bonus
        //   multiplierBonus = roundTotal × (streak × 0.1)
        const roundTotal      = DUCKS_PER_ROUND * POINTS_PER_DUCK + PERFECT_BONUS
        const multiplierBonus = Math.round(roundTotal * this.perfectStreak * 0.1)
        this.score  += PERFECT_BONUS + multiplierBonus
        this.hiScore = Math.max(this.hiScore, this.score)

        this.lastMultiplierBonus = multiplierBonus
        this.perfectStreak++          // streak grows for next round
        this.roundWasPerfect = true
      } else {
        // Not perfect — streak resets, no multiplier applied
        this.perfectStreak       = 0
        this.lastMultiplierBonus = 0
        this.roundWasPerfect     = false
      }

      // Always go through round_pause → dog_scene; banner shows after dog on perfect rounds
      this.phase      = 'round_pause'
      this.phaseTimer = ROUND_END_PAUSE
    }
  }

  // ─── Input ──────────────────────────────────────────────────────────────────

  private handleClick(x: number, y: number): void {
    if (!this.audioStarted) {
      this.sound.resume()
      this.audioStarted = true
    }

    switch (this.phase) {
      case 'title':       this.startGame(); break
      case 'paused':      this.resumeGame(); break
      case 'playing':     this.handleShot(x, y); break
      case 'leaderboard': this.leaderboard.dismiss(); this.resetToTitle(); break
      case 'game_over':
        // Let the player click through early; if board isn't loaded yet, go to title as fallback
        if (this.boardLoaded) {
          this.advanceFromGameOver()
        } else {
          this.resetToTitle()
        }
        break
    }
  }

  private handleShot(x: number, y: number): void {
    if (this.shotsLeft <= 0) {
      // Empty gun
      this.sound.playEmptyClick()
      this.emptyFlashTimer = EMPTY_FLASH_MS
      return
    }

    this.shotsLeft--
    this.gunFlashTimer = GUN_FLASH_MS
    this.sound.playGunshot()

    let hit = false
    for (const duck of this.ducks) {
      if (duck.tryHit(x, y)) { hit = true; break }
    }
    if (hit) this.sound.playDuckHit()
  }

  // ─── Flow control ────────────────────────────────────────────────────────────

  private startGame(): void {
    this.round               = 1
    this.score               = 0
    this.lives               = MAX_LIVES
    this.perfectStreak       = 0
    this.lastMultiplierBonus = 0
    this.roundWasPerfect     = false
    this.boardLoaded         = false
    this.cachedBoard         = []
    this.phase               = 'round_intro'
    this.sound.startMusic()
    this.audioStarted = true
    this.dog.showIntro(() => this.spawnRound())
  }

  private resetToTitle(): void {
    this.phase = 'title'
    this.sound.startMusic()
  }

  private qualifiesForBoard(): boolean {
    return this.cachedBoard.length < 10
      || this.score > (this.cachedBoard[this.cachedBoard.length - 1]?.score ?? 0)
  }

  private advanceFromGameOver(): void {
    if (this.score > 0 && this.qualifiesForBoard()) {
      this.nameEntry.reset()
      this.phase = 'name_entry'
    } else {
      this.leaderboard.setEntries(this.cachedBoard)
      this.leaderboard.clearNewEntry()
      this.leaderboard.reset()
      this.phase = 'leaderboard'
    }
  }

  // ─── Board storage helpers ───────────────────────────────────────────────────
  // localStorage key — used as a fallback when the Go API is unavailable (dev mode)
  private static readonly LS_KEY = 'duck-hunt-board'

  private lsLoad(): BoardEntry[] {
    try {
      return JSON.parse(localStorage.getItem(Game.LS_KEY) ?? '[]') as BoardEntry[]
    } catch { return [] }
  }

  private lsSave(board: BoardEntry[]): void {
    try { localStorage.setItem(Game.LS_KEY, JSON.stringify(board)) } catch { /* quota */ }
  }

  private lsInsert(name: string, score: number): BoardEntry[] {
    const board = [...this.lsLoad(), { name, score }]
    board.sort((a, b) => b.score - a.score)
    return board.slice(0, 10)
  }

  // ─── Async board operations ──────────────────────────────────────────────────

  private async fetchLeaderboard(): Promise<void> {
    this.boardLoaded = false
    try {
      const resp = await fetch('/api/scores')
      if (!resp.ok) throw new Error('bad response')
      this.cachedBoard = await resp.json() as BoardEntry[]
      this.lsSave(this.cachedBoard)          // keep localStorage in sync
    } catch {
      this.cachedBoard = this.lsLoad()       // offline fallback
    }
    this.boardLoaded = true
  }

  private async submitScore(): Promise<void> {
    const initials = this.nameEntry.initials
    let finalBoard: BoardEntry[]

    try {
      const resp = await fetch('/api/scores', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: initials, score: this.score }),
      })
      if (!resp.ok) throw new Error('bad response')
      finalBoard = await resp.json() as BoardEntry[]
      this.lsSave(finalBoard)                // keep localStorage in sync
    } catch {
      // API unavailable — manage the board locally
      finalBoard = this.lsInsert(initials, this.score)
      this.lsSave(finalBoard)
    }

    this.leaderboard.setEntries(finalBoard)

    // Highlight only if the submission actually made the board
    const onBoard = finalBoard.some(e => e.name === initials && e.score === this.score)
    if (onBoard) {
      this.leaderboard.setNewEntry(initials, this.score)
    } else {
      this.leaderboard.clearNewEntry()
    }

    this.leaderboard.reset()
    this.phase = 'leaderboard'
  }

  private handleEscape(): void {
    if (this.phase === 'playing') {
      this.pausedFrom = this.phase
      this.phase      = 'paused'
      this.gameOverBlink      = true
      this.gameOverBlinkTimer = 0
    } else if (this.phase === 'paused') {
      this.resumeGame()
    }
  }

  private resumeGame(): void {
    this.phase = this.pausedFrom
  }

  private quitToGameOver(): void {
    this.ducks = []
    this.dog.hide()
    this.sound.stopMusic()
    this.gameOverAutoTimer = 0
    this.phase = 'game_over'
    void this.fetchLeaderboard()
  }

  private spawnRound(): void {
    this.ducks                 = []
    this.shotsLeft             = SHOTS_PER_ROUND
    this.ducksHitThisRound     = 0
    this.ducksEscapedThisRound = 0

    const speed = 1 + (this.round - 1) * 0.07
    for (let i = 0; i < DUCKS_PER_ROUND; i++) {
      this.ducks.push(Duck.spawn(speed, undefined, this.sheet))
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  private render(): void {
    const { ctx } = this

    // Full-screen phases draw their own backgrounds — skip the scene entirely
    if (this.phase === 'name_entry') {
      this.nameEntry.draw(ctx, Game.SCALE, this.score)
      if (this.sound.isMuted) this.drawMuteIcon(ctx)
      return
    }
    if (this.phase === 'leaderboard') {
      this.leaderboard.draw(ctx, Game.SCALE)
      if (this.sound.isMuted) this.drawMuteIcon(ctx)
      return
    }

    this.scene.drawBackground(ctx)

    ctx.save()
    ctx.scale(Game.SCALE, Game.SCALE)
    ctx.imageSmoothingEnabled = false
    for (const duck of this.ducks) duck.draw(ctx)
    this.dog.draw(ctx)
    ctx.restore()

    this.scene.drawForeground(ctx)

    // Phase-specific content
    switch (this.phase) {
      case 'title':
        this.titleScreen.draw(ctx, Game.SCALE, this.hiScore)
        break

      case 'paused':
        this.hud.draw(ctx, this.hudData())
        this.renderPaused(ctx)
        break

      case 'game_over':
        this.renderGameOver(ctx)
        break

      case 'round_banner':
        this.hud.draw(ctx, this.hudData())
        this.renderBanner(ctx, 'PERFECT!', '#ffdd00', '#884400')
        break

      default:
        this.hud.draw(ctx, this.hudData())
        if (this.phase === 'playing') {
          this.drawCrosshair(ctx, this.input.x * Game.SCALE, this.input.y * Game.SCALE)
        }
        break
    }

    // ── Polish overlays (drawn last — always on top) ───────────────────────

    // Floating score popups
    this.popups.draw(ctx, Game.SCALE)

    // Speed-up notification — fades in/out
    if (this.speedNotifTimer > 0 && this.phase === 'round_intro') {
      this.renderSpeedNotif(ctx)
    }

    // Empty-gun flash — red tint over the bullet area
    if (this.emptyFlashTimer > 0) {
      const alpha = (this.emptyFlashTimer / EMPTY_FLASH_MS) * 0.45
      const S = Game.SCALE
      ctx.fillStyle = `rgba(200,0,0,${alpha})`
      ctx.fillRect(0, 192 * S, NES_W * S, (NES_H - 192) * S)
    }

    // Gun flash — white tint over the full canvas
    if (this.gunFlashTimer > 0) {
      const alpha = (this.gunFlashTimer / GUN_FLASH_MS) * 0.22
      ctx.fillStyle = `rgba(255,250,220,${alpha})`
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    if (this.sound.isMuted) this.drawMuteIcon(ctx)
  }

  // ─── Banner overlays ────────────────────────────────────────────────────────

  private renderBanner(
    ctx: CanvasRenderingContext2D,
    text: string,
    color: string,
    shadow: string,
  ): void {
    const S = Game.SCALE
    const t = this.bannerTimer / BANNER_MS  // 1 → 0

    // Fade out in the last 30% of the banner's life
    const alpha = t < 0.3 ? t / 0.3 : 1
    ctx.save()
    ctx.globalAlpha  = alpha
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'

    // Backing stripe
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(0, 82 * S, NES_W * S, 58 * S)

    // Drop shadow
    ctx.font      = `${11 * S}px "Press Start 2P", monospace`
    ctx.fillStyle = shadow
    ctx.fillText(text, 128 * S + S, 95 * S + S)

    // Main text
    ctx.fillStyle = color
    ctx.fillText(text, 128 * S, 95 * S)

    // Bonus notes beneath
    ctx.font      = `${5 * S}px "Press Start 2P", monospace`
    ctx.fillStyle = '#ffffff'
    ctx.fillText(`+${PERFECT_BONUS} PERFECT BONUS`, 128 * S, 112 * S)

    if (this.lastMultiplierBonus > 0) {
      // Show the streak multiplier that was applied (streak - 1 because we already incremented)
      const pct = ((this.perfectStreak - 1) * 10).toFixed(0)
      ctx.fillStyle = '#80ffcc'
      ctx.fillText(`+${this.lastMultiplierBonus} STREAK x0.${pct}`, 128 * S, 122 * S)
    }

    // Show what the multiplier will be next round
    const nextPct = (this.perfectStreak * 10).toFixed(0)
    ctx.fillStyle = '#ffcc40'
    ctx.fillText(`NEXT STREAK  x0.${nextPct}`, 128 * S, 132 * S)

    ctx.restore()
  }

  private renderSpeedNotif(ctx: CanvasRenderingContext2D): void {
    const S = Game.SCALE
    const t = this.speedNotifTimer / SPEED_NOTIF_MS
    // Fade in for first 20%, hold, fade out for last 20%
    let alpha = 1
    if (t > 0.8) alpha = (1 - t) / 0.2
    else if (t < 0.2) alpha = t / 0.2

    ctx.save()
    ctx.globalAlpha  = alpha
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'

    ctx.fillStyle = 'rgba(0,0,0,0.45)'
    ctx.fillRect(0, 56 * S, NES_W * S, 18 * S)

    ctx.font      = `${8 * S}px "Press Start 2P", monospace`
    ctx.fillStyle = '#202000'
    ctx.fillText('FASTER!', 128 * S + S, 65 * S + S)
    ctx.fillStyle = '#ffe040'
    ctx.fillText('FASTER!', 128 * S, 65 * S)

    ctx.restore()
  }

  // ─── Pause overlay ──────────────────────────────────────────────────────────

  private renderPaused(ctx: CanvasRenderingContext2D): void {
    const S = Game.SCALE

    ctx.fillStyle = 'rgba(0,0,0,0.60)'
    ctx.fillRect(0, 0, NES_W * S, NES_H * S)

    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'

    // Title
    ctx.font      = `${11 * S}px "Press Start 2P", monospace`
    ctx.fillStyle = '#102030'
    ctx.fillText('PAUSED', 128 * S + S, 72 * S + S)
    ctx.fillStyle = '#60c8ff'
    ctx.fillText('PAUSED', 128 * S, 72 * S)

    // Current score
    ctx.font      = `${7 * S}px "Press Start 2P", monospace`
    ctx.fillStyle = '#ffffff'
    ctx.fillText(`SCORE  ${String(this.score).padStart(6, '0')}`, 128 * S, 100 * S)

    // Divider
    ctx.fillStyle = '#444444'
    ctx.fillRect(32 * S, 112 * S, 192 * S, S)

    // Controls
    ctx.font      = `${6 * S}px "Press Start 2P", monospace`
    ctx.fillStyle = '#aaffaa'
    ctx.fillText('ESC  RESUME', 128 * S, 125 * S)

    ctx.fillStyle = '#ffaaaa'
    if (this.gameOverBlink) {
      ctx.fillText('Q  QUIT', 128 * S, 141 * S)
    }
  }

  // ─── Game-over overlay ──────────────────────────────────────────────────────

  private renderGameOver(ctx: CanvasRenderingContext2D): void {
    const S = Game.SCALE

    ctx.fillStyle = 'rgba(0,0,0,0.55)'
    ctx.fillRect(0, 0, NES_W * S, NES_H * S)

    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'

    ctx.font      = `${11 * S}px "Press Start 2P", monospace`
    ctx.fillStyle = '#200000'
    ctx.fillText('GAME OVER', 128 * S + S, 80 * S + S)
    ctx.fillStyle = '#ff2020'
    ctx.fillText('GAME OVER', 128 * S, 80 * S)

    ctx.font      = `${7 * S}px "Press Start 2P", monospace`
    ctx.fillStyle = '#ffffff'
    ctx.fillText(`SCORE  ${String(this.score).padStart(6, '0')}`, 128 * S, 110 * S)

    ctx.font      = `${6 * S}px "Press Start 2P", monospace`
    ctx.fillStyle = '#aaaaaa'
    ctx.fillText(`HI  ${String(this.hiScore).padStart(6, '0')}`, 128 * S, 126 * S)

    ctx.font      = `${5 * S}px "Press Start 2P", monospace`
    ctx.fillStyle = this.gameOverBlink ? '#ffff60' : '#888840'
    const waitingMsg = this.boardLoaded ? 'CLICK TO CONTINUE' : 'LOADING...'
    ctx.fillText(waitingMsg, 128 * S, 158 * S)
  }

  // ─── Crosshair ──────────────────────────────────────────────────────────────

  private drawCrosshair(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    const size = 10 * Game.SCALE
    const gap  =  4 * Game.SCALE

    ctx.save()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth   = Game.SCALE
    ctx.shadowColor = '#000000'
    ctx.shadowBlur  = 2

    ctx.beginPath()
    ctx.moveTo(cx - size, cy); ctx.lineTo(cx - gap, cy)
    ctx.moveTo(cx + gap,  cy); ctx.lineTo(cx + size, cy)
    ctx.moveTo(cx, cy - size); ctx.lineTo(cx, cy - gap)
    ctx.moveTo(cx, cy + gap);  ctx.lineTo(cx, cy + size)
    ctx.stroke()
    ctx.restore()
  }

  // ─── Mute indicator ─────────────────────────────────────────────────────────

  private drawMuteIcon(ctx: CanvasRenderingContext2D): void {
    const S = Game.SCALE
    ctx.save()
    ctx.font         = `${S * 6}px "Press Start 2P", monospace`
    ctx.textAlign    = 'right'
    ctx.textBaseline = 'top'
    ctx.fillStyle    = '#ff4040'
    ctx.fillText('MUTE', (NES_W - 4) * S, 4 * S)
    ctx.restore()
  }

  // ─── HUD data ────────────────────────────────────────────────────────────────

  private hudData(): HUDData {
    return {
      score:         this.score,
      hiScore:       this.hiScore,
      round:         this.round,
      shotsLeft:     this.shotsLeft,
      maxShots:      SHOTS_PER_ROUND,
      ducksHit:      this.ducksHitThisRound,
      ducksEscaped:  this.ducksEscapedThisRound,
      ducksPerRound: DUCKS_PER_ROUND,
      lives:         this.lives,
      maxLives:      MAX_LIVES,
    }
  }
}
