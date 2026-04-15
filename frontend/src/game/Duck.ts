/**
 * Duck — a single flying duck entity.
 *
 * All positions are in NES pixel space (256 × 192 play area).
 *
 * States
 * ──────
 *   flying   → in the air, animating, hittable
 *   shot     → hit by player; freezes briefly, flashes
 *   falling  → drops to ground with gravity
 *   escaped  → flew off-screen without being hit
 *
 * Drawing uses sprite sheet frames when a SpriteSheet is available,
 * falling back to canvas 2D primitives when it is not.
 */
import { Animator }     from './Animator'
import { SpriteSheet }  from './SpriteSheet'

// ─── Types ────────────────────────────────────────────────────────────────────

export type DuckState = 'flying' | 'shot' | 'falling' | 'escaped'
export type DuckColor = 'black' | 'red' | 'blue'

// NES play-area boundaries
const PLAY_TOP    = 8    // near top of screen — ducks can fly high
const PLAY_FLOOR  = 158  // soft floor above the bush strip (which starts at ~176)
const PLAY_BOTTOM = 183  // hard ground — where falling ducks land
const PLAY_LEFT   = 0
const PLAY_RIGHT  = 256

// Hit-box half-dimensions in NES pixels (matches sprite footprint)
const HIT_W = 15
const HIT_H = 14

// Time (ms) the duck stays frozen after being shot before it falls
const SHOT_FREEZE_MS = 500

// Gravity applied while falling (NES px / s²)
const GRAVITY = 220

// After this many ms aloft, the duck escapes upward if not shot
const ESCAPE_AFTER_MS = 5500

// Maps DuckColor to sprite prefix in the FrameMap
const COLOR_PREFIX: Record<DuckColor, string> = {
  black: 'd1',
  blue:  'd2',
  red:   'd3',
}

// ─── Duck class ───────────────────────────────────────────────────────────────

export class Duck {
  x: number       // NES pixel center X
  y: number       // NES pixel center Y
  state: DuckState = 'flying'

  private vx: number
  private vy: number
  private readonly color: DuckColor
  private readonly sheet: SpriteSheet | null

  // Per-direction animators (all run simultaneously to stay in sync)
  private readonly animRight:   Animator
  private readonly animUpRight: Animator
  private readonly animFall:    Animator

  // State timers / flags
  private shotTimer   = SHOT_FREEZE_MS
  private aloftMs     = 0
  private fallVy      = 0
  private flashOn     = true
  private escaping    = false   // true once the escape sequence has triggered

  /** True when the duck has hit the ground after being shot (ready to score). */
  get landed(): boolean {
    return this.state === 'falling' && this.y >= PLAY_BOTTOM
  }

  /** True when the duck is fully done — either landed or flew away. */
  get isResolved(): boolean {
    return this.landed || this.state === 'escaped'
  }

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: DuckColor = 'black',
    sheet: SpriteSheet | null = null,
  ) {
    this.x     = x
    this.y     = y
    this.vx    = vx
    this.vy    = vy
    this.color = color
    this.sheet = sheet

    const pfx = COLOR_PREFIX[color]
    this.animRight   = new Animator([`${pfx}_right_0`,   `${pfx}_right_1`,   `${pfx}_right_2`],   140)
    this.animUpRight = new Animator([`${pfx}_upright_0`, `${pfx}_upright_1`, `${pfx}_upright_2`], 140)
    this.animFall    = new Animator([`${pfx}_fall_0`,    `${pfx}_fall_1`,    `${pfx}_fall_2`,    `${pfx}_fall_3`], 110)
  }

  // ─── Factory ────────────────────────────────────────────────────────────────

  /** Spawn a duck from the bottom of the play area at a random x position. */
  static spawn(speedMultiplier = 1.0, color?: DuckColor, sheet: SpriteSheet | null = null): Duck {
    const x  = 30 + Math.random() * 196          // 30–226 NES px
    const y  = PLAY_BOTTOM - 4
    const vx = (50 + Math.random() * 40) * speedMultiplier * (Math.random() < 0.5 ? 1 : -1)
    const vy = -(55 + Math.random() * 35) * speedMultiplier
    const c  = color ?? (['black', 'red', 'blue'] as DuckColor[])[Math.floor(Math.random() * 3)]
    return new Duck(x, y, vx, vy, c, sheet)
  }

  // ─── Update ─────────────────────────────────────────────────────────────────

  update(dt: number): void {
    switch (this.state) {
      case 'flying':  this.updateFlying(dt);  break
      case 'shot':    this.updateShot(dt);    break
      case 'falling': this.updateFalling(dt); break
    }
  }

  private updateFlying(dt: number): void {
    const sec = dt / 1000
    this.aloftMs += dt

    // Move
    this.x += this.vx * sec
    this.y += this.vy * sec

    // Trigger escape once — fly straight up, no more bounces
    if (!this.escaping && this.aloftMs > ESCAPE_AFTER_MS) {
      this.escaping = true
      this.vy = -200
      this.vx = 0
    }

    if (this.escaping) {
      if (this.y < -20) this.state = 'escaped'
      this.animRight.update(dt)
      this.animUpRight.update(dt)
      return
    }

    // Bounce off left/right walls
    if (this.x < PLAY_LEFT + 8)  { this.x = PLAY_LEFT + 8;  this.vx =  Math.abs(this.vx) }
    if (this.x > PLAY_RIGHT - 8) { this.x = PLAY_RIGHT - 8; this.vx = -Math.abs(this.vx) }

    // Bounce off ceiling
    if (this.y < PLAY_TOP + 8) {
      this.y = PLAY_TOP + 8
      this.vy = Math.abs(this.vy)
    }

    // Soft floor — keep ducks above the bush strip while flying
    if (this.y > PLAY_FLOOR) {
      this.y = PLAY_FLOOR
      this.vy = -Math.abs(this.vy) * 0.8
    }

    // Keep both flight animators in sync so direction switches are smooth
    this.animRight.update(dt)
    this.animUpRight.update(dt)
  }

  private updateShot(dt: number): void {
    this.shotTimer -= dt
    this.flashOn = Math.floor(this.shotTimer / 80) % 2 === 0
    if (this.shotTimer <= 0) {
      this.state = 'falling'
      this.fallVy = 0
    }
  }

  private updateFalling(dt: number): void {
    const sec = dt / 1000
    this.fallVy += GRAVITY * sec
    this.y += this.fallVy * sec
    if (this.y >= PLAY_BOTTOM) this.y = PLAY_BOTTOM
    this.animFall.update(dt)
  }

  // ─── Hit detection ──────────────────────────────────────────────────────────

  /**
   * Attempt to shoot at NES-space point (px, py).
   * Returns true on hit (once; state changes to 'shot').
   */
  tryHit(px: number, py: number): boolean {
    if (this.state !== 'flying') return false
    const hit =
      px >= this.x - HIT_W && px <= this.x + HIT_W &&
      py >= this.y - HIT_H && py <= this.y + HIT_H
    if (hit) {
      this.state = 'shot'
      this.shotTimer = SHOT_FREEZE_MS
    }
    return hit
  }

  // ─── Draw ───────────────────────────────────────────────────────────────────

  /** Draw onto ctx, which should already be scaled to NES pixel space. */
  draw(ctx: CanvasRenderingContext2D): void {
    if (this.state === 'escaped') return
    if (this.state === 'shot' && !this.flashOn) return

    if (this.sheet?.isLoaded) {
      this.drawSprite(ctx)
    } else {
      this.drawFallback(ctx)
    }
  }

  // ─── Sprite drawing ─────────────────────────────────────────────────────────

  private drawSprite(ctx: CanvasRenderingContext2D): void {
    const prefix = COLOR_PREFIX[this.color]
    const flipX  = this.vx < 0

    let frameName: string
    if (this.state === 'falling') {
      frameName = this.animFall.frame
    } else if (this.state === 'shot') {
      frameName = `${prefix}_shot`
    } else {
      // Upright frame when moving significantly more upward than sideways
      const goingUp = this.vy < -Math.abs(this.vx) * 0.5
      frameName = (goingUp || this.escaping)
        ? this.animUpRight.frame
        : this.animRight.frame
    }

    const f = this.sheet!.getFrameRect(frameName)
    if (!f) return

    const dx = Math.round(this.x - f.w / 2)
    const dy = Math.round(this.y - f.h / 2)
    ctx.imageSmoothingEnabled = false
    this.sheet!.draw(ctx, frameName, dx, dy, 1, flipX)
  }

  // ─── Canvas fallback drawing ─────────────────────────────────────────────────

  private drawFallback(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.translate(this.x, this.y)

    if (this.vx < 0) ctx.scale(-1, 1)

    if (this.state === 'falling') {
      const angle = Math.min((this.fallVy / GRAVITY) * Math.PI * 0.6, Math.PI * 0.6)
      ctx.rotate(angle)
    }

    // Map frame name to wing index (0/1/2)
    const parts    = this.animRight.frame.split('_')
    const lastPart = parts[parts.length - 1] ?? '0'
    const frame    = this.state === 'flying' ? parseInt(lastPart) : 1

    this.drawDuckShape(ctx, frame, this.state !== 'flying')
    ctx.restore()
  }

  private drawDuckShape(ctx: CanvasRenderingContext2D, wingFrame: number, dead: boolean): void {
    const col = DUCK_COLORS[this.color]

    // ── Wing (drawn behind body) ──────────────────────────────────────────────
    ctx.fillStyle = col.wing
    switch (wingFrame) {
      case 0:  // up
        ctx.beginPath(); ctx.ellipse(0, -7, 7, 3, -0.4, 0, Math.PI * 2); ctx.fill()
        break
      case 1:  // level
        ctx.beginPath(); ctx.ellipse(-1, 0, 8, 3, 0, 0, Math.PI * 2); ctx.fill()
        break
      case 2:  // down
        ctx.beginPath(); ctx.ellipse(0, 7, 7, 3, 0.4, 0, Math.PI * 2); ctx.fill()
        break
    }

    // ── Tail ─────────────────────────────────────────────────────────────────
    ctx.fillStyle = col.body
    ctx.beginPath(); ctx.ellipse(-7, 1, 4, 3, 0.3, 0, Math.PI * 2); ctx.fill()

    // ── Body ─────────────────────────────────────────────────────────────────
    ctx.fillStyle = col.body
    ctx.beginPath(); ctx.ellipse(0, 1, 8, 5, 0, 0, Math.PI * 2); ctx.fill()

    // ── Head ─────────────────────────────────────────────────────────────────
    ctx.fillStyle = col.head
    ctx.beginPath(); ctx.arc(7, -3, 4, 0, Math.PI * 2); ctx.fill()

    // ── Bill ─────────────────────────────────────────────────────────────────
    ctx.fillStyle = '#e8a000'
    ctx.beginPath(); ctx.ellipse(11, -2, 3, 1.5, -0.2, 0, Math.PI * 2); ctx.fill()

    // ── Eye ──────────────────────────────────────────────────────────────────
    ctx.fillStyle = dead ? '#ff2020' : '#ffffff'
    ctx.beginPath(); ctx.arc(8.5, -4, 1.5, 0, Math.PI * 2); ctx.fill()
    if (!dead) {
      ctx.fillStyle = '#000000'
      ctx.beginPath(); ctx.arc(9, -4, 0.8, 0, Math.PI * 2); ctx.fill()
    }
  }
}

// ─── Colour palette (canvas fallback) ─────────────────────────────────────────

const DUCK_COLORS: Record<DuckColor, { body: string; head: string; wing: string }> = {
  black: { body: '#2c2c2c', head: '#141414', wing: '#444444' },
  red:   { body: '#8c2000', head: '#601000', wing: '#b03000' },
  blue:  { body: '#0050b8', head: '#003888', wing: '#0068d0' },
}
