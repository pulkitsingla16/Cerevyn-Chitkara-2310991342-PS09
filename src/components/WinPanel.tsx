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
  return (
    <section className="panel win-panel" aria-live="polite">
      <div className="section-heading">
        <h2>Round complete 🎉</h2>
      </div>

      <h3>You matched every pair!</h3>

      {isNewBest && (
        <div className="new-best-banner">
          🏆 New personal best!
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
          Replay current difficulty
        </button>
        <button type="button" className="primary-button" onClick={onNext}>
          Start next round
        </button>
      </div>
    </section>
  )
}
