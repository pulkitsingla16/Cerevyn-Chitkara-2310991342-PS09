import { useCallback, useEffect, useState } from 'react'

import { clearStoredSessions, readStoredSessions, saveStoredSessions } from '../services/storage'
import type { SessionRecord } from '../game/types'

const isBrowser = typeof window !== 'undefined'
const isLocal = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const API_BASE = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ||
  (isLocal
    ? 'http://localhost:3001/api/game'
    : 'https://cerevyn-memorymatch-2310991342-ajfmebfjcchrbhdx.indiasouthcentral-01.azurewebsites.net/api/game')

export function useSessionHistory() {
  const [history, setHistory] = useState<SessionRecord[]>(() => readStoredSessions())
  const [storageError, setStorageError] = useState<string | null>(null)
  const [serverOnline, setServerOnline] = useState(false)

  // On mount, sync with backend database if available
  useEffect(() => {
    let isMounted = true
    fetch(`${API_BASE}/sessions`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.sessions)) {
          setServerOnline(true)
          if (data.sessions.length > 0) {
            setHistory(data.sessions)
            saveStoredSessions(data.sessions)
          }
        }
      })
      .catch(() => {
        if (isMounted) setServerOnline(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const appendSession = useCallback((session: SessionRecord) => {
    const nextList = [session, ...readStoredSessions()].slice(0, 100)
    const persisted = saveStoredSessions(nextList)

    if (persisted) {
      setHistory(nextList)
      setStorageError(null)
    }

    // Attempt to persist to server database
    fetch(`${API_BASE}/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    })
      .then((res) => {
        if (res.ok) setServerOnline(true)
      })
      .catch(() => {
        setServerOnline(false)
      })

    return true
  }, [])

  const clearHistory = useCallback(() => {
    const cleared = clearStoredSessions()
    if (cleared) {
      setHistory([])
      setStorageError(null)
    }

    fetch(`${API_BASE}/sessions`, { method: 'DELETE' }).catch(() => {})

    return true
  }, [])

  return { history, storageError, serverOnline, appendSession, clearHistory }
}
