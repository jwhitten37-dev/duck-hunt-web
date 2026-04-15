/**
 * SoundManager — all Duck Hunt audio synthesized with the Web Audio API.
 *
 * No external audio files are required. Every sound is built from:
 *   • Oscillators  (square / sine / sawtooth) — melodic tones & NES-style SFX
 *   • White-noise  (AudioBuffer)              — gunshot crack
 *   • GainNodes    (envelopes)                — attack / decay shaping
 *   • BiquadFilter (high / low pass)          — tonal shaping
 *
 * Autoplay policy
 * ───────────────
 * Browsers suspend AudioContext until a user gesture. Call resume() from
 * the first click handler — it is a no-op after the first call.
 *
 * Usage
 *   const snd = new SoundManager()
 *   // on first click:
 *   snd.resume()
 *   // then:
 *   snd.playGunshot()
 *   snd.startMusic()
 *   // M key:
 *   snd.toggleMute()
 */

// ─── Background melody (original composition) ────────────────────────────────
// Format: [frequencyHz, durationInBeats]   0 Hz = rest
// Tempo: 128 BPM  (beat = 468.75 ms)
// Key: G major  —  cheerful outdoor/hunting feel in 8-bit square-wave style

const BPM = 128
const MELODY: Array<[number, number]> = [
  // ── Phrase A ──────────────────────────────────────────────────────────────
  [392, 0.5], [440, 0.5], [494, 0.5], [523, 0.5],  // G4 A4 B4 C5
  [440, 1.0], [392, 1.0],                            // A4  G4
  [349, 0.5], [392, 0.5], [440, 0.5], [392, 0.5],  // F4 G4 A4 G4
  [330, 1.5], [0, 0.5],                              // E4  rest

  // ── Phrase B ──────────────────────────────────────────────────────────────
  [523, 0.5], [587, 0.5], [659, 0.5], [698, 0.5],  // C5 D5 E5 F5
  [659, 1.0], [587, 1.0],                            // E5  D5
  [523, 0.5], [494, 0.5], [440, 0.5], [392, 0.5],  // C5 B4 A4 G4
  [440, 1.5], [0, 0.5],                              // A4  rest

  // ── Phrase C (bridge) ─────────────────────────────────────────────────────
  [494, 0.5], [523, 0.5], [494, 0.5], [440, 0.5],  // B4 C5 B4 A4
  [392, 1.0], [330, 1.0],                            // G4  E4
  [392, 0.5], [440, 0.5], [494, 0.5], [440, 0.5],  // G4 A4 B4 A4
  [392, 2.0],                                        // G4 (hold)
]

// Simple bass line (one note per bar, triangle-wave sub-bass)
const BASS: Array<[number, number]> = [
  [98, 4], [110, 4], [87, 4], [98, 4],   // G2 A2 F2 G2
  [110, 4], [130, 4], [98, 4], [98, 4],  // A2 C3 G2 G2
  [123, 4], [130, 4], [110, 4], [98, 4], // B2 C3 A2 G2
]

// ─── SoundManager ─────────────────────────────────────────────────────────────

export class SoundManager {
  private ac:          AudioContext | null = null
  private masterGain:  GainNode | null     = null

  private musicPlaying  = false
  private melodyIndex   = 0
  private bassIndex     = 0
  private melodyTimer:  ReturnType<typeof setTimeout> | null = null
  private bassTimer:    ReturnType<typeof setTimeout> | null = null

  private _muted = false

  // ─── Lifecycle ─────────────────────────────────────────────────────────────

  /**
   * Must be called from a user-gesture handler (mouse click / key press)
   * before any audio is produced. Safe to call multiple times.
   */
  resume(): void {
    if (!this.ac) {
      this.ac = new AudioContext()
      this.masterGain = this.ac.createGain()
      this.masterGain.gain.value = this._muted ? 0 : 0.22
      this.masterGain.connect(this.ac.destination)
    }
    if (this.ac.state === 'suspended') void this.ac.resume()
  }

  // ─── Sound effects ─────────────────────────────────────────────────────────

  /** Short white-noise crack + low-frequency thump. */
  playGunshot(): void {
    const ac = this.ac
    if (!ac || !this.masterGain) return
    const t = ac.currentTime

    // ── Noise crack
    const bufLen = Math.floor(ac.sampleRate * 0.07)
    const buf    = ac.createBuffer(1, bufLen, ac.sampleRate)
    const data   = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1

    const noise      = ac.createBufferSource()
    noise.buffer     = buf
    const noiseFilt  = ac.createBiquadFilter()
    noiseFilt.type   = 'bandpass'
    noiseFilt.frequency.value = 1800
    noiseFilt.Q.value = 0.8
    const noiseGain  = ac.createGain()
    noiseGain.gain.setValueAtTime(1.0, t)
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07)

    noise.connect(noiseFilt)
    noiseFilt.connect(noiseGain)
    noiseGain.connect(this.masterGain)
    noise.start(t)

    // ── Low thump
    const thumpOsc  = ac.createOscillator()
    thumpOsc.type   = 'sine'
    thumpOsc.frequency.setValueAtTime(120, t)
    thumpOsc.frequency.exponentialRampToValueAtTime(28, t + 0.08)
    const thumpGain = ac.createGain()
    thumpGain.gain.setValueAtTime(0.9, t)
    thumpGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08)

    thumpOsc.connect(thumpGain)
    thumpGain.connect(this.masterGain)
    thumpOsc.start(t)
    thumpOsc.stop(t + 0.08)
  }

  /** Descending square-wave squawk — the duck gets hit. */
  playDuckHit(): void {
    const ac = this.ac
    if (!ac || !this.masterGain) return
    const t = ac.currentTime

    const osc  = ac.createOscillator()
    osc.type   = 'square'
    osc.frequency.setValueAtTime(900, t)
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.18)

    const gain = ac.createGain()
    gain.gain.setValueAtTime(0.45, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18)

    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start(t)
    osc.stop(t + 0.18)
  }

  /** Dry metallic click — no ammo remaining. */
  playEmptyClick(): void {
    const ac = this.ac
    if (!ac || !this.masterGain) return
    const t = ac.currentTime

    // Very short bandpass noise burst at a high frequency — sounds like a trigger click
    const bufLen = Math.floor(ac.sampleRate * 0.025)
    const buf    = ac.createBuffer(1, bufLen, ac.sampleRate)
    const data   = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1

    const noise     = ac.createBufferSource()
    noise.buffer    = buf
    const filt      = ac.createBiquadFilter()
    filt.type       = 'bandpass'
    filt.frequency.value = 3200
    filt.Q.value    = 1.2
    const gain      = ac.createGain()
    gain.gain.setValueAtTime(0.5, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.025)

    noise.connect(filt); filt.connect(gain); gain.connect(this.masterGain)
    noise.start(t)
  }

  /** Rising-then-falling whistle — duck got away. */
  playDuckEscape(): void {
    const ac = this.ac
    if (!ac || !this.masterGain) return
    const t = ac.currentTime

    const osc  = ac.createOscillator()
    osc.type   = 'sine'
    osc.frequency.setValueAtTime(380, t)
    osc.frequency.linearRampToValueAtTime(680, t + 0.22)
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.45)

    const gain = ac.createGain()
    gain.gain.setValueAtTime(0.30, t)
    gain.gain.setValueAtTime(0.30, t + 0.22)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45)

    osc.connect(gain)
    gain.connect(this.masterGain)
    osc.start(t)
    osc.stop(t + 0.45)
  }

  /** Three "ha-ha-ha" pulses — dog mocks the player. */
  playDogLaugh(): void {
    const ac = this.ac
    if (!ac || !this.masterGain) return

    for (let i = 0; i < 3; i++) {
      const t   = ac.currentTime + i * 0.20

      const osc = ac.createOscillator()
      osc.type  = 'square'
      osc.frequency.setValueAtTime(300, t)
      osc.frequency.exponentialRampToValueAtTime(230, t + 0.13)

      const gain = ac.createGain()
      gain.gain.setValueAtTime(0.38, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13)

      osc.connect(gain)
      gain.connect(this.masterGain)
      osc.start(t)
      osc.stop(t + 0.13)
    }
  }

  /** Short ascending fanfare — duck scored / round start. */
  playScore(): void {
    const ac = this.ac
    if (!ac || !this.masterGain) return

    const mg    = this.masterGain
    const notes = [523, 659, 784, 1047]   // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const t    = ac.currentTime + i * 0.09
      const osc  = ac.createOscillator()
      osc.type   = 'square'
      osc.frequency.value = freq
      const gain = ac.createGain()
      gain.gain.setValueAtTime(0.30, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08)
      osc.connect(gain)
      gain.connect(mg)
      osc.start(t)
      osc.stop(t + 0.08)
    })
  }

  // ─── Background music ──────────────────────────────────────────────────────

  startMusic(): void {
    if (this.musicPlaying || !this.ac) return
    this.musicPlaying = true
    this.melodyIndex  = 0
    this.bassIndex    = 0
    this.tickMelody()
    this.tickBass()
  }

  stopMusic(): void {
    this.musicPlaying = false
    if (this.melodyTimer !== null) { clearTimeout(this.melodyTimer); this.melodyTimer = null }
    if (this.bassTimer   !== null) { clearTimeout(this.bassTimer);   this.bassTimer   = null }
  }

  // ─── Mute ──────────────────────────────────────────────────────────────────

  toggleMute(): void {
    this._muted = !this._muted
    if (this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        this._muted ? 0 : 0.22,
        this.ac!.currentTime,
        0.05,
      )
    }
  }

  get isMuted(): boolean { return this._muted }

  // ─── Private: music sequencer ─────────────────────────────────────────────

  private tickMelody(): void {
    if (!this.musicPlaying || !this.ac || !this.masterGain) return

    const [freq, beats] = MELODY[this.melodyIndex]
    const durSec = (beats * 60) / BPM

    if (freq > 0) this.playMelodyNote(freq, durSec * 0.82)

    this.melodyIndex = (this.melodyIndex + 1) % MELODY.length
    this.melodyTimer = setTimeout(() => this.tickMelody(), durSec * 1000)
  }

  private tickBass(): void {
    if (!this.musicPlaying || !this.ac || !this.masterGain) return

    const [freq, beats] = BASS[this.bassIndex]
    const durSec = (beats * 60) / BPM

    this.playBassNote(freq, durSec * 0.55)

    this.bassIndex = (this.bassIndex + 1) % BASS.length
    this.bassTimer = setTimeout(() => this.tickBass(), durSec * 1000)
  }

  /** Square-wave melody note with a soft attack. */
  private playMelodyNote(freq: number, durSec: number): void {
    const ac = this.ac!
    const mg = this.masterGain!
    const t  = ac.currentTime

    const osc  = ac.createOscillator()
    osc.type   = 'square'
    osc.frequency.value = freq

    const gain = ac.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.18, t + 0.012)
    gain.gain.setValueAtTime(0.18, t + durSec - 0.02)
    gain.gain.linearRampToValueAtTime(0, t + durSec)

    osc.connect(gain)
    gain.connect(mg)
    osc.start(t)
    osc.stop(t + durSec)
  }

  /** Triangle-wave bass note — softer low-end. */
  private playBassNote(freq: number, durSec: number): void {
    const ac = this.ac!
    const mg = this.masterGain!
    const t  = ac.currentTime

    const osc  = ac.createOscillator()
    osc.type   = 'triangle'
    osc.frequency.value = freq

    const gain = ac.createGain()
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.12, t + 0.02)
    gain.gain.setValueAtTime(0.12, t + durSec - 0.04)
    gain.gain.linearRampToValueAtTime(0, t + durSec)

    osc.connect(gain)
    gain.connect(mg)
    osc.start(t)
    osc.stop(t + durSec)
  }
}
