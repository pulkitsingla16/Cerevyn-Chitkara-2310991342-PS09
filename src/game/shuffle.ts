import { CARD_SYMBOLS, DIFFICULTY_CONFIG } from './config'
import type { Difficulty, GameCard, MemoryCard } from './types'

function createSeededRandom(seed: number): () => number {
  let value = seed >>> 0

  return () => {
    value = (value + 0x6d2b79f5) >>> 0
    let result = Math.imul(value ^ (value >>> 15), 1 | value)
    result = (result + Math.imul(result ^ (result >>> 7), 61 | result)) ^ result
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffleCards<T>(items: T[], seed?: number): T[] {
  const nextItems = [...items]
  const random = seed === undefined ? Math.random : createSeededRandom(seed)

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[nextItems[index], nextItems[swapIndex]] = [nextItems[swapIndex], nextItems[index]]
  }

  return nextItems
}

export function getPairCount(difficulty: Difficulty): number {
  return DIFFICULTY_CONFIG[difficulty].pairCount
}

export function getTotalCards(difficulty: Difficulty): number {
  return DIFFICULTY_CONFIG[difficulty].totalCards
}

export function createDeck(difficulty: Difficulty, seed?: number): MemoryCard[] {
  const config = DIFFICULTY_CONFIG[difficulty]
  const pairSymbols = CARD_SYMBOLS.slice(0, config.pairCount)

  const cards: GameCard[] = pairSymbols.flatMap((symbol, index) => {
    const pairId = `${difficulty}-pair-${index + 1}`

    return [
      { id: `${pairId}-a`, pairId, symbol },
      { id: `${pairId}-b`, pairId, symbol },
    ]
  })

  return shuffleCards(cards, seed).map((card) => ({
    ...card,
    isMatched: false,
  }))
}
