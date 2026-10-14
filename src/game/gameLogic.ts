import { DIFFICULTY_CONFIG } from './config'
import type { Difficulty, MemoryCard } from './types'

export function countMatchedCards(cards: MemoryCard[]): number {
  return cards.filter((card) => card.isMatched).length
}

export function isBoardComplete(cards: MemoryCard[]): boolean {
  return cards.length > 0 && cards.every((card) => card.isMatched)
}

export function evaluateMatch(firstCard: MemoryCard, secondCard: MemoryCard): boolean {
  return firstCard.pairId === secondCard.pairId
}

export function getDeckSummary(difficulty: Difficulty): { pairCount: number; totalCards: number } {
  const config = DIFFICULTY_CONFIG[difficulty]
  return {
    pairCount: config.pairCount,
    totalCards: config.totalCards,
  }
}
