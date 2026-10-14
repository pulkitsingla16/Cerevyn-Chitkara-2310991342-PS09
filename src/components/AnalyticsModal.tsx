import { useState, useEffect } from 'react'
import { BarChart3, Database, X, RefreshCw, Trophy } from 'lucide-react'

interface AnalyticsData {
  success: boolean
  totalRounds: number
  averageMovesOverall: number
  averageSecondsOverall: number
  distribution: {
    easy: number
    medium: number
    hard: number
  }
  topPerformers: Array<{
    id: string
    difficulty: string
    moves: number
    completionSeconds: number
    timestamp: string
  }>
}

interface AnalyticsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AnalyticsModal({ isOpen, onClose }: AnalyticsModalProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const loading = isOpen && !data && !error

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false

    fetch('http://localhost:3001/api/game/analytics')
      .then((res) => {
        if (!res.ok) throw new Error('Backend server is offline')
        return res.json()
      })
      .then((json: AnalyticsData) => {
        if (!cancelled) {
          setData(json)
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : 'Could not connect to backend server'
          setError(message)
        }
      })

    return () => {
      cancelled = true
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true">
      <div className="dialog-panel analytics-panel">
        <div className="analytics-modal-header">
          <div className="analytics-title">
            <BarChart3 size={20} className="analytics-icon" />
            <h3>Global Server Telemetry & Analytics</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <p className="analytics-subtitle">
          Real-time metrics aggregated across all game sessions stored in the persistent database.
        </p>

        {loading ? (
          <div className="analytics-loading">
            <RefreshCw size={24} className="spin" />
            <span>Fetching live server analytics...</span>
          </div>
        ) : error ? (
          <div className="analytics-offline">
            <Database size={32} />
            <p>Backend database offline (run <code>npm run server</code> to start).</p>
            <span>The game is currently using browser client storage as a fallback.</span>
          </div>
        ) : data ? (
          <div className="analytics-body">
            <div className="analytics-metrics-grid">
              <div className="metric-card">
                <span>Total Server Rounds</span>
                <strong>{data.totalRounds}</strong>
              </div>
              <div className="metric-card">
                <span>Average Moves</span>
                <strong>{data.averageMovesOverall}</strong>
              </div>
              <div className="metric-card">
                <span>Average Time</span>
                <strong>{data.averageSecondsOverall}s</strong>
              </div>
            </div>

            <div className="analytics-section">
              <h4>Rounds by Difficulty</h4>
              <div className="dist-bars">
                <div className="dist-item">
                  <div className="dist-label">
                    <span>Easy</span>
                    <strong>{data.distribution.easy}</strong>
                  </div>
                  <div className="dist-track">
                    <div
                      className="dist-fill easy"
                      style={{
                        width: `${data.totalRounds ? (data.distribution.easy / data.totalRounds) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="dist-item">
                  <div className="dist-label">
                    <span>Medium</span>
                    <strong>{data.distribution.medium}</strong>
                  </div>
                  <div className="dist-track">
                    <div
                      className="dist-fill medium"
                      style={{
                        width: `${data.totalRounds ? (data.distribution.medium / data.totalRounds) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="dist-item">
                  <div className="dist-label">
                    <span>Hard</span>
                    <strong>{data.distribution.hard}</strong>
                  </div>
                  <div className="dist-track">
                    <div
                      className="dist-fill hard"
                      style={{
                        width: `${data.totalRounds ? (data.distribution.hard / data.totalRounds) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {data.topPerformers.length > 0 && (
              <div className="analytics-section">
                <h4>
                  <Trophy size={14} /> Server Leaderboard
                </h4>
                <ul className="leaderboard-list">
                  {data.topPerformers.map((p, idx) => (
                    <li key={p.id}>
                      <span className="rank">#{idx + 1}</span>
                      <span className="lead-diff">{p.difficulty.toUpperCase()}</span>
                      <span className="lead-moves">{p.moves} moves</span>
                      <span className="lead-time">{p.completionSeconds.toFixed(1)}s</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : null}

        <div className="analytics-footer">
          <button type="button" className="secondary-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
