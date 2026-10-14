import { Sparkles, Trophy, Zap, Clock, ShieldCheck, X } from 'lucide-react'

interface RulesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RulesModal({ isOpen, onClose }: RulesModalProps) {
  if (!isOpen) return null

  return (
    <div className="dialog-overlay" role="dialog" aria-modal="true" aria-labelledby="rules-modal-title">
      <div className="dialog-panel rules-panel">
        <div className="rules-modal-header">
          <div className="rules-modal-title" id="rules-modal-title">
            <Sparkles size={22} className="rules-icon" />
            <h3>How to Play & Game Mechanics</h3>
          </div>
          <button type="button" className="close-button" onClick={onClose} aria-label="Close rules">
            <X size={20} />
          </button>
        </div>

        <div className="rules-content">
          <div className="rules-section">
            <h4><Zap size={16} /> Core Objective</h4>
            <p>
              Flip cards two at a time to find matching pairs. Complete the board using the fewest moves and in the fastest time!
            </p>
          </div>

          <div className="rules-grid">
            <div className="rule-card">
              <span className="rule-step">1</span>
              <h5>Click to Flip</h5>
              <p>Click any hidden card to reveal its symbol.</p>
            </div>
            <div className="rule-card">
              <span className="rule-step">2</span>
              <h5>Match Pairs</h5>
              <p>Find the identical match. Matching pairs stay locked face-up.</p>
            </div>
            <div className="rule-card">
              <span className="rule-step">3</span>
              <h5>Build Combos</h5>
              <p>Match cards consecutively to earn Combo multipliers and bonus score.</p>
            </div>
            <div className="rule-card">
              <span className="rule-step">4</span>
              <h5>Level Up</h5>
              <p>Beat the threshold to adaptively promote to larger boards (4×4 → 4×5 → 4×6)!</p>
            </div>
          </div>

          <div className="rules-section">
            <h4><Trophy size={16} /> Adaptive Progression Rules</h4>
            <div className="rules-table-wrapper">
              <table className="rules-table">
                <thead>
                  <tr>
                    <th>Transition</th>
                    <th>Required Performance</th>
                    <th>Next Board</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><span className="badge-level promo">Easy → Medium</span></td>
                    <td>Moves ≤ 18 <strong>and</strong> Time ≤ 60s</td>
                    <td>4×5 Grid (10 Pairs)</td>
                  </tr>
                  <tr>
                    <td><span className="badge-level promo">Medium → Hard</span></td>
                    <td>Moves ≤ 22 <strong>and</strong> Time ≤ 90s</td>
                    <td>4×6 Grid (12 Pairs)</td>
                  </tr>
                  <tr>
                    <td><span className="badge-level demo">Demotion</span></td>
                    <td>Excess moves or time limit reached</td>
                    <td>Drops back down 1 tier</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rules-section">
            <h4><Clock size={16} /> Performance Ranking</h4>
            <div className="rank-cards-row">
              <div className="rank-card rank-s">
                <span className="rank-letter">S</span>
                <span>⭐ ⭐ ⭐ Perfect</span>
                <small>Fewest moves & lightning speed</small>
              </div>
              <div className="rank-card rank-a">
                <span className="rank-letter">A</span>
                <span>⭐ ⭐ Great</span>
                <small>Well within target thresholds</small>
              </div>
              <div className="rank-card rank-b">
                <span className="rank-letter">B</span>
                <span>⭐ Good</span>
                <small>Completed the memory round</small>
              </div>
            </div>
          </div>

          <div className="rules-section footer-note">
            <ShieldCheck size={16} />
            <span>Deterministic Fisher-Yates PRNG ensures fair, testable shuffles every round.</span>
          </div>
        </div>

        <div className="dialog-actions">
          <button type="button" className="primary-button" onClick={onClose}>
            Got It, Let's Play!
          </button>
        </div>
      </div>
    </div>
  )
}
