import { Trophy, Timer, CheckCircle2, Footprints, Layers } from 'lucide-react'

import { getDifficultyColor, getDifficultyLabel } from '../game/config'
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
  const diffColor = getDifficultyColor(difficulty)
  const percentComplete = Math.round((completedPairs / totalPairs) * 100)

  return (
    <section className="panel stats-panel" data-testid="stats-panel" aria-live="polite">
      <div className="section-heading">
        <div className="stats-heading-left">
          <h2>Dashboard</h2>
          <span className="live-pill">
            <span className="live-dot" />
            {status === 'won' ? 'Round Won' : status === 'playing' ? 'In Progress' : 'Ready'}
          </span>
        </div>

        {bestScore && (
          <span className="best-badge" title="Your personal best for this difficulty">
            <Trophy size={14} />
            <span>Best: {bestScore.moves}m • {bestScore.seconds.toFixed(1)}s</span>
          </span>
        )}
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${percentComplete}%`, backgroundColor: diffColor }}
          />
        </div>
        <div className="progress-labels">
          <span>Match Progress</span>
          <strong>{percentComplete}%</strong>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-box">
          <div className="stat-label-wrap">
            <Footprints size={14} className="stat-icon" />
            <span>Moves</span>
          </div>
          <strong className="stat-value" data-testid="moves-value">{moves}</strong>
        </div>

        <div className="stat-box">
          <div className="stat-label-wrap">
            <CheckCircle2 size={14} className="stat-icon" />
            <span>Pairs</span>
          </div>
          <strong className="stat-value">
            {completedPairs}<span className="stat-sub">/{totalPairs}</span>
          </strong>
        </div>

        <div className="stat-box">
          <div className="stat-label-wrap">
            <Timer size={14} className="stat-icon" />
            <span>Active time</span>
          </div>
          <strong className="stat-value">{(elapsedMs / 1000).toFixed(1)}s</strong>
        </div>

        <div className="stat-box">
          <div className="stat-label-wrap">
            <Layers size={14} className="stat-icon" />
            <span>Level</span>
          </div>
          <strong className="stat-value" style={{ color: diffColor }}>
            {getDifficultyLabel(difficulty)}
          </strong>
        </div>
      </div>

      {completionSeconds !== null && (
        <div className="finish-highlight">
          <span>Final completion time: <strong>{completionSeconds.toFixed(1)}s</strong> in <strong>{moves} moves</strong></span>
        </div>
      )}
    </section>
  )
}
