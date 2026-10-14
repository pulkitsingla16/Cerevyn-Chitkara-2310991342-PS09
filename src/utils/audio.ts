// Zero-dependency Web Audio API Sound Synthesizer
// Generates arcade sound effects in real time without external audio files

class SoundController {
  private ctx: AudioContext | null = null
  private enabled: boolean = true

  constructor() {
    // Check localStorage for saved sound preference
    try {
      const saved = localStorage.getItem('memorymatch_sound')
      if (saved !== null) {
        this.enabled = saved === 'true'
      }
    } catch {
      this.enabled = true
    }
  }

  private getContext(): AudioContext | null {
    if (!this.enabled) return null
    if (typeof window === 'undefined') return null

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume()
    }

    return this.ctx
  }

  public isEnabled(): boolean {
    return this.enabled
  }

  public setEnabled(val: boolean): void {
    this.enabled = val
    try {
      localStorage.setItem('memorymatch_sound', String(val))
    } catch {
      // ignore
    }
  }

  public toggle(): boolean {
    this.setEnabled(!this.enabled)
    if (this.enabled) {
      this.playFlip()
    }
    return this.enabled
  }

  // Soft high-frequency card flip click
  public playFlip(): void {
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const now = ctx.currentTime

      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08)

      gain.gain.setValueAtTime(0.15, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.08)
    } catch {
      // Audio safety catch
    }
  }

  // Cheerful two-tone match chime
  public playMatch(): void {
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const notes = [523.25, 659.25, 783.99] // C5, E5, G5

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const noteStart = now + idx * 0.07

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(freq, noteStart)

        gain.gain.setValueAtTime(0.2, noteStart)
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.25)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(noteStart)
        osc.stop(noteStart + 0.25)
      })
    } catch {
      // Audio safety catch
    }
  }

  // High-energy combo streak sound
  public playCombo(streak: number): void {
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const baseFreq = Math.min(600 + streak * 80, 1200)

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'square'
      osc.frequency.setValueAtTime(baseFreq, now)
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.18)

      gain.gain.setValueAtTime(0.12, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.22)
    } catch {
      // Audio safety catch
    }
  }

  // Gentle low mismatch thud
  public playMismatch(): void {
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const now = ctx.currentTime

      osc.type = 'sine'
      osc.frequency.setValueAtTime(260, now)
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.15)

      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.15)
    } catch {
      // Audio safety catch
    }
  }

  // Triumphant game win fanfare
  public playWin(): void {
    const ctx = this.getContext()
    if (!ctx) return

    try {
      const now = ctx.currentTime
      const melody = [
        { note: 523.25, time: 0.00, dur: 0.12 }, // C5
        { note: 659.25, time: 0.12, dur: 0.12 }, // E5
        { note: 783.99, time: 0.24, dur: 0.12 }, // G5
        { note: 1046.50, time: 0.36, dur: 0.45 }, // C6
      ]

      melody.forEach(({ note, time, dur }) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        const start = now + time

        osc.type = 'triangle'
        osc.frequency.setValueAtTime(note, start)

        gain.gain.setValueAtTime(0.22, start)
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur)

        osc.connect(gain)
        gain.connect(ctx.destination)

        osc.start(start)
        osc.stop(start + dur)
      })
    } catch {
      // Audio safety catch
    }
  }
}

export const sound = new SoundController()
