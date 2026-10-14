import { Trophy, Star, ArrowRight, RotateCcw } from 'lucide-react'
import { getDifficultyLabel } from '../game/config'
import type { Difficulty } from '../game/types'

interface WinPanelProps {
  moves: number
  completionSeconds: number | null
  completedPairs: number
  totalPairs: number
  previousDifficulty: Difficulty
  nextDifficulty: Difficulty
  explanation: string
  isNewBest: boolean
  onReplay: () => void
  onNext: () => void
}

export function WinPanel({
  moves,
  completionSeconds,
  completedPairs,
  totalPairs,
  previousDifficulty,
  nextDifficulty,
  explanation,
  isNewBest,
  onReplay,
  onNext,
}: WinPanelProps) {
  const isPromotion =
    (previousDifficulty === 'easy' && nextDifficulty === 'medium') ||
    (previousDifficulty === 'medium' && nextDifficulty === 'hard')

  let stars = 1
  let rank = 'B'
  let rankColor = '#34d399'

  if (isPromotion) {
    stars = 3
    rank = 'S'
    rankColor = '#fbbf24'
  } else if (moves <= 24) {
    stars = 2
    rank = 'A'
    rankColor = '#38bdf8'
  }

  return (
    <section className="panel win-panel" aria-live="polite">
      <div className="section-heading">
        <h2>Round complete 🎉</h2>
      </div>

      <div className="win-header-badge-row">
        <div className={`win-rank-badge rank-${rank.toLowerCase()}`}>
          <Trophy size={18} style={{ color: rankColor }} />
          <span>RANK {rank}</span>
        </div>

        <div className="win-stars-row" aria-label={`${stars} out of 3 stars`}>
          {[1, 2, 3].map((starIdx) => (
            <Star
              key={starIdx}
              size={24}
              className={`win-star-icon ${starIdx <= stars ? 'star-filled' : 'star-empty'}`}
            />
          ))}
        </div>
      </div>

      <h3>You matched every pair!</h3>

      {isNewBest && (
        <div className="new-best-banner">
          🏆 New personal best!
        </div>
      )}

      {isPromotion && (
        <div className="promo-announcement-banner">
          ⚡ EXCELLENT PERFORMANCE! UNLOCKED {getDifficultyLabel(nextDifficulty).toUpperCase()} BOARD!
        </div>
      )}

      <div className="win-summary-grid">
        <div>
          <span>Total moves</span>
          <strong>{moves}</strong>
        </div>
        <div>
          <span>Completion time</span>
          <strong>{completionSeconds === null ? '—' : `${completionSeconds.toFixed(1)}s`}</strong>
        </div>
        <div>
          <span>Pairs matched</span>
          <strong>{completedPairs}/{totalPairs}</strong>
        </div>
        <div>
          <span>Previous difficulty</span>
          <strong>{getDifficultyLabel(previousDifficulty)}</strong>
        </div>
        <div>
          <span>Next difficulty</span>
          <strong>{getDifficultyLabel(nextDifficulty)}</strong>
        </div>
      </div>

      <p className="win-explanation">{explanation}</p>

      <div className="win-actions">
        <button type="button" className="secondary-button" onClick={onReplay}>
          <RotateCcw size={16} />
          <span>Replay current difficulty</span>
        </button>
        <button type="button" className="primary-button" onClick={onNext}>
          <span>Start next round</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </section>
  )
}
