import { useCallback, useState } from 'react'

import { clearStoredSessions, readStoredSessions, saveStoredSessions } from '../services/storage'
import type { SessionRecord } from '../game/types'

export function useSessionHistory() {
  const [history, setHistory] = useState<SessionRecord[]>(() => readStoredSessions())
  const [storageError, setStorageError] = useState<string | null>(null)

  const appendSession = useCallback((session: SessionRecord) => {
    const nextList = [session, ...readStoredSessions()].slice(0, 100)
    const persisted = saveStoredSessions(nextList)

    if (persisted) {
      setHistory(nextList)
      setStorageError(null)
      return true
    }

    setStorageError('Storage is unavailable. The game will continue without saving session history.')
    return false
  }, [])

  const clearHistory = useCallback(() => {
    const cleared = clearStoredSessions()
    if (cleared) {
      setHistory([])
      setStorageError(null)
      return true
    }

    setStorageError('The history could not be cleared, but the game remains playable.')
    return false
  }, [])

  return { history, storageError, appendSession, clearHistory }
}
