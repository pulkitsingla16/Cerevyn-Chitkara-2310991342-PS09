import { getDifficultyLabel } from '../game/config'
import type { SessionRecord } from '../game/types'

interface SessionHistoryProps {
  history: SessionRecord[]
  storageError: string | null
  serverOnline?: boolean
  onClearHistory: () => void
  onOpenAnalytics?: () => void
}

export function SessionHistory({
  history,
  storageError,
  serverOnline = false,
  onClearHistory,
  onOpenAnalytics,
}: SessionHistoryProps) {
  return (
    <section className="panel history-panel">
      <div className="section-heading history-heading">
        <div className="history-title-group">
          <h2>Session history</h2>
          <span className={`sync-badge ${serverOnline ? 'online' : 'offline'}`} title={serverOnline ? 'Connected to persistent server database' : 'Client fallback mode'}>
            <span className="sync-dot" />
            {serverOnline ? 'DB Synced' : 'Local'}
          </span>
        </div>
        <div className="history-actions">
          {onOpenAnalytics && (
            <button type="button" className="analytics-trigger-btn" onClick={onOpenAnalytics} title="View global backend analytics">
              📊 Analytics
            </button>
          )}
          <button type="button" className="secondary-button" onClick={onClearHistory}>
            Clear
          </button>
        </div>
      </div>

      {storageError ? <p className="storage-warning">{storageError}</p> : null}

      {history.length === 0 ? (
        <p className="empty-state">No completed rounds yet. Finish a round to store the result.</p>
      ) : (
        <ul className="history-list">
          {history.map((session) => (
            <li key={session.id} className="history-item">
              <div>
                <strong>{getDifficultyLabel(session.difficulty)}</strong>
                <span>{new Date(session.timestamp).toLocaleDateString()}</span>
              </div>
              <div>
                <span>{session.moves} moves</span>
                <span>{session.completedPairs} pairs</span>
                <span>{session.completionSeconds}s</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
