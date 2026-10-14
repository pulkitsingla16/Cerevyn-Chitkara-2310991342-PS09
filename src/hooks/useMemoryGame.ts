import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { DIFFICULTY_CONFIG, MISMATCH_DELAY_MS } from '../game/config'
import { decideNextDifficulty } from '../game/difficulty'
import { createDeck } from '../game/shuffle'
import type {
  Difficulty,
  DifficultyDecision,
  MemoryCard,
  PersonalBest,
  RoundStatus,
  SessionRecord,
} from '../game/types'
import { readBestScores, updateBestScore } from '../services/storage'
import { sound } from '../utils/audio'
import { useSessionHistory } from './useSessionHistory'

function createRandomSeed(): number {
  if (globalThis.crypto && 'getRandomValues' in globalThis.crypto) {
    return globalThis.crypto.getRandomValues(new Uint32Array(1))[0] ?? 1
  }

  return 1
}

const buildSessionRecord = (
  difficulty: Difficulty,
  moves: number,
  completedPairs: number,
  elapsedSeconds: number,
  seed?: number,
): SessionRecord => ({
  id: `session-${crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`}`,
  difficulty,
  moves,
  completedPairs,
  completionSeconds: Number(elapsedSeconds.toFixed(2)),
  status: 'completed',
  seed,
  timestamp: new Date().toISOString(),
})

export function useMemoryGame(initialDifficulty: Difficulty = 'easy', initialSeed?: number) {
  const [difficulty, setDifficulty] = useState<Difficulty>(initialDifficulty)
  const [roundSeed, setRoundSeed] = useState<number>(() => initialSeed ?? createRandomSeed())
  const [deck, setDeck] = useState<MemoryCard[]>(() =>
    createDeck(initialDifficulty, initialSeed ?? createRandomSeed()),
  )
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [matchedIds, setMatchedIds] = useState<string[]>([])
  const [moves, setMoves] = useState(0)
  const [streak, setStreak] = useState(0)
  const [elapsedMs, setElapsedMs] = useState(0)
  const [status, setStatus] = useState<RoundStatus>('idle')
  const [completionSeconds, setCompletionSeconds] = useState<number | null>(null)
  const [lastDecision, setLastDecision] = useState<DifficultyDecision | null>(null)
  const [isNewBest, setIsNewBest] = useState(false)
  const [bestScore, setBestScore] = useState<PersonalBest | null>(() => {
    const scores = readBestScores()
    return scores[initialDifficulty] ?? null
  })
  const [isPreviewing] = useState<boolean>(false)
  const [showReadyBanner, setShowReadyBanner] = useState<boolean>(() => {
    return import.meta.env.MODE !== 'test'
  })
  const [soundEnabled, setSoundEnabled] = useState(() => sound.isEnabled())

  const streakRef = useRef(0)
  const deckRef = useRef(deck)
  const selectedRef = useRef<string[]>([])
  const matchedRef = useRef<string[]>([])
  const movesRef = useRef(0)
  const timeoutRef = useRef<number | null>(null)
  const timerRef = useRef<number | null>(null)
  const startedAtRef = useRef<number | null>(null)
  const mismatchEpochRef = useRef(0)
  const lockRef = useRef(false)
  const { history, storageError, serverOnline, appendSession, clearHistory } = useSessionHistory()

  // Ready banner flash on round start
  useEffect(() => {
    if (import.meta.env.MODE === 'test') {
      return
    }

    const showTimer = window.setTimeout(() => {
      setShowReadyBanner(true)
    }, 10)

    const hideTimer = window.setTimeout(() => {
      setShowReadyBanner(false)
    }, 1300)

    return () => {
      window.clearTimeout(showTimer)
      window.clearTimeout(hideTimer)
    }
  }, [roundSeed])

  useEffect(() => {
    deckRef.current = deck
  }, [deck])

  useEffect(() => {
    selectedRef.current = selectedIds
  }, [selectedIds])

  useEffect(() => {
    matchedRef.current = matchedIds
  }, [matchedIds])

  useEffect(() => {
    movesRef.current = moves
  }, [moves])

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current)
      }
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current)
      }
    }
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const clearMismatchTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    mismatchEpochRef.current += 1
    lockRef.current = false
  }, [])

  const resetRound = useCallback(
    (nextDifficulty: Difficulty = difficulty) => {
      clearMismatchTimeout()
      stopTimer()
      streakRef.current = 0
      setStreak(0)
      startedAtRef.current = null
      setStatus('idle')
      setElapsedMs(0)
      setCompletionSeconds(null)
      setSelectedIds([])
      setMatchedIds([])
      setMoves(0)
      setIsNewBest(false)
      movesRef.current = 0
      selectedRef.current = []
      matchedRef.current = []
      const freshSeed = initialSeed ?? createRandomSeed()
      const freshDeck = createDeck(nextDifficulty, freshSeed)
      setRoundSeed(freshSeed)
      setDeck(freshDeck)
      deckRef.current = freshDeck
      const scores = readBestScores()
      setBestScore(scores[nextDifficulty] ?? null)
    },
    [clearMismatchTimeout, difficulty, initialSeed, stopTimer],
  )

  const beginTimer = useCallback(() => {
    if (startedAtRef.current !== null) {
      return
    }

    const startPoint = performance.now()
    startedAtRef.current = startPoint
    setStatus('playing')

    timerRef.current = window.setInterval(() => {
      if (startedAtRef.current === null) {
        return
      }
      setElapsedMs(performance.now() - startedAtRef.current)
    }, 100)
  }, [])

  const performRoundCompletion = useCallback(
    (finalMoves: number) => {
      stopTimer()
      const finalSeconds = Number(
        ((performance.now() - (startedAtRef.current ?? performance.now())) / 1000).toFixed(2),
      )
      setCompletionSeconds(finalSeconds)
      setStatus('won')
      setElapsedMs(finalSeconds * 1000)

      const summary = {
        moves: finalMoves,
        elapsedSeconds: finalSeconds,
        difficulty,
        completedPairs: matchedRef.current.length / 2,
      }

      const decision = decideNextDifficulty(difficulty, summary)
      setLastDecision(decision)

      const { isNewBest: newBest, best } = updateBestScore(difficulty, finalMoves, finalSeconds)
      setIsNewBest(newBest)
      setBestScore(best)

      const record: SessionRecord = buildSessionRecord(
        difficulty,
        finalMoves,
        summary.completedPairs,
        finalSeconds,
        roundSeed,
      )
      appendSession(record)
    },
    [appendSession, difficulty, roundSeed, stopTimer],
  )

  const handleCardClick = useCallback(
    (cardId: string) => {
      if (lockRef.current || status === 'won') {
        return
      }

      const currentCard = deckRef.current.find((card) => card.id === cardId)
      if (!currentCard) {
        return
      }

      if (selectedRef.current.includes(cardId) || matchedRef.current.includes(cardId)) {
        return
      }

      beginTimer()
      sound.playFlip()

      const nextSelected = [...selectedRef.current, cardId]
      selectedRef.current = nextSelected
      setSelectedIds(nextSelected)

      if (nextSelected.length < 2) {
        return
      }

      const [firstId, secondId] = nextSelected
      const firstCard = deckRef.current.find((card) => card.id === firstId)
      const secondCard = deckRef.current.find((card) => card.id === secondId)

      if (!firstCard || !secondCard) {
        selectedRef.current = []
        setSelectedIds([])
        return
      }

      const nextMoveCount = movesRef.current + 1
      movesRef.current = nextMoveCount
      setMoves(nextMoveCount)

      if (firstCard.pairId === secondCard.pairId) {
        streakRef.current += 1
        setStreak(streakRef.current)
        if (streakRef.current >= 2) {
          sound.playCombo(streakRef.current)
        } else {
          sound.playMatch()
        }

        const nextMatched = [...matchedRef.current, firstId, secondId]
        matchedRef.current = nextMatched
        setMatchedIds(nextMatched)
        selectedRef.current = []
        setSelectedIds([])

        if (nextMatched.length === deckRef.current.length) {
          sound.playWin()
          performRoundCompletion(nextMoveCount)
        }
        return
      }

      streakRef.current = 0
      setStreak(0)
      sound.playMismatch()

      lockRef.current = true
      const mismatchToken = mismatchEpochRef.current + 1
      mismatchEpochRef.current = mismatchToken

      timeoutRef.current = window.setTimeout(() => {
        if (mismatchEpochRef.current !== mismatchToken) {
          return
        }

        selectedRef.current = []
        setSelectedIds([])
        lockRef.current = false
        timeoutRef.current = null
      }, MISMATCH_DELAY_MS)
    },
    [beginTimer, performRoundCompletion, status],
  )

  const difficultyConfig = useMemo(() => DIFFICULTY_CONFIG[difficulty], [difficulty])
  const currentNextDifficulty = lastDecision?.nextDifficulty ?? difficulty

  const startNextRound = useCallback(() => {
    const targetDifficulty = lastDecision?.nextDifficulty ?? difficulty
    setDifficulty(targetDifficulty)
    resetRound(targetDifficulty)
  }, [difficulty, lastDecision, resetRound])

  const restartRound = useCallback(() => {
    resetRound(difficulty)
  }, [difficulty, resetRound])

  return {
    deck,
    difficulty,
    difficultyConfig,
    selectedIds,
    matchedIds,
    moves,
    streak,
    showReadyBanner,
    elapsedMs,
    status,
    completionSeconds,
    lastDecision,
    nextDifficulty: currentNextDifficulty,
    roundSeed,
    isNewBest,
    bestScore,
    isPreviewing,
    soundEnabled,
    toggleSound: () => setSoundEnabled(sound.toggle()),
    onCardClick: handleCardClick,
    restartRound,
    startNextRound,
    storageError,
    serverOnline,
    history,
    clearHistory,
  }
}
