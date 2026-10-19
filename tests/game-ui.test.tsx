import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from '../src/App'
import { createDeck } from '../src/game/shuffle'

describe('memory game UI', () => {
  afterEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  it('matching cards remain matched and move count increments exactly once', async () => {
    const seed = 12345
    render(<App initialSeed={seed} />)
    const user = userEvent.setup()
    const deck = createDeck('easy', seed)

    // Find a true matching pair using the deterministic seed
    const firstCard = deck[0]
    const matchingCard = deck.find((c) => c.id !== firstCard.id && c.pairId === firstCard.pairId)!

    const firstBtn = document.querySelector(`[data-card-id="${firstCard.id}"]`) as HTMLButtonElement
    const matchBtn = document.querySelector(`[data-card-id="${matchingCard.id}"]`) as HTMLButtonElement

    expect(screen.getByTestId('moves-value')).toHaveTextContent('0')

    await user.click(firstBtn)
    expect(screen.getByTestId('moves-value')).toHaveTextContent('0')

    await user.click(matchBtn)
    // Exactly 1 move completed
    expect(screen.getByTestId('moves-value')).toHaveTextContent('1')

    // Both cards remain matched and revealed
    expect(firstBtn.classList.contains('matched')).toBe(true)
    expect(matchBtn.classList.contains('matched')).toBe(true)
  })

  it('mismatched cards are hidden after the configured 450ms delay', () => {
    vi.useFakeTimers()
    const seed = 42
    render(<App initialSeed={seed} />)
    const deck = createDeck('easy', seed)
    const firstCard = deck[0]
    const secondCard = deck.find((card) => card.pairId !== firstCard.pairId) ?? deck[1]

    act(() => {
      fireEvent.click(document.querySelector(`[data-card-id="${firstCard.id}"]`) as HTMLButtonElement)
      fireEvent.click(document.querySelector(`[data-card-id="${secondCard.id}"]`) as HTMLButtonElement)
    })

    // After 2 mismatched clicks, move count increments to 1
    expect(screen.getByTestId('moves-value')).toHaveTextContent('1')

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(document.querySelectorAll('.memory-card.flipped')).toHaveLength(0)
  })

  it('repeated clicks on the same card do not increment moves', async () => {
    const seed = 999
    render(<App initialSeed={seed} />)
    const user = userEvent.setup()
    const cards = document.querySelectorAll('[data-card-id]')
    const card = cards[0] as HTMLButtonElement

    await user.click(card)
    expect(screen.getByTestId('moves-value')).toHaveTextContent('0')

    await user.click(card)
    expect(screen.getByTestId('moves-value')).toHaveTextContent('0')
  })

  it('clicking an already matched card does not increment the move count', async () => {
    const seed = 54321
    render(<App initialSeed={seed} />)
    const user = userEvent.setup()
    const deck = createDeck('easy', seed)

    const firstCard = deck[0]
    const matchingCard = deck.find((c) => c.id !== firstCard.id && c.pairId === firstCard.pairId)!

    const firstBtn = document.querySelector(`[data-card-id="${firstCard.id}"]`) as HTMLButtonElement
    const matchBtn = document.querySelector(`[data-card-id="${matchingCard.id}"]`) as HTMLButtonElement

    await user.click(firstBtn)
    await user.click(matchBtn)

    expect(screen.getByTestId('moves-value')).toHaveTextContent('1')

    // Click the matched card again
    await user.click(firstBtn)
    expect(screen.getByTestId('moves-value')).toHaveTextContent('1')
  })

  it('restarting during mismatch delay clears old timeout and does not corrupt new game', () => {
    vi.useFakeTimers()
    const seed = 777
    render(<App initialSeed={seed} />)
    const deck = createDeck('easy', seed)
    const firstCard = deck[0]
    const secondCard = deck.find((c) => c.pairId !== firstCard.pairId)!

    const firstBtn = document.querySelector(`[data-card-id="${firstCard.id}"]`) as HTMLButtonElement
    const secondBtn = document.querySelector(`[data-card-id="${secondCard.id}"]`) as HTMLButtonElement

    act(() => {
      fireEvent.click(firstBtn)
      fireEvent.click(secondBtn)
    })

    // Cards are visible pending mismatch timeout
    expect(firstBtn.classList.contains('flipped')).toBe(true)

    // Click restart button before the 450ms timeout fires
    const restartBtn = screen.getByRole('button', { name: /restart/i })
    act(() => {
      fireEvent.click(restartBtn)
    })

    // Advance time past the original 450ms delay
    act(() => {
      vi.advanceTimersByTime(600)
    })

    // Moves should be 0 on the fresh round
    expect(screen.getByTestId('moves-value')).toHaveTextContent('0')
    expect(document.querySelectorAll('.memory-card.flipped')).toHaveLength(0)
  })
})
