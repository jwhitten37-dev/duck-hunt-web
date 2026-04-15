/**
 * LeaderboardScreen — arcade-style top-10 high score display.
 *
 * The newly submitted entry (if any) flashes to draw attention.
 * After AUTO_DISMISS_MS the screen auto-dismisses; clicking also works.
 */

export interface BoardEntry {
  name:  string;
  score: number;
}

const AUTO_DISMISS_MS = 14000;
const BLINK_MS = 550;

export class LeaderboardScreen {
  private entries: BoardEntry[] = [];
  private newName: string | null = null;
  private newScore: number | null = null;
  private blinkOn: boolean = true;
  private blinkTimer: number = 0;
  private dismissTimer: number = AUTO_DISMISS_MS;

  setEntries(entries: BoardEntry[]): void {
    this.entries = entries;
  }

  setNewEntry(name: string, score: number): void {
    this.newName = name;
    this.newScore = score;
  }

  clearNewEntry(): void {
    this.newName = null;
    this.newScore = null;
  }

  reset(): void {
    this.blinkOn = true;
    this.blinkTimer = 0;
    this.dismissTimer = AUTO_DISMISS_MS;
  }

  get isDismissed(): boolean {
    return this.dismissTimer <= 0;
  }

  dismiss(): void {
    this.dismissTimer = 0;
  }

  update(dt: number): void {
    this.blinkTimer += dt;
    if (this.blinkTimer >= BLINK_MS) {
      this.blinkTimer -= BLINK_MS;
      this.blinkOn = !this.blinkOn;
    }

    this.dismissTimer = Math.max(0, this.dismissTimer - dt);
  }

  draw(ctx: CanvasRenderingContext2D, scale: number): void {
    const S = scale;
    const W = 256 * S;
    const H = 240 * S;

    // Background — noticeably different from the pure-black page surround
    ctx.fillStyle = '#152815';
    ctx.fillRect(0, 0, W, H);

    // Subtle inner vignette — slightly darker toward edges
    const grad = ctx.createRadialGradient(W / 2, H / 2, H * 0.15, W / 2, H / 2, H * 0.75);
    grad.addColorStop(0, 'rgba(255,255,255,0.04)');
    grad.addColorStop(1, 'rgba(0,0,0,0.30)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Scanline overlay
    ctx.fillStyle = 'rgba(0,0,0,0.14)';
    for (let y = 0; y < 240; y += 4) {
      ctx.fillRect(0, y * S, W, 1 * S);
    }

    // Outer border — bright green so it's clearly a panel
    ctx.strokeStyle = '#33aa33';
    ctx.lineWidth = 2 * S;
    ctx.strokeRect(4 * S, 4 * S, (256 - 8) * S, (240 - 8) * S);

    // Inner border — dimmer accent
    ctx.strokeStyle = '#226622';
    ctx.lineWidth = S;
    ctx.strokeRect(7 * S, 7 * S, (256 - 14) * S, (240 - 14) * S);

    // "HIGH SCORES" title
    ctx.font = `${10 * S}px "Press Start 2P"`;
    ctx.textAlign = 'center';
    // Shadow
    ctx.fillStyle = '#334400';
    ctx.fillText('HIGH SCORES', W / 2 + 1 * S, 20 * S + 1 * S);
    // Title
    ctx.fillStyle = '#ffcc00';
    ctx.fillText('HIGH SCORES', W / 2, 20 * S);

    // Title underline
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(14 * S, 30 * S, (242 - 14) * S, 1 * S);

    // Rank colors
    const rankColors = ['#ffcc00', '#c8c8c8', '#cd8540'];

    // Entry rows
    const rowHeight = 14;
    const startY = 38;
    let newEntryFlashed = false;

    for (let i = 0; i < 10; i++) {
      const entry = this.entries[i] ?? null;
      const rowY = (startY + i * rowHeight) * S;

      let isNew = false;
      if (!newEntryFlashed && entry !== null && this.newName !== null && this.newScore !== null) {
        if (entry.name === this.newName && entry.score === this.newScore) {
          isNew = true;
          newEntryFlashed = true;
        }
      }

      // Highlight background for new entry — brighter on blink-on, dimmer on blink-off
      if (isNew) {
        ctx.fillStyle = this.blinkOn ? 'rgba(0,120,60,0.55)' : 'rgba(0,60,30,0.3)';
        ctx.fillRect(0, rowY - 6 * S, W, 13 * S);
      }

      const rankColor = i < 3 ? rankColors[i] : '#44bb44';

      ctx.font = `${6 * S}px "Press Start 2P"`;

      if (entry !== null) {
        // Rank number (right-aligned at x=30*S)
        ctx.textAlign = 'right';
        ctx.fillStyle = rankColor;
        ctx.fillText(`${i + 1}.`, 30 * S, rowY);

        // Name (left-aligned at x=36*S)
        ctx.textAlign = 'left';
        ctx.fillStyle = isNew ? (this.blinkOn ? '#00ffcc' : '#44cc99') : '#77cc77';
        ctx.fillText(entry.name, 36 * S, rowY);

        // Score (right-aligned at x=(256-14)*S)
        ctx.textAlign = 'right';
        ctx.fillStyle = isNew ? (this.blinkOn ? '#ffffff' : '#ccddcc') : '#aaddaa';
        ctx.fillText(String(entry.score).padStart(6, '0'), (256 - 14) * S, rowY);
      } else {
        // Empty slot
        const emptyColor = '#1c3a1c';

        // Rank (right-aligned at x=30*S)
        ctx.textAlign = 'right';
        ctx.fillStyle = emptyColor;
        ctx.fillText(`${i + 1}.`, 30 * S, rowY);

        // "---" (left-aligned at x=36*S)
        ctx.textAlign = 'left';
        ctx.fillStyle = emptyColor;
        ctx.fillText('---', 36 * S, rowY);

        // "------" (right-aligned at x=(256-14)*S)
        ctx.textAlign = 'right';
        ctx.fillStyle = emptyColor;
        ctx.fillText('------', (256 - 14) * S, rowY);
      }
    }

    // Dismiss prompt at y=183
    ctx.font = `${5 * S}px "Press Start 2P"`;
    ctx.textAlign = 'center';
    ctx.fillStyle = this.blinkOn ? '#cccc44' : '#666622';
    ctx.fillText('CLICK TO CONTINUE', W / 2, 183 * S);
  }
}
