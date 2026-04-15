/**
 * Scene — draws the static Duck Hunt background in NES-accurate pixel art
 * using canvas 2D primitives.
 *
 * All coordinates are in NES pixels (256×240). The caller passes a scale
 * factor (default 3) so everything is rendered at the correct canvas size.
 *
 * Layers (back to front):
 *   1. Sky
 *   2. Distant tree line
 *   3. Foreground tree clusters
 *   4. Bush / shrub strip
 *   5. Grass + ground
 *   6. Bottom HUD panel (black bar — populated by HUD class in a later phase)
 *
 * NES colour palette references used:
 *   Sky blue       #5c94fc
 *   Tree dark      #006800
 *   Tree mid       #3c8c00
 *   Tree highlight #74c400
 *   Bush dark      #004400
 *   Ground light   #74b353
 *   Ground mid     #4c9c00
 *   Ground dark    #2c6000
 */

import { SpriteSheet } from './SpriteSheet'

export class Scene {
  // Boundaries in NES pixel space
  static readonly PLAY_BOTTOM = 192   // last row of the playfield
  static readonly HUD_TOP     = 192   // first row of the bottom HUD panel
  static readonly NES_W       = 256
  static readonly NES_H       = 240

  // NES y at which the bush strip begins — used to split the background sprite
  private static readonly BUSH_Y = 176

  private scale: number
  private sheet: SpriteSheet | null

  constructor(scale = 3, sheet: SpriteSheet | null = null) {
    this.scale = scale
    this.sheet = sheet
  }

  /**
   * Draw sky + trees only — call this BEFORE drawing duck sprites so that
   * ducks appear in front of trees but behind the bush/ground foreground.
   */
  drawBackground(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.scale(this.scale, this.scale)
    ctx.imageSmoothingEnabled = false
    if (this.sheet?.isLoaded) {
      // Sprite bg_top covers NES y 0–175 (sky + trees)
      this.sheet.draw(ctx, 'bg_top', 0, 0, 1)
    } else {
      this.drawSky(ctx)
      this.drawDistantTrees(ctx)
      this.drawForegroundTrees(ctx)
    }
    ctx.restore()
  }

  /**
   * Draw bushes, ground, and HUD panel — call this AFTER drawing duck sprites
   * so the foreground vegetation renders on top of (in front of) the ducks.
   */
  drawForeground(ctx: CanvasRenderingContext2D): void {
    ctx.save()
    ctx.scale(this.scale, this.scale)
    ctx.imageSmoothingEnabled = false
    if (this.sheet?.isLoaded) {
      // Sprite bg_bottom covers NES y 176–239 (bushes + ground + HUD area)
      this.sheet.draw(ctx, 'bg_bottom', 0, Scene.BUSH_Y, 1)
    } else {
      this.drawBushStrip(ctx)
      this.drawGround(ctx)
    }
    // Always draw the HUD panel — the HUD class writes on top of it
    this.drawHudPanel(ctx)
    ctx.restore()
  }

  /** Convenience: draw all layers at once (background + foreground). */
  draw(ctx: CanvasRenderingContext2D): void {
    this.drawBackground(ctx)
    this.drawForeground(ctx)
  }

  // ─── Layers ───────────────────────────────────────────────────────────────

  private drawSky(ctx: CanvasRenderingContext2D): void {
    ctx.fillStyle = '#5c94fc'
    ctx.fillRect(0, 0, 256, Scene.PLAY_BOTTOM)
  }

  private drawDistantTrees(ctx: CanvasRenderingContext2D): void {
    // Small, dark silhouette trees at the horizon (~y 140)
    const trees: Array<[number, number, number]> = [
      // [centerX, baseY, radius]
      [  8, 155, 8], [ 20, 152, 9], [ 36, 157, 7], [ 50, 150, 11],
      [ 68, 156, 8], [ 84, 150, 10],[ 98, 154, 7], [114, 152, 9],
      [130, 156, 8], [145, 150, 10],[160, 154, 7], [174, 152, 9],
      [188, 157, 8], [202, 150, 10],[216, 155, 7], [228, 152, 9],
      [244, 157, 8],
    ]
    for (const [cx, by, r] of trees) {
      this.drawTreeBlob(ctx, cx, by, r, '#006800', '#004800')
    }
  }

  private drawForegroundTrees(ctx: CanvasRenderingContext2D): void {
    // Larger, brighter tree clusters in the mid-ground (~y 150-175)
    const clusters: Array<[number, number, number]> = [
      [  0, 172, 18], [ 22, 168, 16], [ 42, 174, 14],
      [ 82, 170, 17], [100, 165, 20], [118, 172, 15],
      [158, 170, 18], [176, 165, 16], [196, 172, 14],
      [230, 168, 17], [248, 174, 16], [256, 172, 15],
    ]
    for (const [cx, by, r] of clusters) {
      this.drawTreeBlob(ctx, cx, by, r, '#3c8c00', '#006800')
    }
  }

  /**
   * Draw a single tree blob: a cluster of three overlapping circles
   * that produces the rounded Duck Hunt tree silhouette.
   */
  private drawTreeBlob(
    ctx: CanvasRenderingContext2D,
    cx: number,
    baseY: number,
    r: number,
    fill: string,
    shadow: string,
  ): void {
    // Shadow/depth pass (slightly offset)
    ctx.fillStyle = shadow
    this.circle(ctx, cx - 1, baseY - r + 2, r)
    this.circle(ctx, cx + Math.floor(r * 0.6), baseY - Math.floor(r * 0.5) + 2, Math.floor(r * 0.75))
    this.circle(ctx, cx - Math.floor(r * 0.5), baseY - Math.floor(r * 0.4) + 2, Math.floor(r * 0.7))

    // Main colour pass
    ctx.fillStyle = fill
    this.circle(ctx, cx,     baseY - r,                                r)
    this.circle(ctx, cx + Math.floor(r * 0.6), baseY - Math.floor(r * 0.5), Math.floor(r * 0.75))
    this.circle(ctx, cx - Math.floor(r * 0.5), baseY - Math.floor(r * 0.4), Math.floor(r * 0.7))

    // Trunk
    ctx.fillStyle = '#4c3000'
    const tw = Math.max(2, Math.floor(r / 4))
    ctx.fillRect(cx - Math.floor(tw / 2), baseY, tw, Math.floor(r / 3))
  }

  private drawBushStrip(ctx: CanvasRenderingContext2D): void {
    // Base fill for the bush strip
    ctx.fillStyle = '#006800'
    ctx.fillRect(0, 176, 256, 16)

    // Row of rounded bush bumps along the top edge
    const bushes: Array<[number, number, number]> = [
      [ 0, 178, 10], [14, 176, 12], [28, 179, 9],  [42, 177, 11],
      [56, 178, 10], [70, 176, 12], [84, 179, 9],  [98, 177, 11],
      [112,178, 10], [126,176, 12], [140,179, 9],  [154,177, 11],
      [168,178, 10], [182,176, 12], [196,179, 9],  [210,177, 11],
      [224,178, 10], [238,176, 12], [252,179, 9],
    ]
    for (const [cx, cy, r] of bushes) {
      ctx.fillStyle = '#004400'
      this.circle(ctx, cx + 1, cy + 1, r)     // shadow
      ctx.fillStyle = '#3c8c00'
      this.circle(ctx, cx, cy, r)              // highlight
      ctx.fillStyle = '#006800'
      this.circle(ctx, cx, cy + Math.floor(r * 0.4), r)  // body
    }
  }

  private drawGround(ctx: CanvasRenderingContext2D): void {
    // Dark shadow strip at the very top of the ground band
    ctx.fillStyle = '#2c6000'
    ctx.fillRect(0, 183, 256, 3)

    // Main grass
    ctx.fillStyle = '#74b353'
    ctx.fillRect(0, 186, 256, 6)

    // Slightly darker fill below
    ctx.fillStyle = '#4c9c00'
    ctx.fillRect(0, 186, 256, 6)

    ctx.fillStyle = '#74b353'
    ctx.fillRect(0, 188, 256, 4)
  }

  private drawHudPanel(ctx: CanvasRenderingContext2D): void {
    // Black background for the bottom HUD — content added by HUD class later
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, Scene.HUD_TOP, 256, Scene.NES_H - Scene.HUD_TOP)
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Fill a circle at (cx, cy) with the current fillStyle. */
  private circle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }
}
