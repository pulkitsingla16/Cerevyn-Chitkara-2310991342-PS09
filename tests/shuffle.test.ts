import { describe, expect, it } from 'vitest'

import { createDeck, getPairCount, getTotalCards } from '../src/game/shuffle'

describe('shuffle and deck generation', () => {
  it('Easy generates exactly 16 cards and eight unique pairs', () => {
    const deck = createDeck('easy')

    expect(deck).toHaveLength(16)
    expect(getTotalCards('easy')).toBe(16)
    expect(getPairCount('easy')).toBe(8)
    expect(new Set(deck.map((card) => card.pairId)).size).toBe(8)
  })

  it('Hard generates exactly 24 cards and 12 unique pairs', () => {
    const deck = createDeck('hard')

    expect(deck).toHaveLength(24)
    expect(getTotalCards('hard')).toBe(24)
    expect(getPairCount('hard')).toBe(12)
    expect(new Set(deck.map((card) => card.pairId)).size).toBe(12)
  })

  it('Every pair contains exactly two cards with the same pair ID', () => {
    const deck = createDeck('hard')
    const counts = new Map<string, number>()

    for (const card of deck) {
      counts.set(card.pairId, (counts.get(card.pairId) ?? 0) + 1)
    }

    for (const value of counts.values()) {
      expect(value).toBe(2)
    }
  })

  it('The same seed produces the same deck', () => {
    const first = createDeck('easy', 42)
    const second = createDeck('easy', 42)

    expect(first).toEqual(second)
  })

  it('Different seeds can produce different shuffles', () => {
    const first = createDeck('easy', 1)
    const second = createDeck('easy', 2)

    expect(first).not.toEqual(second)
  })
})
