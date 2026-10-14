import { RefreshCw } from 'lucide-react'

import { getDifficultyLabel } from '../game/config'
import type { Difficulty } from '../game/types'

interface HeaderProps {
  difficulty: Difficulty
  onRestart: () => void
}

export function Header({ difficulty, onRestart }: HeaderProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Cerevyn Technical Assessment</p>
        <h1>MemoryMatch</h1>
      </div>

      <div className="topbar-meta">
        <div className="difficulty-pill" aria-live="polite">
          <span className="label">Current difficulty</span>
          <strong>{getDifficultyLabel(difficulty)}</strong>
        </div>
        <button type="button" className="primary-button" onClick={onRestart}>
          <RefreshCw size={16} aria-hidden="true" />
          Restart round
        </button>
      </div>
    </header>
  )
}
