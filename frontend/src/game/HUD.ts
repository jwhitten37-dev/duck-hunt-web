/**
 * HUD — renders the bottom information panel in NES Duck Hunt style.
 *
 * Panel occupies NES rows 192–239 (the black bar drawn by Scene).
 * All drawing is done in canvas-pixel space (NES coords × scale).
 *
 * Layout
 * ──────
 *  Row 1  (NES y 195):  "1P"   label  |  "HI-SCORE" label  |  "RND" label
 *  Row 2  (NES y 204):  score value   |  hi-score value     |  round value
 *  Row 3  (NES y 217):  duck-hit tracker (one icon per duck this round)
 *  Row 4  (NES y 229):  bullet indicators (one per available shot)
 */

export interface HUDData {
  score:         number
  hiScore:       number
  round:         number
  shotsLeft:     number
  maxShots:      number
  ducksHit:      number   // ducks shot this round so far
  ducksEscaped:  number   // ducks that got away this round
  ducksPerRound: number
  lives:         number
  maxLives:      number
}

export class HUD {
  constructor(private readonly scale: number) {}

  draw(ctx: CanvasRenderingContext2D, data: HUDData): void {
    const s   = this.scale
    const top = 192 * s   // top of the HUD panel in canvas pixels

    ctx.save()
    ctx.imageSmoothingEnabled = false

    const labelFont = `${6 * s}px "Press Start 2P", monospace`
    const valueFont = `${8 * s}px "Press Start 2P", monospace`
    ctx.textBaseline = 'top'

    // ── Row 1: labels ────────────────────────────────────────────────────────
    ctx.font = labelFont

    ctx.textAlign = 'left'
    ctx.fillStyle = '#ff3030'
    ctx.fillText('1P', 6 * s, top + 3 * s)

    ctx.textAlign = 'center'
    ctx.fillStyle = '#ff3030'
    ctx.fillText('HI-SCORE', 128 * s, top + 3 * s)

    ctx.textAlign = 'right'
    ctx.fillStyle = '#ff3030'
    ctx.fillText('RND', 252 * s, top + 3 * s)

    // ── Row 2: values ────────────────────────────────────────────────────────
    ctx.font = valueFont
    ctx.fillStyle = '#ffffff'

    ctx.textAlign = 'left'
    ctx.fillText(String(data.score).padStart(6, '0'), 6 * s, top + 13 * s)

    ctx.textAlign = 'center'
    ctx.fillText(String(data.hiScore).padStart(6, '0'), 128 * s, top + 13 * s)

    ctx.textAlign = 'right'
    ctx.fillText(String(data.round).padStart(2, '0'), 252 * s, top + 13 * s)

    // ── Row 3: duck-hit tracker ───────────────────────────────────────────────
    this.drawDuckTracker(ctx, data, top + 25 * s)

    // ── Row 4: lives (left) and bullet indicators (right) ────────────────────
    this.drawLives(ctx, data.lives, data.maxLives, top + 35 * s)
    this.drawBullets(ctx, data.shotsLeft, data.maxShots, top + 35 * s)

    ctx.restore()
  }

  // ─── Duck tracker ──────────────────────────────────────────────────────────

  private drawDuckTracker(
    ctx: CanvasRenderingContext2D,
    data: HUDData,
    y: number,
  ): void {
    const s       = this.scale
    const iconW   = 12 * s
    const iconH   = 10 * s
    const gap     =  4 * s
    const total   = data.ducksPerRound
    const totalW  = total * iconW + (total - 1) * gap
    let   x       = (256 * s - totalW) / 2

    for (let i = 0; i < total; i++) {
      const hit     = i < data.ducksHit
      const escaped = !hit && i < data.ducksHit + data.ducksEscaped
      this.drawDuckIcon(ctx, x, y, iconW, iconH, hit, escaped)
      x += iconW + gap
    }
  }

  /** Small duck silhouette: white = hit, red = escaped, dark grey = pending. */
  private drawDuckIcon(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    w: number, h: number,
    hit: boolean, escaped: boolean,
  ): void {
    const bodyColor = hit ? '#ffffff' : escaped ? '#ff4040' : '#505050'
    const billColor = hit ? '#ffcc00' : escaped ? '#cc2020' : '#383838'

    // Body
    ctx.fillStyle = bodyColor
    ctx.beginPath()
    ctx.ellipse(x + w * 0.42, y + h * 0.65, w * 0.38, h * 0.30, 0, 0, Math.PI * 2)
    ctx.fill()

    // Wing
    ctx.beginPath()
    ctx.ellipse(x + w * 0.30, y + h * 0.55, w * 0.26, h * 0.16, -0.3, 0, Math.PI * 2)
    ctx.fill()

    // Head
    ctx.beginPath()
    ctx.arc(x + w * 0.72, y + h * 0.30, w * 0.22, 0, Math.PI * 2)
    ctx.fill()

    // Bill
    ctx.fillStyle = billColor
    ctx.beginPath()
    ctx.ellipse(x + w * 0.93, y + h * 0.33, w * 0.12, h * 0.09, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // ─── Bullet indicators ────────────────────────────────────────────────────

  private drawBullets(
    ctx: CanvasRenderingContext2D,
    shotsLeft: number,
    maxShots: number,
    y: number,
  ): void {
    const s      = this.scale
    const bW     = 4 * s
    const bH     = 8 * s
    const gap    = 3 * s
    const totalW = maxShots * bW + (maxShots - 1) * gap
    let   x      = (256 * s - totalW) / 2

    for (let i = 0; i < maxShots; i++) {
      const active = i < shotsLeft
      // Casing
      ctx.fillStyle = active ? '#c8a000' : '#303030'
      ctx.beginPath()
      ctx.roundRect(x, y + bH * 0.25, bW, bH * 0.75, bW * 0.25)
      ctx.fill()
      // Tip
      ctx.fillStyle = active ? '#ffdd40' : '#404040'
      ctx.beginPath()
      ctx.ellipse(x + bW / 2, y + bH * 0.25, bW / 2, bH * 0.28, 0, 0, Math.PI * 2)
      ctx.fill()
      x += bW + gap
    }
  }

  // ─── Lives indicators ─────────────────────────────────────────────────────

  private drawLives(
    ctx: CanvasRenderingContext2D,
    lives: number,
    maxLives: number,
    y: number,
  ): void {
    const s   = this.scale
    const px  = s            // one NES pixel in canvas pixels
    const gap = 3 * s        // gap between hearts
    let   x   = 6 * s        // left-aligned in HUD panel

    for (let i = 0; i < maxLives; i++) {
      ctx.fillStyle = i < lives ? '#ff2828' : '#401818'
      this.drawPixelHeart(ctx, x, y, px)
      x += 5 * px + gap      // heart is 5 px wide
    }
  }

  /**
   * Draw a 5×5 pixel-art heart.
   * @param x   Left edge in canvas pixels
   * @param y   Top edge in canvas pixels
   * @param px  One NES pixel expressed in canvas pixels (= scale)
   */
  private drawPixelHeart(
    ctx: CanvasRenderingContext2D,
    x: number, y: number, px: number,
  ): void {
    // 5×5 bitmap: row-major, 1 = filled
    const map = [
      [0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 1, 0, 0],
    ]
    for (let r = 0; r < map.length; r++) {
      for (let c = 0; c < map[r].length; c++) {
        if (map[r][c]) ctx.fillRect(x + c * px, y + r * px, px, px)
      }
    }
  }
}
