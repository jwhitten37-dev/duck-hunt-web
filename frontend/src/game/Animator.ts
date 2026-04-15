/**
 * Animator — cycles through a named sequence of sprite frames at a fixed rate.
 *
 * Usage:
 *   const anim = new Animator(['duck_fly_0','duck_fly_1','duck_fly_2'], 120)
 *   // in update loop:
 *   anim.update(dt)
 *   // in render loop:
 *   sheet.draw(ctx, anim.frame, x, y, scale)
 */
export class Animator {
  private readonly frameNames: readonly string[]
  private readonly frameDurationMs: number
  private elapsed = 0
  private index = 0
  private _playing = true
  private _done = false   // true once a non-looping animation reaches the end

  /**
   * @param frameNames       Ordered list of frame keys (must match SpriteSheet FrameMap)
   * @param frameDurationMs  How long each frame is shown in milliseconds
   * @param loop             Whether to restart after the last frame (default true)
   */
  constructor(
    frameNames: string[],
    frameDurationMs: number,
    private readonly loop = true,
  ) {
    if (frameNames.length === 0) throw new Error('Animator: frameNames must not be empty')
    this.frameNames = frameNames
    this.frameDurationMs = frameDurationMs
  }

  /** The frame name to draw this tick. */
  get frame(): string { return this.frameNames[this.index] }

  /** True once a non-looping animation has finished its last frame. */
  get done(): boolean { return this._done }

  get playing(): boolean { return this._playing }

  /** Advance the animation by dt milliseconds. */
  update(dt: number): void {
    if (!this._playing || this._done) return

    this.elapsed += dt
    while (this.elapsed >= this.frameDurationMs) {
      this.elapsed -= this.frameDurationMs
      this.index++
      if (this.index >= this.frameNames.length) {
        if (this.loop) {
          this.index = 0
        } else {
          this.index = this.frameNames.length - 1
          this._done = true
          this._playing = false
          return
        }
      }
    }
  }

  reset(): void {
    this.elapsed = 0
    this.index = 0
    this._playing = true
    this._done = false
  }

  pause(): void  { this._playing = false }
  resume(): void { this._playing = true  }

  /** Jump to a specific frame index immediately. */
  seek(index: number): void {
    this.index = Math.max(0, Math.min(index, this.frameNames.length - 1))
    this.elapsed = 0
  }
}
