import { useState, useEffect } from 'react'
import { BarChart3, Database, X, RefreshCw, Trophy, HardDrive } from 'lucide-react'
import { readStoredSessions } from '../services/storage'

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

function computeLocalAnalytics(): AnalyticsData {
  const localSessions = readStoredSessions()
  const completed = localSessions.filter((s) => s.status === 'completed')
  const totalRounds = completed.length
  const totalMoves = completed.reduce((acc, curr) => acc + curr.moves, 0)
  const totalSeconds = completed.reduce((acc, curr) => acc + curr.completionSeconds, 0)

  return {
    success: true,
    totalRounds,
    averageMovesOverall: totalRounds > 0 ? Number((totalMoves / totalRounds).toFixed(1)) : 0,
    averageSecondsOverall: totalRounds > 0 ? Number((totalSeconds / totalRounds).toFixed(1)) : 0,
    distribution: {
      easy: completed.filter((s) => s.difficulty === 'easy').length,
      medium: completed.filter((s) => s.difficulty === 'medium').length,
      hard: completed.filter((s) => s.difficulty === 'hard').length,
    },
    topPerformers: completed
      .slice()
      .sort((a, b) => a.moves - b.moves || a.completionSeconds - b.completionSeconds)
      .slice(0, 5),
  }
}

const isBrowser = typeof window !== 'undefined'
const isGitHubPages = isBrowser && window.location.hostname.includes('github.io')

export function AnalyticsModal({ isOpen, onClose }: AnalyticsModalProps) {
  const [data, setData] = useState<AnalyticsData | null>(() => (isGitHubPages ? computeLocalAnalytics() : null))
  const [source, setSource] = useState<'server' | 'local'>('local')
  const loading = isOpen && data === null

  useEffect(() => {
    if (!isOpen || isGitHubPages) return

    let cancelled = false

    const isLocal = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    const apiUrl = (import.meta as unknown as { env?: { VITE_API_URL?: string } }).env?.VITE_API_URL ||
      (isLocal
        ? 'http://localhost:3001/api/game/analytics'
        : 'https://cerevyn-memorymatch-2310991342-ajfmebfjcchrbhdx.indiasouthcentral-01.azurewebsites.net/api/game/analytics')

    fetch(apiUrl, { signal: AbortSignal.timeout(3000) })
      .then((res) => {
        if (!res.ok) throw new Error('Server returned non-200')
        return res.json()
      })
      .then((json: AnalyticsData) => {
        if (!cancelled && json.success) {
          setData(json)
          setSource('server')
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Graceful fallback to client localStorage data
          setData(computeLocalAnalytics())
          setSource('local')
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
            <h3>Performance Telemetry & Analytics</h3>
          </div>
          <button type="button" className="close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <p className="analytics-subtitle">
          Real-time performance metrics aggregated across completed memory game rounds.
        </p>

        <div style={{ margin: '8px 0 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
          {source === 'server' ? (
            <span style={{ color: '#10b981', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
              <Database size={14} /> Mode: Live Server Database Connected
            </span>
          ) : (
            <span style={{ color: '#00e5ff', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(0, 229, 255, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
              <HardDrive size={14} /> Mode: Client Local Storage (Static Demo Fallback)
            </span>
          )}
        </div>

        {loading ? (
          <div className="analytics-loading">
            <RefreshCw size={24} className="spin" />
            <span>Calculating metrics...</span>
          </div>
        ) : data && data.totalRounds === 0 ? (
          <div className="analytics-offline" style={{ textAlign: 'center', padding: '24px 12px' }}>
            <Database size={32} />
            <p>No completed rounds recorded yet.</p>
            <span>Play and complete at least one round to see your analytics and leaderboard!</span>
          </div>
        ) : data ? (
          <div className="analytics-body">
            <div className="analytics-metrics-grid">
              <div className="metric-card">
                <span>Total Rounds</span>
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
                  <Trophy size={14} /> Session Leaderboard (Top 5)
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
