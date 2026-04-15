/**
 * InputManager — translates raw browser mouse events into NES-coordinate
 * positions and fires shot callbacks.
 *
 * The canvas may be CSS-scaled differently from its backing pixel size, so
 * we compute: clientXY → CSS rect offset → canvas pixel → NES pixel.
 */
export class InputManager {
  private _x = 0
  private _y = 0
  private readonly shotListeners: Array<(x: number, y: number) => void> = []

  constructor(canvas: HTMLCanvasElement, private readonly scale: number) {
    canvas.addEventListener('mousemove', (e) => {
      const [nx, ny] = this.toNES(canvas, e.clientX, e.clientY)
      this._x = nx
      this._y = ny
    })

    canvas.addEventListener('click', (e) => {
      const [nx, ny] = this.toNES(canvas, e.clientX, e.clientY)
      for (const fn of this.shotListeners) fn(nx, ny)
    })

    // Prevent context menu so right-click doesn't interrupt play
    canvas.addEventListener('contextmenu', (e) => e.preventDefault())
  }

  /** Current mouse position in NES pixel space. */
  get x(): number { return this._x }
  get y(): number { return this._y }

  /**
   * Register a callback that fires whenever the player clicks.
   * Receives (x, y) in NES pixel coordinates.
   */
  onShot(fn: (x: number, y: number) => void): void {
    this.shotListeners.push(fn)
  }

  // ─── Private ──────────────────────────────────────────────────────────────

  private toNES(canvas: HTMLCanvasElement, clientX: number, clientY: number): [number, number] {
    const rect = canvas.getBoundingClientRect()
    // clientXY → canvas pixel space (handles CSS scaling)
    const cx = (clientX - rect.left) * (canvas.width  / rect.width)
    const cy = (clientY - rect.top)  * (canvas.height / rect.height)
    // canvas pixels → NES pixels
    return [cx / this.scale, cy / this.scale]
  }
}
