import { getDifficultyLabel } from '../game/config'
import type { Difficulty, DifficultyDecision } from '../game/types'

interface DifficultyNoticeProps {
  decision: DifficultyDecision | null
  currentDifficulty: Difficulty
}

export function DifficultyNotice({ decision, currentDifficulty }: DifficultyNoticeProps) {
  if (!decision) {
    return (
      <div className="panel notice-panel">
        <h3>Next round</h3>
        <p>The game will use the current difficulty until a round is completed.</p>
      </div>
    )
  }

  return (
    <div className="panel notice-panel">
      <h3>Difficulty rule</h3>
      <p>
        <strong>{getDifficultyLabel(currentDifficulty)}</strong> →{' '}
        <strong>{getDifficultyLabel(decision.nextDifficulty)}</strong>
      </p>
      <p>{decision.reason}</p>
      {decision.metThresholds.length > 0 ? (
        <ul>
          {decision.metThresholds.map((threshold) => (
            <li key={threshold}>{threshold}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
