/**
 * ScorePopup — floating "+N" score labels that rise from a duck's landing spot.
 *
 * Lifetime: POPUP_MS milliseconds.
 * Motion: floats upward (FLOAT_PX NES pixels total) while fading out.
 *
 * Usage (in Game.ts):
 *   this.popups.add(duck.x, duck.y, points)   // when duck.landed
 *   // each frame:
 *   this.popups.update(dt)
 *   this.popups.draw(ctx, scale)              // ctx NOT pre-scaled
 */

const POPUP_MS = 1100    // how long the popup lives
const FLOAT_PX = 28      // total NES pixels it rises over its lifetime

interface Popup {
  x:     number   // NES px (center)
  y:     number   // NES px (starting position)
  value: number
  timer: number   // ms remaining
}

export class ScorePopup {
  private readonly pool: Popup[] = []

  /** Spawn a new popup at NES-space position (x, y). */
  add(x: number, y: number, value: number): void {
    this.pool.push({ x, y: y - 10, value, timer: POPUP_MS })
  }

  update(dt: number): void {
    for (const p of this.pool) p.timer -= dt
    // remove expired
    for (let i = this.pool.length - 1; i >= 0; i--) {
      if (this.pool[i].timer <= 0) this.pool.splice(i, 1)
    }
  }

  /** Draw all active popups. ctx should NOT be pre-scaled. */
  draw(ctx: CanvasRenderingContext2D, scale: number): void {
    if (this.pool.length === 0) return

    const s = scale
    ctx.save()
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.font         = `${7 * s}px "Press Start 2P", monospace`

    for (const p of this.pool) {
      const t       = p.timer / POPUP_MS           // 1 → 0 over lifetime
      const alpha   = Math.min(1, t * 2.5)         // quick fade-in, slow fade-out
      const yShift  = (1 - t) * FLOAT_PX * s       // rises upward (canvas px)

      ctx.globalAlpha = alpha

      // Drop shadow
      ctx.fillStyle = '#000000'
      ctx.fillText(`+${p.value}`, p.x * s + s, p.y * s - yShift + s)

      // Main text — gold colour
      ctx.fillStyle = '#ffdd00'
      ctx.fillText(`+${p.value}`, p.x * s, p.y * s - yShift)
    }

    ctx.globalAlpha = 1
    ctx.restore()
  }
}
