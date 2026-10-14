import { Sparkles, RotateCcw, Volume2, VolumeX, HelpCircle } from 'lucide-react'

import { getDifficultyColor, getDifficultyLabel } from '../game/config'
import type { Difficulty } from '../game/types'

interface HeaderProps {
  difficulty: Difficulty
  soundEnabled?: boolean
  onToggleSound?: () => void
  onOpenRules?: () => void
  onRestart: () => void
}

export function Header({
  difficulty,
  soundEnabled = true,
  onToggleSound,
  onOpenRules,
  onRestart,
}: HeaderProps) {
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
        {onOpenRules && (
          <button
            type="button"
            className="rules-pill-btn"
            onClick={onOpenRules}
            aria-label="Game rules and how to play"
            title="How to play"
          >
            <HelpCircle size={15} />
            <span>Rules</span>
          </button>
        )}

        {onToggleSound && (
          <button
            type="button"
            className={`sound-toggle-btn ${soundEnabled ? 'active' : 'muted'}`}
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Unmute sound effects'}
            title={soundEnabled ? 'Sound ON' : 'Sound OFF'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        )}

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
