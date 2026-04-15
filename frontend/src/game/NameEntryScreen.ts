/**
 * NameEntryScreen — arcade-style 3-letter initial entry.
 *
 * Controls
 * ─────────
 *   ArrowUp / ArrowDown        — cycle current letter (A–Z, wraps)
 *   ArrowRight / Enter / Space — confirm letter, advance cursor
 *   ArrowLeft  / Backspace     — move cursor back
 *
 * After the 3rd letter is confirmed isDone becomes true.
 * Read initials to get the three-character string.
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BLINK_MS = 480;

export class NameEntryScreen {
  private letters: string[] = ['A', 'A', 'A'];
  private cursor: number = 0;
  private blinkOn: boolean = true;
  private blinkTimer: number = 0;
  private flashTimer: number[] = [0, 0, 0];

  reset(): void {
    this.letters = ['A', 'A', 'A'];
    this.cursor = 0;
    this.blinkOn = true;
    this.blinkTimer = 0;
    this.flashTimer = [0, 0, 0];
  }

  get initials(): string {
    return this.letters.join('');
  }

  get isDone(): boolean {
    return this.cursor >= 3;
  }

  handleKey(key: string): void {
    if (this.isDone) return;

    if (key === 'ArrowUp') {
      const idx = ALPHABET.indexOf(this.letters[this.cursor]);
      this.letters[this.cursor] = ALPHABET[(idx + 1) % ALPHABET.length];
    } else if (key === 'ArrowDown') {
      const idx = ALPHABET.indexOf(this.letters[this.cursor]);
      this.letters[this.cursor] = ALPHABET[(idx - 1 + ALPHABET.length) % ALPHABET.length];
    } else if (key === 'ArrowRight' || key === 'Enter' || key === ' ') {
      this.flashTimer[this.cursor] = 200;
      this.cursor++;
      this.blinkOn = true;
      this.blinkTimer = 0;
    } else if (key === 'ArrowLeft' || key === 'Backspace') {
      if (this.cursor > 0) {
        this.cursor--;
        this.blinkOn = true;
        this.blinkTimer = 0;
      }
    }
  }

  update(dt: number): void {
    this.blinkTimer += dt;
    if (this.blinkTimer >= BLINK_MS) {
      this.blinkTimer -= BLINK_MS;
      this.blinkOn = !this.blinkOn;
    }

    for (let i = 0; i < 3; i++) {
      if (this.flashTimer[i] > 0) {
        this.flashTimer[i] -= dt;
        if (this.flashTimer[i] < 0) this.flashTimer[i] = 0;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D, scale: number, score: number): void {
    const S = scale;
    const W = 256 * S;
    const H = 240 * S;

    // Background
    ctx.fillStyle = '#000814';
    ctx.fillRect(0, 0, W, H);

    // Scanline overlay
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let y = 0; y < 240; y += 4) {
      ctx.fillRect(0, y * S, W, 1 * S);
    }

    // Border
    ctx.strokeStyle = '#003366';
    ctx.lineWidth = 2 * S;
    ctx.strokeRect(6 * S, 6 * S, (256 - 12) * S, (240 - 12) * S);

    // "NEW RECORD!" title
    ctx.font = `${9 * S}px "Press Start 2P"`;
    ctx.textAlign = 'center';
    // Shadow
    ctx.fillStyle = '#004466';
    ctx.fillText('NEW RECORD!', W / 2 + 1 * S, 26 * S + 1 * S);
    // Title
    ctx.fillStyle = '#00ccff';
    ctx.fillText('NEW RECORD!', W / 2, 26 * S);

    // Score
    ctx.font = `${8 * S}px "Press Start 2P"`;
    ctx.fillStyle = '#ffdd00';
    ctx.fillText(String(score).padStart(6, '0'), W / 2, 48 * S);

    // "ENTER YOUR NAME"
    ctx.font = `${6 * S}px "Press Start 2P"`;
    ctx.fillStyle = '#888888';
    ctx.fillText('ENTER YOUR NAME', W / 2, 70 * S);

    // Three letter boxes
    const boxW = 30 * S;
    const boxH = 32 * S;
    const gap = 8 * S;
    const totalW = 3 * boxW + 2 * gap;
    const startX = (W - totalW) / 2;
    const boxTopY = 82 * S;

    for (let i = 0; i < 3; i++) {
      const flashing = this.flashTimer[i] > 0;
      const active = !this.isDone && this.cursor === i;
      const confirmed = this.cursor > i;
      const boxX = startX + i * (boxW + gap);

      // Box background
      if (flashing) {
        ctx.fillStyle = '#ffffff';
      } else if (active) {
        ctx.fillStyle = '#001a40';
      } else if (confirmed) {
        ctx.fillStyle = '#001a20';
      } else {
        ctx.fillStyle = '#0a0a14';
      }
      ctx.fillRect(boxX, boxTopY, boxW, boxH);

      // Box border (inset 1*S)
      ctx.lineWidth = 2 * S;
      if (flashing) {
        ctx.strokeStyle = '#ffffff';
      } else if (active) {
        ctx.strokeStyle = '#4499ff';
      } else if (confirmed) {
        ctx.strokeStyle = '#00cc88';
      } else {
        ctx.strokeStyle = '#22334d';
      }
      ctx.strokeRect(boxX + 1 * S, boxTopY + 1 * S, boxW - 2 * S, boxH - 2 * S);

      // Arrow indicators (only on active box)
      if (active) {
        ctx.fillStyle = '#4499ff';
        ctx.font = `${6 * S}px "Press Start 2P"`;
        ctx.textAlign = 'center';
        const boxCenterX = boxX + boxW / 2;
        ctx.fillText('▲', boxCenterX, boxTopY - 8 * S);
        ctx.fillText('▼', boxCenterX, boxTopY + boxH + 8 * S + 6 * S);
      }

      // Letter
      const showLetter = flashing || (!active) || this.blinkOn;
      if (showLetter) {
        ctx.font = `${18 * S}px "Press Start 2P"`;
        ctx.textAlign = 'center';
        if (flashing) {
          ctx.fillStyle = '#000000';
        } else if (active) {
          ctx.fillStyle = '#66aaff';
        } else if (confirmed) {
          ctx.fillStyle = '#00ffaa';
        } else {
          ctx.fillStyle = '#334455';
        }
        const boxCenterX = boxX + boxW / 2;
        const letterY = boxTopY + boxH / 2 + 7 * S;
        ctx.fillText(this.letters[i], boxCenterX, letterY);
      }
    }

    // Controls hints
    ctx.font = `${5 * S}px "Press Start 2P"`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#335533';
    ctx.fillText('▲▼ CHANGE    ENTER NEXT', W / 2, 152 * S);
    ctx.fillText('BACK = BACKSPACE', W / 2, 165 * S);
  }
}
