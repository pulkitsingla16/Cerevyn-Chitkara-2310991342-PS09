export type Difficulty = 'easy' | 'medium' | 'hard'
export type RoundStatus = 'idle' | 'playing' | 'won'
export type SessionStatus = 'completed' | 'incomplete'

export interface PersonalBest {
  moves: number
  seconds: number
  timestamp: string
}

export type BestScores = Partial<Record<Difficulty, PersonalBest>>

export interface MemoryCard {
  id: string
  pairId: string
  symbol: string
  isMatched: boolean
}

export interface RoundSummary {
  moves: number
  elapsedSeconds: number
  difficulty: Difficulty
  completedPairs: number
}

export interface SessionRecord {
  id: string
  difficulty: Difficulty
  moves: number
  completedPairs: number
  completionSeconds: number
  status: SessionStatus
  seed?: number | string
  timestamp: string
}

export interface DifficultyDecision {
  currentDifficulty: Difficulty
  nextDifficulty: Difficulty
  reason: string
  metThresholds: string[]
}

export interface GameCard {
  id: string
  pairId: string
  symbol: string
}
