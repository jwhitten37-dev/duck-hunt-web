/**
 * TitleScreen — animated title card rendered over the scene background.
 *
 * Game.ts draws scene.draw() first, then calls titleScreen.draw() on top.
 *
 * Animations:
 *   • "CLICK TO START" blinks every 520 ms
 *   • A duck silhouette flies left across the sky, looping endlessly
 */
import { SpriteSheet } from './SpriteSheet'

// Duck sprite frame names for the flying title duck (right-facing, flipped for leftward flight)
const TITLE_DUCK_FRAMES = ['d1_right_0', 'd1_right_1', 'd1_right_2'] as const

export class TitleScreen {
  private readonly sheet: SpriteSheet | null

  // Blinking prompt
  private blinkTimer = 0
  private blinkOn    = true

  // Title duck
  private duckX     = 270     // NES px, starts off right edge
  private duckY     = 68
  private wingFrame = 0
  private wingTimer = 0

  constructor(sheet: SpriteSheet | null = null) {
    this.sheet = sheet
  }

  update(dt: number): void {
    // Blink toggle
    this.blinkTimer += dt
    if (this.blinkTimer >= 520) {
      this.blinkTimer = 0
      this.blinkOn = !this.blinkOn
    }

    // Fly duck right → left
    this.duckX -= dt * 0.038
    if (this.duckX < -32) {
      this.duckX = 272
      this.duckY = 38 + Math.random() * 85
    }

    // Wing flap
    this.wingTimer += dt
    if (this.wingTimer >= 145) {
      this.wingTimer = 0
      this.wingFrame = (this.wingFrame + 1) % 3
    }
  }

  /** Draw title overlay. ctx should NOT be pre-scaled — this works in canvas pixels. */
  draw(ctx: CanvasRenderingContext2D, scale: number, hiScore: number): void {
    const s = scale

    // Semi-transparent sky overlay — improves text legibility without hiding the scene
    ctx.fillStyle = 'rgba(0, 0, 28, 0.38)'
    ctx.fillRect(0, 0, 256 * s, 192 * s)

    // Flying duck
    this.drawTitleDuck(ctx, this.duckX * s, this.duckY * s, s)

    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'

    // ── Title ─────────────────────────────────────────────────────────────────
    ctx.font      = `${12 * s}px "Press Start 2P", monospace`
    ctx.fillStyle = '#000060'
    ctx.fillText('DUCK HUNT', 128 * s + s, 72 * s + s)
    ctx.fillStyle = '#ffffff'
    ctx.fillText('DUCK HUNT', 128 * s, 72 * s)

    // ── Subtitle ──────────────────────────────────────────────────────────────
    ctx.font      = `${6 * s}px "Press Start 2P", monospace`
    ctx.fillStyle = '#ffdd00'
    ctx.fillText('NES  RECREATION', 128 * s, 94 * s)

    // ── Hi-score ──────────────────────────────────────────────────────────────
    ctx.fillStyle = '#aaaaaa'
    ctx.fillText(`HI  ${String(hiScore).padStart(6, '0')}`, 128 * s, 114 * s)

    // ── Blinking prompt ───────────────────────────────────────────────────────
    if (this.blinkOn) {
      ctx.font      = `${7 * s}px "Press Start 2P", monospace`
      ctx.fillStyle = '#ffffff'
      ctx.fillText('CLICK TO START', 128 * s, 148 * s)
    }

    // ── Controls hint ─────────────────────────────────────────────────────────
    ctx.font      = `${5 * s}px "Press Start 2P", monospace`
    ctx.fillStyle = '#707070'
    ctx.fillText('M  =  MUTE', 128 * s, 174 * s)
  }

  // ─── Title duck ─────────────────────────────────────────────────────────────

  private drawTitleDuck(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number): void {
    if (this.sheet?.isLoaded) {
      const frameName = TITLE_DUCK_FRAMES[this.wingFrame]
      const f = this.sheet.getFrameRect(frameName)
      if (f) {
        ctx.imageSmoothingEnabled = false
        // Duck flies left — flip horizontally. cx/cy are canvas pixels, so use scale=s.
        const dx = Math.round(cx - (f.w * s) / 2)
        const dy = Math.round(cy - (f.h * s) / 2)
        this.sheet.draw(ctx, frameName, dx, dy, s, true)
        return
      }
    }

    // Canvas fallback — dark silhouette
    const wf = this.wingFrame
    ctx.fillStyle = '#101828'

    if (wf === 0) {
      ctx.beginPath(); ctx.ellipse(cx + s, cy - 7 * s, 8 * s, 3 * s, -0.4, 0, Math.PI * 2); ctx.fill()
    } else if (wf === 1) {
      ctx.beginPath(); ctx.ellipse(cx, cy, 9 * s, 3 * s, 0, 0, Math.PI * 2); ctx.fill()
    } else {
      ctx.beginPath(); ctx.ellipse(cx + s, cy + 7 * s, 8 * s, 3 * s, 0.4, 0, Math.PI * 2); ctx.fill()
    }

    ctx.beginPath(); ctx.ellipse(cx, cy, 9 * s, 5 * s, 0, 0, Math.PI * 2); ctx.fill()
    ctx.beginPath(); ctx.arc(cx - 8 * s, cy - 3 * s, 4.5 * s, 0, Math.PI * 2); ctx.fill()

    ctx.fillStyle = '#b87800'
    ctx.beginPath(); ctx.ellipse(cx - 12 * s, cy - 2 * s, 3 * s, 1.5 * s, 0.2, 0, Math.PI * 2); ctx.fill()
  }
}
