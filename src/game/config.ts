import type { Difficulty } from './types'

export const STORAGE_MAX_ITEMS = 100
export const MISMATCH_DELAY_MS = 450

export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  {
    label: string
    rows: number
    cols: number
    totalCards: number
    pairCount: number
    description: string
    color: string
  }
> = {
  easy: {
    label: 'Easy',
    rows: 4,
    cols: 4,
    totalCards: 16,
    pairCount: 8,
    description: 'Classic 4×4 board with 8 pairs.',
    color: '#34d399',
  },
  medium: {
    label: 'Medium',
    rows: 4,
    cols: 5,
    totalCards: 20,
    pairCount: 10,
    description: 'Expanded 4×5 board with 10 pairs.',
    color: '#60a5fa',
  },
  hard: {
    label: 'Hard',
    rows: 4,
    cols: 6,
    totalCards: 24,
    pairCount: 12,
    description: 'Challenging 4×6 board with 12 pairs.',
    color: '#f87171',
  },
}

export function getDifficultyLabel(d: Difficulty): string {
  return DIFFICULTY_CONFIG[d].label
}

export function getDifficultyColor(d: Difficulty): string {
  return DIFFICULTY_CONFIG[d].color
}

/**
 * Adaptive rules — three-level system
 *
 * Easy   → Medium : moves ≤ 18  AND time ≤ 60 s
 * Medium → Hard   : moves ≤ 22  AND time ≤ 90 s
 * Medium → Easy   : moves > 28  OR  time > 100 s
 * Hard   → Medium : moves > 35  OR  time > 150 s
 */
export const ADAPTIVE_RULES = {
  easyToMedium: { maxMoves: 18, maxSeconds: 60, label: 'Easy → Medium' },
  mediumToHard: { maxMoves: 22, maxSeconds: 90, label: 'Medium → Hard' },
  mediumToEasy: { maxMoves: 28, maxSeconds: 100, label: 'Medium → Easy' },
  hardToMedium: { maxMoves: 35, maxSeconds: 150, label: 'Hard → Medium' },
} as const

export const CARD_SYMBOLS = [
  '☀️',
  '🌙',
  '⭐',
  '🌊',
  '🔥',
  '🌿',
  '🎯',
  '💎',
  '🎵',
  '🧠',
  '🌈',
  '⚡',
  '🍀',
  '🎲',
  '🪐',
  '🔮',
]
