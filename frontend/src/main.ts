import { Game }         from './game/Game'
import { SpriteSheet }  from './game/SpriteSheet'
import { SPRITE_FRAMES } from './game/SpriteMap'

async function main(): Promise<void> {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement
  if (!canvas) throw new Error('Canvas element #game-canvas not found')

  // Wait for the pixel font before the first frame so HUD text never flashes
  await document.fonts.load('8px "Press Start 2P"').catch(() => {
    console.warn('Press Start 2P font unavailable; using monospace fallback')
  })

  // Load the sprite sheet — fall back to canvas primitives if it fails
  const sheet = new SpriteSheet('/sprites.png', SPRITE_FRAMES)
  await sheet.load().catch((err: unknown) => {
    console.warn(`Sprite sheet failed to load — using canvas fallback graphics: ${String(err)}`)
  })
  console.log('[DuckHunt] sprite sheet loaded:', sheet.isLoaded)

  const game = new Game(canvas, sheet.isLoaded ? sheet : null)
  game.start()
}

main().catch(console.error)
