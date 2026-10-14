import { getDifficultyLabel } from '../game/config'
import type { Difficulty, RoundStatus, PersonalBest } from '../game/types'

interface GameStatsProps {
  moves: number
  completedPairs: number
  totalPairs: number
  elapsedMs: number
  difficulty: Difficulty
  status: RoundStatus
  completionSeconds: number | null
  bestScore: PersonalBest | null
}

export function GameStats({
  moves,
  completedPairs,
  totalPairs,
  elapsedMs,
  difficulty,
  status,
  completionSeconds,
  bestScore,
}: GameStatsProps) {
  return (
    <section className="panel stats-panel" data-testid="stats-panel" aria-live="polite">
      <div className="section-heading">
        <h2>Game stats</h2>
        {bestScore && (
          <span className="best-badge" title="Your personal best for this difficulty">
            🏅 Best: {bestScore.moves}m / {bestScore.seconds.toFixed(1)}s
          </span>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <span>Moves</span>
          <strong>{moves}</strong>
        </div>
        <div className="stat-box">
          <span>Completed pairs</span>
          <strong>
            {completedPairs}/{totalPairs}
          </strong>
        </div>
        <div className="stat-box">
          <span>Active time</span>
          <strong>{(elapsedMs / 1000).toFixed(1)}s</strong>
        </div>
        <div className="stat-box">
          <span>Current difficulty</span>
          <strong>{getDifficultyLabel(difficulty)}</strong>
        </div>
        <div className="stat-box">
          <span>Round status</span>
          <strong>
            {status === 'won' ? 'Completed' : status === 'playing' ? 'In progress' : 'Ready'}
          </strong>
        </div>
        <div className="stat-box">
          <span>Final duration</span>
          <strong>
            {completionSeconds === null ? '—' : `${completionSeconds.toFixed(1)}s`}
          </strong>
        </div>
      </div>
    </section>
  )
}
