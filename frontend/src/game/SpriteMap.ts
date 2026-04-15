/**
 * SpriteMap — complete frame coordinate table for sprites.png (644 × 294).
 *
 * Naming conventions:
 *   d1_* = duck variant 1 (brown/white)
 *   d2_* = duck variant 2 (blue/white)
 *   d3_* = duck variant 3 (red/white)
 *
 *   _right_N   = wing frames for horizontal flight (0–2)
 *   _upright_N = wing frames for upward flight (0–2)
 *   _shot      = frozen frame immediately after being hit
 *   _fall_N    = tumble frames during descent (0–3)
 *
 *   dog_run_N    = running intro frames (0–4, facing right)
 *   dog_success_1 / dog_success_2 = celebrate with 1 or 2 ducks
 *   dog_fail_0 / dog_fail_1       = laughing / mocking frames
 *   dog_found  = sniffing frame
 *   dog_jump_0 / dog_jump_1       = jump frames
 *
 *   bg_top    = sky + tree portion of the background (NES y 0–175)
 *   bg_bottom = bush + ground + HUD portion (NES y 176–239)
 */
import { FrameMap } from './SpriteSheet'

export const SPRITE_FRAMES: FrameMap = {

  // ── Duck 1 (brown/white) ───────────────────────────────────────────────────
  d1_right_0:    { x:   8, y: 127, w: 35, h: 34 },
  d1_right_1:    { x:  49, y: 138, w: 35, h: 23 },
  d1_right_2:    { x:  89, y: 138, w: 35, h: 28 },
  d1_upright_0:  { x: 137, y: 126, w: 29, h: 37 },
  d1_upright_1:  { x: 169, y: 132, w: 32, h: 31 },
  d1_upright_2:  { x: 204, y: 132, w: 25, h: 34 },
  d1_shot:       { x: 238, y: 135, w: 31, h: 32 },
  d1_fall_0:     { x: 280, y: 134, w: 20, h: 32 },
  d1_fall_1:     { x: 305, y: 133, w: 16, h: 33 },
  d1_fall_2:     { x: 328, y: 134, w: 20, h: 32 },
  d1_fall_3:     { x: 353, y: 134, w: 16, h: 33 },

  // ── Duck 2 (blue/white) ────────────────────────────────────────────────────
  d2_right_0:    { x:   7, y: 169, w: 35, h: 34 },
  d2_right_1:    { x:  48, y: 180, w: 35, h: 23 },
  d2_right_2:    { x:  88, y: 180, w: 35, h: 28 },
  d2_upright_0:  { x: 136, y: 169, w: 29, h: 37 },
  d2_upright_1:  { x: 168, y: 175, w: 32, h: 31 },
  d2_upright_2:  { x: 203, y: 175, w: 25, h: 34 },
  d2_shot:       { x: 239, y: 175, w: 31, h: 32 },
  d2_fall_0:     { x: 281, y: 174, w: 20, h: 32 },
  d2_fall_1:     { x: 307, y: 173, w: 16, h: 33 },
  d2_fall_2:     { x: 329, y: 174, w: 20, h: 32 },
  d2_fall_3:     { x: 355, y: 173, w: 16, h: 33 },

  // ── Duck 3 (red/white) ─────────────────────────────────────────────────────
  d3_right_0:    { x:   6, y: 212, w: 35, h: 34 },
  d3_right_1:    { x:  47, y: 223, w: 35, h: 23 },
  d3_right_2:    { x:  87, y: 223, w: 35, h: 28 },
  d3_upright_0:  { x: 135, y: 210, w: 29, h: 37 },
  d3_upright_1:  { x: 167, y: 216, w: 32, h: 31 },
  d3_upright_2:  { x: 202, y: 216, w: 25, h: 34 },
  d3_shot:       { x: 238, y: 219, w: 31, h: 32 },
  d3_fall_0:     { x: 280, y: 218, w: 20, h: 32 },
  d3_fall_1:     { x: 305, y: 217, w: 16, h: 33 },
  d3_fall_2:     { x: 326, y: 218, w: 20, h: 32 },
  d3_fall_3:     { x: 353, y: 217, w: 16, h: 33 },

  // ── Dog ───────────────────────────────────────────────────────────────────
  dog_run_0:     { x:   7, y:  22, w: 53, h: 40 },
  dog_run_1:     { x:  68, y:  22, w: 52, h: 40 },
  dog_run_2:     { x: 126, y:  20, w: 51, h: 42 },
  dog_run_3:     { x: 180, y:  21, w: 51, h: 40 },
  dog_run_4:     { x: 236, y:  19, w: 51, h: 42 },
  dog_success_1: { x:   6, y:  70, w: 49, h: 48 },
  dog_success_2: { x:  62, y:  70, w: 67, h: 48 },
  dog_fail_0:    { x: 137, y:  70, w: 33, h: 48 },
  dog_fail_1:    { x: 176, y:  70, w: 33, h: 48 },
  dog_found:     { x: 217, y:  72, w: 53, h: 45 },
  dog_jump_0:    { x: 283, y:  69, w: 44, h: 49 },
  dog_jump_1:    { x: 333, y:  75, w: 42, h: 41 },

  // ── Background (NES 256 × 240, split at the bush line) ────────────────────
  // bg_top    = sky + trees (NES y 0–175) — drawn BEHIND ducks
  // bg_bottom = bushes + ground + HUD strip (NES y 176–239) — drawn IN FRONT
  bg_top:        { x: 383, y:   5, w: 256, h: 176 },
  bg_bottom:     { x: 383, y: 181, w: 256, h:  64 },
}
