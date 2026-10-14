import { useMemo, useState } from 'react'

import { Confetti } from './components/Confetti'
import { ConfirmDialog } from './components/ConfirmDialog'
import { DifficultyNotice } from './components/DifficultyNotice'
import { GameBoard } from './components/GameBoard'
import { GameStats } from './components/GameStats'
import { Header } from './components/Header'
import { Instructions } from './components/Instructions'
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
    elapsedMs,
    status,
    completionSeconds,
    lastDecision,
    nextDifficulty,
    isNewBest,
    bestScore,
    isPreviewing,
    onCardClick,
    restartRound,
    startNextRound,
    history,
    clearHistory,
    storageError,
  } = useMemoryGame(initialDifficulty, initialSeed)
  const [confirmOpen, setConfirmOpen] = useState(false)

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
      <Header difficulty={difficulty} onRestart={restartRound} />

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

          <DifficultyNotice decision={lastDecision} currentDifficulty={difficulty} />

          <GameBoard
            cards={deck}
            difficulty={difficulty}
            selectedIds={selectedIds}
            matchedIds={matchedIds}
            lockBoard={boardLocked}
            isPreviewing={isPreviewing}
            onClick={onCardClick}
          />

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
          <SessionHistory history={history} storageError={storageError} onClearHistory={handleClearHistory} />
        </aside>
      </main>

      <ConfirmDialog
        isOpen={confirmOpen}
        title="Clear session history"
        message="This removes the saved anonymous round results from browser storage. Continue?"
        onConfirm={confirmClearHistory}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}

export default App
