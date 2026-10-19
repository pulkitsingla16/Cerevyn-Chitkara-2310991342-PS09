import { useCallback, useEffect, useState } from 'react'

import { clearStoredSessions, readStoredSessions, saveStoredSessions } from '../services/storage'
import type { SessionRecord } from '../game/types'

const isBrowser = typeof window !== 'undefined'
const isLocal = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
const isGitHubPages = isBrowser && window.location.hostname.includes('github.io')

// Use local analytics on GitHub Pages; otherwise use local or cloud server endpoint
const API_BASE = isGitHubPages
  ? null
  : (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ||
    (isLocal
      ? 'http://localhost:3001/api/game'
      : 'https://cerevyn-memorymatch-2310991342-ajfmebfjcchrbhdx.indiasouthcentral-01.azurewebsites.net/api/game')

export function useSessionHistory() {
  const [history, setHistory] = useState<SessionRecord[]>(() => readStoredSessions())
  const [storageError, setStorageError] = useState<string | null>(null)
  const [serverOnline, setServerOnline] = useState(false)

  // Verify server health non-intrusively without altering private browser history
  useEffect(() => {
    if (!API_BASE) return

    let isMounted = true
    const healthUrl = API_BASE.replace(/\/api\/game\/?$/, '') + '/api/health'

    fetch(healthUrl, { signal: AbortSignal.timeout(3000) })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.status === 'ok') {
          setServerOnline(true)
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
    } else {
      setStorageError('Unable to save session to browser storage (quota exceeded or storage disabled).')
    }

    // Optional telemetry broadcast (non-identifying aggregate metrics)
    if (API_BASE) {
      fetch(`${API_BASE}/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
        signal: AbortSignal.timeout(3000),
      })
        .then((res) => {
          if (res.ok) setServerOnline(true)
        })
        .catch(() => {
          setServerOnline(false)
        })
    }

    return persisted
  }, [])

  const clearHistory = useCallback(() => {
    const cleared = clearStoredSessions()
    if (cleared) {
      setHistory([])
      setStorageError(null)
      return true
    } else {
      setStorageError('Failed to clear browser session history.')
      return false
    }
  }, [])

  return { history, storageError, serverOnline, appendSession, clearHistory }
}
