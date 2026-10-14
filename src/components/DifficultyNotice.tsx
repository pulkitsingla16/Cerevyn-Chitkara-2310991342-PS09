import { Compass, TrendingUp, AlertCircle } from 'lucide-react'

import { getDifficultyColor, getDifficultyLabel } from '../game/config'
import type { Difficulty, DifficultyDecision } from '../game/types'

interface DifficultyNoticeProps {
  decision: DifficultyDecision | null
  currentDifficulty: Difficulty
}

export function DifficultyNotice({ decision, currentDifficulty }: DifficultyNoticeProps) {
  if (!decision) {
    return (
      <div className="panel notice-panel">
        <div className="notice-header">
          <Compass size={16} className="notice-icon" />
          <h3>Adaptive System</h3>
        </div>
        <p className="notice-desc">
          Current level is <strong>{getDifficultyLabel(currentDifficulty)}</strong>. Complete this round to see the algorithm evaluate your next difficulty!
        </p>
      </div>
    )
  }

  const isPromotion = decision.nextDifficulty !== currentDifficulty && decision.nextDifficulty !== 'easy'
  const isDemotion = decision.nextDifficulty !== currentDifficulty && decision.nextDifficulty === 'easy'

  return (
    <div className={`panel notice-panel ${isPromotion ? 'notice-promo' : isDemotion ? 'notice-demo' : ''}`}>
      <div className="notice-header">
        {isPromotion ? (
          <TrendingUp size={18} className="notice-icon promo" />
        ) : (
          <AlertCircle size={18} className="notice-icon" />
        )}
        <h3>Difficulty Adaptation Rule</h3>
      </div>

      <div className="difficulty-transition-row">
        <span className="diff-tag" style={{ borderColor: getDifficultyColor(currentDifficulty) }}>
          {getDifficultyLabel(currentDifficulty)}
        </span>
        <span className="diff-arrow">➔</span>
        <span className="diff-tag next" style={{ borderColor: getDifficultyColor(decision.nextDifficulty), color: getDifficultyColor(decision.nextDifficulty) }}>
          {getDifficultyLabel(decision.nextDifficulty)}
        </span>
      </div>

      <p className="notice-reason">{decision.reason}</p>

      {decision.metThresholds.length > 0 && (
        <div className="thresholds-list">
          {decision.metThresholds.map((threshold) => (
            <span key={threshold} className="threshold-chip">
              ✓ {threshold}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
