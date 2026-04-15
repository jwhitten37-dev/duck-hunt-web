/**
 * SpriteSheet — loads a PNG sprite atlas and draws named frames to a canvas.
 *
 * Usage:
 *   const sheet = new SpriteSheet('/assets/sprites/atlas.png', {
 *     duck_fly_0: { x: 0,  y: 0, w: 16, h: 16 },
 *     duck_fly_1: { x: 16, y: 0, w: 16, h: 16 },
 *   })
 *   await sheet.load()
 *   sheet.draw(ctx, 'duck_fly_0', 100, 80, 3)   // draw at (100,80), scale=3
 */

export interface FrameRect {
  x: number
  y: number
  w: number
  h: number
}

export type FrameMap = Record<string, FrameRect>

export class SpriteSheet {
  private readonly image: HTMLImageElement
  private readonly frames: FrameMap
  private _loaded = false

  constructor(src: string, frames: FrameMap) {
    this.frames = frames
    this.image = new Image()
    this.image.src = src
  }

  /** Resolves when the image has finished loading. */
  load(): Promise<void> {
    if (this._loaded) return Promise.resolve()

    // Handle the case where the browser already completed loading before we
    // had a chance to attach handlers (e.g. a cached resource).
    if (this.image.complete) {
      if (this.image.naturalWidth > 0) {
        this._loaded = true
        return Promise.resolve()
      }
      return Promise.reject(new Error(`Failed to load sprite sheet: ${this.image.src}`))
    }

    return new Promise((resolve, reject) => {
      this.image.onload  = () => { this._loaded = true; resolve() }
      this.image.onerror = () => reject(new Error(`Failed to load sprite sheet: ${this.image.src}`))
    })
  }

  get isLoaded(): boolean { return this._loaded }

  /**
   * Draw a single named frame.
   * @param ctx    Target 2D context (imageSmoothingEnabled should be false for pixel art)
   * @param name   Frame key from the FrameMap passed to the constructor
   * @param dx     Destination X in canvas pixels
   * @param dy     Destination Y in canvas pixels
   * @param scale  Integer scale multiplier (default 1 — draw at source size)
   * @param flipX  Mirror the frame horizontally (useful for duck direction)
   */
  draw(
    ctx: CanvasRenderingContext2D,
    name: string,
    dx: number,
    dy: number,
    scale = 1,
    flipX = false,
  ): void {
    if (!this._loaded) return
    const f = this.frames[name]
    if (!f) { console.warn(`SpriteSheet: unknown frame "${name}"`) ; return }

    if (flipX) {
      ctx.save()
      ctx.translate(dx + f.w * scale, dy)
      ctx.scale(-1, 1)
      ctx.drawImage(this.image, f.x, f.y, f.w, f.h, 0, 0, f.w * scale, f.h * scale)
      ctx.restore()
    } else {
      ctx.drawImage(this.image, f.x, f.y, f.w, f.h, dx, dy, f.w * scale, f.h * scale)
    }
  }

  /** Return the FrameRect for a named frame, or null if it doesn't exist. */
  getFrameRect(name: string): FrameRect | null {
    return this.frames[name] ?? null
  }

  /** Convenience: draw a frame centred on (cx, cy). */
  drawCentered(
    ctx: CanvasRenderingContext2D,
    name: string,
    cx: number,
    cy: number,
    scale = 1,
    flipX = false,
  ): void {
    const f = this.frames[name]
    if (!f) return
    this.draw(ctx, name, cx - (f.w * scale) / 2, cy - (f.h * scale) / 2, scale, flipX)
  }

  /** Create a SpriteSheet backed by a programmatically-drawn offscreen canvas.
   *  Useful for placeholder graphics before real art exists. */
  static fromCanvas(canvas: HTMLCanvasElement, frames: FrameMap): SpriteSheet {
    const sheet = new SpriteSheet(canvas.toDataURL(), frames)
    sheet._loaded = true
    // Swap the internal image source to the canvas element directly
    ;(sheet as unknown as { image: CanvasImageSource }).image = canvas
    return sheet
  }
}
