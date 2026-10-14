import { STORAGE_MAX_ITEMS } from '../game/config'
import type { BestScores, Difficulty, PersonalBest, SessionRecord } from '../game/types'

export const KNOWN_STORAGE_KEY = 'memory-match-history-v1'
export const BEST_SCORE_KEY = 'memory-match-best-v1'

function safeStorage(): Storage | null {
  if (typeof window === 'undefined' || !('localStorage' in window)) {
    return null
  }

  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function isSessionRecord(value: unknown): value is SessionRecord {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const record = value as Record<string, unknown>
  return (
    typeof record.id === 'string' &&
    (record.difficulty === 'easy' || record.difficulty === 'medium' || record.difficulty === 'hard') &&
    typeof record.moves === 'number' &&
    typeof record.completedPairs === 'number' &&
    typeof record.completionSeconds === 'number' &&
    (record.status === 'completed' || record.status === 'incomplete') &&
    typeof record.timestamp === 'string'
  )
}

export function readStoredSessions(): SessionRecord[] {
  const storage = safeStorage()
  if (!storage) {
    return []
  }

  try {
    const rawValue = storage.getItem(KNOWN_STORAGE_KEY)
    if (!rawValue) {
      return []
    }

    const parsed = JSON.parse(rawValue)
    if (!Array.isArray(parsed)) {
      return []
    }

    const validRecords = parsed.filter((entry): entry is SessionRecord => isSessionRecord(entry))
    return validRecords.slice(-STORAGE_MAX_ITEMS)
  } catch {
    return []
  }
}

export function saveStoredSessions(sessions: SessionRecord[]): boolean {
  const storage = safeStorage()
  if (!storage) {
    return false
  }

  try {
    const limited = sessions.slice(-STORAGE_MAX_ITEMS)
    storage.setItem(KNOWN_STORAGE_KEY, JSON.stringify(limited))
    return true
  } catch {
    return false
  }
}

export function clearStoredSessions(): boolean {
  const storage = safeStorage()
  if (!storage) {
    return false
  }

  try {
    storage.removeItem(KNOWN_STORAGE_KEY)
    return true
  } catch {
    return false
  }
}

/* ── Personal best scores ──────────────────────────────────────────── */

export function readBestScores(): BestScores {
  const storage = safeStorage()
  if (!storage) return {}

  try {
    const raw = storage.getItem(BEST_SCORE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? (parsed as BestScores) : {}
  } catch {
    return {}
  }
}

function saveBestScores(scores: BestScores): boolean {
  const storage = safeStorage()
  if (!storage) return false

  try {
    storage.setItem(BEST_SCORE_KEY, JSON.stringify(scores))
    return true
  } catch {
    return false
  }
}

/**
 * Compares the completed round against the stored personal best for
 * the given difficulty. Returns whether it is a new best and the
 * resulting best record.
 *
 * A result is considered "better" when it uses fewer moves, or the
 * same moves in less time.
 */
export function updateBestScore(
  difficulty: Difficulty,
  moves: number,
  seconds: number,
): { isNewBest: boolean; best: PersonalBest } {
  const current = readBestScores()
  const existing = current[difficulty]

  const isNewBest =
    !existing ||
    moves < existing.moves ||
    (moves === existing.moves && seconds < existing.seconds)

  const best: PersonalBest = isNewBest
    ? { moves, seconds, timestamp: new Date().toISOString() }
    : existing!

  if (isNewBest) {
    saveBestScores({ ...current, [difficulty]: best })
  }

  return { isNewBest, best }
}
