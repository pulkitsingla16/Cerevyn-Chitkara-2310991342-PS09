import { ADAPTIVE_RULES } from './config'
import type { Difficulty, DifficultyDecision, RoundSummary } from './types'

function buildHoldDecision(current: Difficulty, reason: string): DifficultyDecision {
  return { currentDifficulty: current, nextDifficulty: current, reason, metThresholds: [] }
}

export function decideNextDifficulty(
  current: Difficulty,
  lastCompleted: RoundSummary | null,
): DifficultyDecision {
  if (!lastCompleted) {
    return buildHoldDecision(
      current,
      'The previous round did not finish, so the current difficulty stays unchanged.',
    )
  }

  const { moves, elapsedSeconds } = lastCompleted

  /* ── EASY ─────────────────────────────────────────────────────────── */
  if (current === 'easy') {
    const promotes =
      moves <= ADAPTIVE_RULES.easyToMedium.maxMoves &&
      elapsedSeconds <= ADAPTIVE_RULES.easyToMedium.maxSeconds

    if (promotes) {
      return {
        currentDifficulty: 'easy',
        nextDifficulty: 'medium',
        reason: `Great performance! Easy completed in ≤${ADAPTIVE_RULES.easyToMedium.maxMoves} moves and ≤${ADAPTIVE_RULES.easyToMedium.maxSeconds}s — advancing to Medium.`,
        metThresholds: [
          `moves ≤ ${ADAPTIVE_RULES.easyToMedium.maxMoves}`,
          `time ≤ ${ADAPTIVE_RULES.easyToMedium.maxSeconds}s`,
        ],
      }
    }

    const reasons: string[] = []
    if (moves > ADAPTIVE_RULES.easyToMedium.maxMoves)
      reasons.push(`moves ${moves} exceeded ${ADAPTIVE_RULES.easyToMedium.maxMoves}`)
    if (elapsedSeconds > ADAPTIVE_RULES.easyToMedium.maxSeconds)
      reasons.push(`time ${elapsedSeconds}s exceeded ${ADAPTIVE_RULES.easyToMedium.maxSeconds}s`)

    return {
      currentDifficulty: 'easy',
      nextDifficulty: 'easy',
      reason:
        reasons.length > 0
          ? `Easy stays — promotion needs both ≤${ADAPTIVE_RULES.easyToMedium.maxMoves} moves and ≤${ADAPTIVE_RULES.easyToMedium.maxSeconds}s: ${reasons.join(' and ')}.`
          : `Easy stays — promotion thresholds were not fully met.`,
      metThresholds: reasons,
    }
  }

  /* ── MEDIUM ────────────────────────────────────────────────────────── */
  if (current === 'medium') {
    const promotes =
      moves <= ADAPTIVE_RULES.mediumToHard.maxMoves &&
      elapsedSeconds <= ADAPTIVE_RULES.mediumToHard.maxSeconds

    const reduces =
      moves > ADAPTIVE_RULES.mediumToEasy.maxMoves ||
      elapsedSeconds > ADAPTIVE_RULES.mediumToEasy.maxSeconds

    if (promotes) {
      return {
        currentDifficulty: 'medium',
        nextDifficulty: 'hard',
        reason: `Excellent! Medium completed in ≤${ADAPTIVE_RULES.mediumToHard.maxMoves} moves and ≤${ADAPTIVE_RULES.mediumToHard.maxSeconds}s — advancing to Hard.`,
        metThresholds: [
          `moves ≤ ${ADAPTIVE_RULES.mediumToHard.maxMoves}`,
          `time ≤ ${ADAPTIVE_RULES.mediumToHard.maxSeconds}s`,
        ],
      }
    }

    if (reduces) {
      return {
        currentDifficulty: 'medium',
        nextDifficulty: 'easy',
        reason: `Medium reduced to Easy — either moves exceeded ${ADAPTIVE_RULES.mediumToEasy.maxMoves} or time exceeded ${ADAPTIVE_RULES.mediumToEasy.maxSeconds}s.`,
        metThresholds: [
          `moves > ${ADAPTIVE_RULES.mediumToEasy.maxMoves}`,
          `time > ${ADAPTIVE_RULES.mediumToEasy.maxSeconds}s`,
        ],
      }
    }

    return {
      currentDifficulty: 'medium',
      nextDifficulty: 'medium',
      reason: `Medium stays — performance is within the hold range (moves ≤ ${ADAPTIVE_RULES.mediumToEasy.maxMoves} and time ≤ ${ADAPTIVE_RULES.mediumToEasy.maxSeconds}s, but not fast enough to promote).`,
      metThresholds: [
        `moves ≤ ${ADAPTIVE_RULES.mediumToEasy.maxMoves}`,
        `time ≤ ${ADAPTIVE_RULES.mediumToEasy.maxSeconds}s`,
      ],
    }
  }

  /* ── HARD ──────────────────────────────────────────────────────────── */
  const reduces =
    moves > ADAPTIVE_RULES.hardToMedium.maxMoves ||
    elapsedSeconds > ADAPTIVE_RULES.hardToMedium.maxSeconds

  if (reduces) {
    return {
      currentDifficulty: 'hard',
      nextDifficulty: 'medium',
      reason: `Hard reduced to Medium — either moves exceeded ${ADAPTIVE_RULES.hardToMedium.maxMoves} or time exceeded ${ADAPTIVE_RULES.hardToMedium.maxSeconds}s.`,
      metThresholds: [
        `moves > ${ADAPTIVE_RULES.hardToMedium.maxMoves}`,
        `time > ${ADAPTIVE_RULES.hardToMedium.maxSeconds}s`,
      ],
    }
  }

  return {
    currentDifficulty: 'hard',
    nextDifficulty: 'hard',
    reason: `Hard stays — moves ≤ ${ADAPTIVE_RULES.hardToMedium.maxMoves} and time ≤ ${ADAPTIVE_RULES.hardToMedium.maxSeconds}s, within the hold threshold.`,
    metThresholds: [
      `moves ≤ ${ADAPTIVE_RULES.hardToMedium.maxMoves}`,
      `time ≤ ${ADAPTIVE_RULES.hardToMedium.maxSeconds}s`,
    ],
  }
}
