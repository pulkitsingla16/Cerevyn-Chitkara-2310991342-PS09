import { afterEach, describe, expect, it } from 'vitest'

import {
  KNOWN_STORAGE_KEY,
  clearStoredSessions,
  readStoredSessions,
  saveStoredSessions,
} from '../src/services/storage'

describe('session storage', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('persists and reloads valid history records', () => {
    const sessions = [
      {
        id: 's-1',
        difficulty: 'easy',
        moves: 12,
        completedPairs: 8,
        completionSeconds: 42,
        status: 'completed',
        timestamp: '2026-10-01T00:00:00.000Z',
      },
    ]

    saveStoredSessions(sessions)
    expect(readStoredSessions()).toEqual(sessions)
  })

  it('malformed stored data does not crash and falls back safely', () => {
    localStorage.setItem(KNOWN_STORAGE_KEY, '{not valid json}')
    expect(() => readStoredSessions()).not.toThrow()
    expect(readStoredSessions()).toEqual([])
  })

  it('storage failures do not prevent gameplay', () => {
    const originalSetItem = Storage.prototype.setItem
    Storage.prototype.setItem = () => {
      throw new Error('quota exceeded')
    }

    expect(() => saveStoredSessions([{ id: 's-2', difficulty: 'easy', moves: 10, completedPairs: 8, completionSeconds: 30, status: 'completed', timestamp: '2026-10-01T00:00:00.000Z' }])).not.toThrow()
    expect(readStoredSessions()).toEqual([])

    Storage.prototype.setItem = originalSetItem
  })

  it('clearing history removes saved sessions after confirmation', () => {
    saveStoredSessions([
      { id: 's-3', difficulty: 'easy', moves: 12, completedPairs: 8, completionSeconds: 40, status: 'completed', timestamp: '2026-10-01T00:00:00.000Z' },
    ])

    expect(readStoredSessions()).toHaveLength(1)
    expect(clearStoredSessions()).toBe(true)
    expect(readStoredSessions()).toEqual([])
  })
})
