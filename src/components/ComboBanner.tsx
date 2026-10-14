import { Flame, Sparkles } from 'lucide-react'

interface ComboBannerProps {
  streak: number
  showReadyBanner: boolean
  difficultyLabel: string
}

export function ComboBanner({ streak, showReadyBanner, difficultyLabel }: ComboBannerProps) {
  return (
    <>
      {showReadyBanner && (
        <div className="ready-banner-overlay" aria-hidden="true">
          <div className="ready-banner-card">
            <span className="ready-tag">{difficultyLabel.toUpperCase()} ROUND</span>
            <h1 className="ready-title">READY, SET, MATCH!</h1>
            <p className="ready-subtitle">Flip cards & match pairs to beat the timer</p>
          </div>
        </div>
      )}

      {streak >= 2 && (
        <div key={streak} className="combo-streak-pill" role="status" aria-live="polite">
          <Flame size={20} className="combo-flame-icon" />
          <span className="combo-text">{streak}x COMBO STREAK!</span>
          <Sparkles size={16} className="combo-sparkle-icon" />
        </div>
      )}
    </>
  )
}
