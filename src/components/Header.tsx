import { Sparkles, RotateCcw } from 'lucide-react'

import { getDifficultyColor, getDifficultyLabel } from '../game/config'
import type { Difficulty } from '../game/types'

interface HeaderProps {
  difficulty: Difficulty
  onRestart: () => void
}

export function Header({ difficulty, onRestart }: HeaderProps) {
  const diffColor = getDifficultyColor(difficulty)

  return (
    <header className="topbar">
      <div className="brand-group">
        <div className="brand-badge">
          <Sparkles size={13} className="sparkle-icon" />
          <span>Cerevyn Technical Assessment • PS09</span>
        </div>
        <h1 className="game-title">
          Memory<span>Match</span>
        </h1>
      </div>

      <div className="topbar-meta">
        <div className="difficulty-pill" aria-live="polite">
          <span className="label">Current Level</span>
          <strong style={{ color: diffColor }}>{getDifficultyLabel(difficulty)}</strong>
        </div>
        <button type="button" className="restart-btn" onClick={onRestart}>
          <RotateCcw size={16} aria-hidden="true" />
          <span>Restart round</span>
        </button>
      </div>
    </header>
  )
}
