import { useMemo, useState } from 'react'
import { AnalyticsModal } from './components/AnalyticsModal'
import { ComboBanner } from './components/ComboBanner'
import { Confetti } from './components/Confetti'
import { ConfirmDialog } from './components/ConfirmDialog'
import { DifficultyNotice } from './components/DifficultyNotice'
import { GameBoard } from './components/GameBoard'
import { GameStats } from './components/GameStats'
import { Header } from './components/Header'
import { Instructions } from './components/Instructions'
import { RulesModal } from './components/RulesModal'
import { SessionHistory } from './components/SessionHistory'
import { WinPanel } from './components/WinPanel'
import type { Difficulty } from './game/types'
import { useMemoryGame } from './hooks/useMemoryGame'
import './App.css'

interface AppProps {
  initialDifficulty?: Difficulty
  initialSeed?: number
}

function App({ initialDifficulty = 'easy', initialSeed }: AppProps) {
  const {
    deck,
    difficulty,
    selectedIds,
    matchedIds,
    moves,
    streak,
    showReadyBanner,
    elapsedMs,
    status,
    completionSeconds,
    lastDecision,
    nextDifficulty,
    isNewBest,
    bestScore,
    isPreviewing,
    soundEnabled,
    toggleSound,
    onCardClick,
    restartRound,
    startNextRound,
    history,
    clearHistory,
    storageError,
    serverOnline,
  } = useMemoryGame(initialDifficulty, initialSeed)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [analyticsOpen, setAnalyticsOpen] = useState(false)
  const [rulesOpen, setRulesOpen] = useState(false)

  const boardLocked = selectedIds.length >= 2 || status === 'won'
  const totalPairs = useMemo(() => deck.length / 2, [deck.length])

  const handleClearHistory = () => {
    setConfirmOpen(true)
  }

  const confirmClearHistory = () => {
    clearHistory()
    setConfirmOpen(false)
  }

  return (
    <div className="app-shell">
      <Confetti active={status === 'won'} />
      <ComboBanner
        streak={streak}
        showReadyBanner={showReadyBanner}
        difficultyLabel={difficulty}
      />

      <Header
        difficulty={difficulty}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        onOpenRules={() => setRulesOpen(true)}
        onRestart={restartRound}
      />

      <main className="dashboard">
        <div className="main-column">
          <GameStats
            moves={moves}
            completedPairs={matchedIds.length / 2}
            totalPairs={totalPairs}
            elapsedMs={elapsedMs}
            difficulty={difficulty}
            status={status}
            completionSeconds={completionSeconds}
            bestScore={bestScore}
          />

          <GameBoard
            cards={deck}
            difficulty={difficulty}
            selectedIds={selectedIds}
            matchedIds={matchedIds}
            lockBoard={boardLocked}
            isPreviewing={isPreviewing}
            onClick={onCardClick}
          />

          <DifficultyNotice decision={lastDecision} currentDifficulty={difficulty} />

          {status === 'won' ? (
            <WinPanel
              moves={moves}
              completionSeconds={completionSeconds}
              completedPairs={matchedIds.length / 2}
              totalPairs={totalPairs}
              previousDifficulty={difficulty}
              nextDifficulty={nextDifficulty}
              explanation={lastDecision?.reason ?? 'The next round will use the current difficulty.'}
              isNewBest={isNewBest}
              onReplay={restartRound}
              onNext={startNextRound}
            />
          ) : null}
        </div>

        <aside className="side-column">
          <Instructions />
          <SessionHistory
            history={history}
            storageError={storageError}
            serverOnline={serverOnline}
            onClearHistory={handleClearHistory}
            onOpenAnalytics={() => setAnalyticsOpen(true)}
          />
        </aside>
      </main>

      <AnalyticsModal isOpen={analyticsOpen} onClose={() => setAnalyticsOpen(false)} />
      <RulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Clear session history"
        message="This removes the saved anonymous round results from browser storage and server database. Continue?"
        onConfirm={confirmClearHistory}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

export default App
