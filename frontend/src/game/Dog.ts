/**
 * Dog — the hunting-dog scene actor that appears between rounds.
 *
 * Two modes:
 *
 *   Intro sequence (showIntro)
 *   ──────────────────────────
 *   Dog runs in from the left, sniffs, then dives into the bushes.
 *   Signals completion via an onComplete callback.
 *
 *   Scene sequence (show)
 *   ──────────────────────
 *   Dog emerges from the bush line and either celebrates or laughs.
 *
 * Drawing uses sprite sheet frames when a SpriteSheet is available,
 * falling back to canvas 2D primitives when it is not.
 *
 * All drawing is in NES pixel space — caller must ctx.scale(SCALE, SCALE).
 */
import { SpriteSheet } from './SpriteSheet'

export type DogMood  = 'celebrating' | 'laughing'
type DogPhase  = 'hidden' | 'emerging' | 'visible' | 'descending'
// Intro phases:
//   running  → dog sprints in from the left
//   sniffing → dog slows, nose to ground, walks toward centre
//   alert    → dog perks up and jumps (found ducks!)
//   diving   → dog leaps into the bushes; ducks flush out
type IntroPhase = 'running' | 'sniffing' | 'alert' | 'diving'

// Y coordinate (NES px) of the grass line — used for the running intro
const GROUND_Y    = 184

// Scene emerge: dog rises from BELOW the screen so it appears from the bushes.
// At bobT=1 (fully emerged), feetY = SCENE_BASE_Y - SCENE_EMERGE_H = 188,
// placing the dog's lower ~12 px behind the bush foreground (which starts at y=176).
const SCENE_BASE_Y  = 240
const SCENE_EMERGE_H = 52

const EMERGE_MS   = 500
const HOLD_MS     = 1800
const DESCEND_MS  = 400

// Intro timing constants
const RUN_SPEED_PX_S  = 68    // NES pixels per second during sprint
const RUN_TARGET_X    = 80    // x where dog slows to a sniff-walk
const SNIFF_SPEED     = 22    // NES px/s during slow sniff-walk
const SNIFF_TARGET_X  = 120   // x where dog stops and goes alert
const SNIFF_MS        = 1400  // max sniff-walk duration (safety cap)
const ALERT_MS        = 700   // dog jumps excitedly before diving
const DIVE_MS         = 520   // dog leaps into the bushes
const DIVE_OFFSET     = 65    // NES px dog sinks below GROUND_Y (fully hides sprite)

// How long to hold each running sprite frame
const RUN_FRAME_MS    = 110
// Alert jump frame switch rate
const ALERT_FRAME_MS  = 140

export class Dog {
  // ── Scene (celebrate / laugh) state ───────────────────────────────────────
  private phase:      DogPhase = 'hidden'
  private mood:       DogMood  = 'celebrating'
  private phaseTimer = 0
  private bobT       = 0
  private ducksHit   = 0

  // ── Intro (running) state ─────────────────────────────────────────────────
  private introActive = false
  private introPhase: IntroPhase = 'running'
  private introX     = -26.0   // NES px, starts off-screen left
  private introTimer = 0
  private runCycle   = 0       // drives leg alternation and vertical bob (fallback)
  private introOnComplete?: () => void

  // Sprite frame cycling
  private runFrameIndex  = 0
  private runFrameTimer  = 0
  private alertFrameIdx  = 0   // 0 or 1 — cycles dog_jump_0 / dog_jump_1
  private alertFrameTimer = 0

  // Fixed horizontal centre for emerge/scene
  readonly x = 128

  private readonly sheet: SpriteSheet | null

  // ─── Constructor ────────────────────────────────────────────────────────────

  constructor(sheet: SpriteSheet | null = null) {
    this.sheet = sheet
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /** True once the scene (celebrate/laugh) sequence is fully complete. */
  get isDone(): boolean { return this.phase === 'hidden' && !this.introActive }

  /** True while the running intro is still in progress. */
  get introIsDone(): boolean { return !this.introActive }

  // ─── Scene sequence ───────────────────────────────────────────────────────

  /** Immediately hide the dog (used when a game ends mid-animation). */
  hide(): void {
    this.phase       = 'hidden'
    this.introActive = false
  }

  /** Kick off the celebrate-or-laugh scene. */
  show(mood: DogMood, ducksHit = 0): void {
    this.mood       = mood
    this.ducksHit   = ducksHit
    this.phase      = 'emerging'
    this.phaseTimer = 0
    this.bobT       = 0
    this.introActive = false
  }

  // ─── Intro sequence ───────────────────────────────────────────────────────

  /**
   * Start the round-intro animation: dog runs in from the left, sniffs,
   * then dives into the bushes.  onComplete is called when the dive ends.
   */
  showIntro(onComplete: () => void): void {
    this.introActive      = true
    this.introPhase       = 'running'
    this.introX           = -26
    this.introTimer       = 0
    this.runCycle         = 0
    this.runFrameIndex    = 0
    this.runFrameTimer    = 0
    this.alertFrameIdx    = 0
    this.alertFrameTimer  = 0
    this.introOnComplete  = onComplete
    this.phase            = 'hidden'
  }

  // ─── Update ───────────────────────────────────────────────────────────────

  update(dt: number): void {
    if (this.introActive) {
      this.updateIntro(dt)
      return
    }
    if (this.phase === 'hidden') return
    this.phaseTimer += dt

    switch (this.phase) {
      case 'emerging':
        this.bobT = Math.min(this.phaseTimer / EMERGE_MS, 1)
        if (this.phaseTimer >= EMERGE_MS) { this.phase = 'visible'; this.phaseTimer = 0; this.bobT = 1 }
        break
      case 'visible':
        if (this.phaseTimer >= HOLD_MS) { this.phase = 'descending'; this.phaseTimer = 0 }
        break
      case 'descending':
        this.bobT = 1 - Math.min(this.phaseTimer / DESCEND_MS, 1)
        if (this.phaseTimer >= DESCEND_MS) { this.phase = 'hidden'; this.bobT = 0 }
        break
    }
  }

  private updateIntro(dt: number): void {
    const sec = dt / 1000
    this.introTimer += dt

    // Run-frame cycling (used during sprint)
    this.runFrameTimer += dt
    while (this.runFrameTimer >= RUN_FRAME_MS) {
      this.runFrameTimer -= RUN_FRAME_MS
      this.runFrameIndex = (this.runFrameIndex + 1) % 5
    }

    // Alert-frame cycling (used during alert jump)
    this.alertFrameTimer += dt
    while (this.alertFrameTimer >= ALERT_FRAME_MS) {
      this.alertFrameTimer -= ALERT_FRAME_MS
      this.alertFrameIdx = (this.alertFrameIdx + 1) % 2
    }

    switch (this.introPhase) {

      case 'running':
        this.introX   += RUN_SPEED_PX_S * sec
        this.runCycle += sec * 9
        if (this.introX >= RUN_TARGET_X) {
          this.introX     = RUN_TARGET_X
          this.introPhase = 'sniffing'
          this.introTimer = 0
        }
        break

      case 'sniffing':
        // Slow nose-to-ground walk toward the centre of the screen
        this.runCycle += sec * 3
        this.introX    = Math.min(this.introX + SNIFF_SPEED * sec, SNIFF_TARGET_X)
        // Transition once the dog reaches the target OR the time cap expires
        if (this.introX >= SNIFF_TARGET_X || this.introTimer >= SNIFF_MS) {
          this.introX     = Math.min(this.introX, SNIFF_TARGET_X)
          this.introPhase = 'alert'
          this.introTimer = 0
        }
        break

      case 'alert':
        // Dog perks up and bounces — ducks detected!
        if (this.introTimer >= ALERT_MS) {
          this.introPhase = 'diving'
          this.introTimer = 0
        }
        break

      case 'diving':
        if (this.introTimer >= DIVE_MS) {
          this.introActive = false
          this.introOnComplete?.()
        }
        break
    }
  }

  // ─── Draw ─────────────────────────────────────────────────────────────────

  /** Draw onto a context already scaled to NES pixel space. */
  draw(ctx: CanvasRenderingContext2D): void {
    if (this.introActive) {
      this.drawIntro(ctx)
      return
    }
    if (this.phase === 'hidden') return

    const feetY = SCENE_BASE_Y - SCENE_EMERGE_H * this.bobT

    if (this.sheet?.isLoaded) {
      ctx.imageSmoothingEnabled = false
      let frameName: string
      if (this.mood === 'celebrating') {
        frameName = this.ducksHit <= 1 ? 'dog_success_1' : 'dog_success_2'
      } else {
        frameName = Math.floor(this.phaseTimer / 400) % 2 === 0 ? 'dog_fail_0' : 'dog_fail_1'
      }
      this.drawSpriteBottomCenter(ctx, frameName, this.x, feetY)
    } else {
      ctx.save()
      ctx.translate(this.x, feetY)
      ctx.imageSmoothingEnabled = false
      if (this.mood === 'celebrating') {
        this.drawCelebrating(ctx)
      } else {
        this.drawLaughing(ctx)
      }
      ctx.restore()
    }
  }

  private drawIntro(ctx: CanvasRenderingContext2D): void {
    // Vertical bob while running
    const bobAmp  = this.introPhase === 'running' ? 2.5 : 0
    const bobY    = Math.abs(Math.sin(this.runCycle)) * bobAmp

    // Dive: dog sinks DIVE_OFFSET px below ground over DIVE_MS
    const diveT   = this.introPhase === 'diving'
      ? Math.min(this.introTimer / DIVE_MS, 1)
      : 0
    const diveOff = diveT * DIVE_OFFSET

    // Alert: dog bounces upward on an arc (sine curve peaks in the middle)
    const alertT   = this.introPhase === 'alert'
      ? Math.min(this.introTimer / ALERT_MS, 1)
      : 0
    const alertBob = Math.sin(alertT * Math.PI) * 12   // 12 NES px rise at peak

    const feetY = GROUND_Y - bobY + diveOff - alertBob

    if (this.sheet?.isLoaded) {
      ctx.imageSmoothingEnabled = false
      let frameName: string
      switch (this.introPhase) {
        case 'running':
          frameName = `dog_run_${this.runFrameIndex}`
          break
        case 'sniffing':
          frameName = 'dog_found'
          break
        case 'alert':
          frameName = this.alertFrameIdx === 0 ? 'dog_jump_0' : 'dog_jump_1'
          break
        case 'diving':
        default:
          frameName = 'dog_found'
          break
      }
      this.drawSpriteBottomCenter(ctx, frameName, this.introX, feetY)
    } else {
      ctx.save()
      ctx.translate(this.introX, feetY)
      // Tilt forward while sniffing or alert
      if (this.introPhase === 'sniffing') ctx.rotate(0.22)
      if (this.introPhase === 'alert')    ctx.rotate(-0.15)  // perk up
      this.drawSideViewDog(ctx)
      ctx.restore()
    }
  }

  // ─── Sprite helper ────────────────────────────────────────────────────────

  private drawSpriteBottomCenter(
    ctx: CanvasRenderingContext2D,
    frameName: string,
    cx: number,
    bottomY: number,
  ): void {
    const f = this.sheet!.getFrameRect(frameName)
    if (!f) return
    const dx = Math.round(cx - f.w / 2)
    const dy = Math.round(bottomY - f.h)
    this.sheet!.draw(ctx, frameName, dx, dy)
  }

  // ─── Drawing — celebrating (canvas fallback) ─────────────────────────────

  private drawCelebrating(ctx: CanvasRenderingContext2D): void {
    // Body (0 = feet, negative = upward)
    ctx.fillStyle = '#c8843c'
    ctx.beginPath(); ctx.ellipse(0, -12, 11, 11, 0, 0, Math.PI * 2); ctx.fill()

    // Head
    ctx.beginPath(); ctx.arc(0, -26, 9, 0, Math.PI * 2); ctx.fill()

    // Ears
    ctx.fillStyle = '#a06428'
    this.drawEar(ctx, -5, -32,  -12, -42, -3, -33)
    this.drawEar(ctx,  5, -32,   12, -42,  3, -33)

    // Eyes — happy dots
    ctx.fillStyle = '#1a0800'
    ctx.beginPath(); ctx.arc(-3.5, -27, 1.8, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc( 3.5, -27, 1.8, 0, Math.PI * 2); ctx.fill()

    // Nose
    ctx.fillStyle = '#1a0800'
    ctx.beginPath(); ctx.ellipse(0, -23, 3, 2, 0, 0, Math.PI * 2); ctx.fill()

    // Smile
    ctx.strokeStyle = '#1a0800'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(0, -21, 3.5, 0.15, Math.PI - 0.15); ctx.stroke()

    // Raised paws
    ctx.fillStyle = '#c8843c'
    ctx.beginPath(); ctx.ellipse(-14, -24, 5, 3, -0.7, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse( 14, -24, 5, 3,  0.7, 0, Math.PI * 2); ctx.fill()

    // Duck trophy above head
    this.drawTrophyDuck(ctx, 0, -40)
  }

  // ─── Drawing — laughing (canvas fallback) ─────────────────────────────────

  private drawLaughing(ctx: CanvasRenderingContext2D): void {
    // Body
    ctx.fillStyle = '#c8843c'
    ctx.beginPath(); ctx.ellipse(0, -12, 11, 11, 0, 0, Math.PI * 2); ctx.fill()

    // Head (tilted back in laughter)
    ctx.save()
    ctx.translate(0, -26)
    ctx.rotate(0.28)

    ctx.fillStyle = '#c8843c'
    ctx.beginPath(); ctx.arc(0, 0, 9, 0, Math.PI * 2); ctx.fill()

    // Ears
    ctx.fillStyle = '#a06428'
    this.drawEar(ctx, -5, -6, -12, -15, -3, -7)
    this.drawEar(ctx,  5, -6,  12, -15,  3, -7)

    // Eyes closed (curved lines)
    ctx.strokeStyle = '#1a0800'; ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.arc(-3.5, -1, 2.5, Math.PI, 0); ctx.stroke()
    ctx.beginPath(); ctx.arc( 3.5, -1, 2.5, Math.PI, 0); ctx.stroke()

    // Nose
    ctx.fillStyle = '#1a0800'
    ctx.beginPath(); ctx.ellipse(0, 2, 3, 2, 0, 0, Math.PI * 2); ctx.fill()

    // Open laughing mouth
    ctx.fillStyle = '#cc1010'
    ctx.beginPath(); ctx.arc(0, 5, 5, 0, Math.PI); ctx.fill()

    // Teeth
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(-4, 5, 3.5, 3)
    ctx.fillRect(0.5, 5, 3.5, 3)

    ctx.restore()

    // Paws at sides (ha ha pose)
    ctx.fillStyle = '#c8843c'
    ctx.beginPath(); ctx.ellipse(-14, -18, 5, 3, 0.4, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.ellipse( 14, -18, 5, 3, -0.4, 0, Math.PI * 2); ctx.fill()
  }

  // ─── Helpers (canvas fallback) ────────────────────────────────────────────

  private drawEar(
    ctx: CanvasRenderingContext2D,
    x1: number, y1: number,
    x2: number, y2: number,
    x3: number, y3: number,
  ): void {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.lineTo(x3, y3)
    ctx.closePath()
    ctx.fill()
  }

  private drawTrophyDuck(ctx: CanvasRenderingContext2D, cx: number, cy: number): void {
    ctx.fillStyle = '#2c2c2c'
    ctx.beginPath(); ctx.ellipse(cx, cy, 8, 5, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(cx + 7, cy - 4, 4.5, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#e8a000'
    ctx.beginPath(); ctx.ellipse(cx + 11, cy - 3, 3, 2, -0.2, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = '#484848'
    ctx.beginPath(); ctx.ellipse(cx - 1, cy - 1, 5, 2.5, -0.3, 0, Math.PI * 2); ctx.fill()
  }

  // ─── Intro drawing (canvas fallback) ─────────────────────────────────────

  private drawSideViewDog(ctx: CanvasRenderingContext2D): void {
    // ── Tail ──────────────────────────────────────────────────────────────
    ctx.strokeStyle = '#c8843c'
    ctx.lineWidth   = 3.5
    ctx.lineCap     = 'round'
    ctx.beginPath()
    ctx.moveTo(-12, -10)
    ctx.quadraticCurveTo(-22, -22, -16, -28)
    ctx.stroke()

    // ── Body ──────────────────────────────────────────────────────────────
    ctx.fillStyle = '#c8843c'
    ctx.beginPath(); ctx.ellipse(0, -9, 14, 7, 0, 0, Math.PI * 2); ctx.fill()

    // Body spot
    ctx.fillStyle = '#a06428'
    ctx.beginPath(); ctx.ellipse(-4, -10, 5, 4, 0.3, 0, Math.PI * 2); ctx.fill()

    // ── Head ──────────────────────────────────────────────────────────────
    ctx.fillStyle = '#c8843c'
    ctx.beginPath(); ctx.arc(12, -15, 7.5, 0, Math.PI * 2); ctx.fill()

    // Floppy ear
    ctx.fillStyle = '#a06428'
    ctx.beginPath(); ctx.ellipse(9, -10, 4, 8, 0.25, 0, Math.PI * 2); ctx.fill()

    // ── Snout ─────────────────────────────────────────────────────────────
    ctx.fillStyle = '#c8843c'
    ctx.beginPath(); ctx.ellipse(19, -13, 6, 3.5, 0, 0, Math.PI * 2); ctx.fill()

    // Nose
    ctx.fillStyle = '#1a0800'
    ctx.beginPath(); ctx.arc(23, -13, 2.2, 0, Math.PI * 2); ctx.fill()

    // Eye
    ctx.fillStyle = '#1a0800'
    ctx.beginPath(); ctx.arc(14, -16, 1.6, 0, Math.PI * 2); ctx.fill()

    // ── Legs ──────────────────────────────────────────────────────────────
    ctx.fillStyle = '#a06428'
    const swing = Math.sin(this.runCycle) * 4

    const legW = 3.5
    ctx.beginPath(); ctx.roundRect( 4 - legW / 2, -3, legW, 9 + swing, 1); ctx.fill()
    ctx.beginPath(); ctx.roundRect(-4 - legW / 2, -3, legW, 9 - swing, 1); ctx.fill()

    ctx.fillStyle = '#8c5820'
    ctx.beginPath(); ctx.roundRect( 8 - legW / 2, -2, legW, 7 - swing, 1); ctx.fill()
    ctx.beginPath(); ctx.roundRect(-8 - legW / 2, -2, legW, 7 + swing, 1); ctx.fill()
  }
}
