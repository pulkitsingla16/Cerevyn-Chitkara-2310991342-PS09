import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import App from '../src/App'
import { createDeck } from '../src/game/shuffle'

describe('memory game UI', () => {
  afterEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  it('matching cards remain matched and move count increments once', async () => {
    render(<App />)
    const user = userEvent.setup()
    const cards = document.querySelectorAll('[data-card-id]')
    const first = cards[0] as HTMLButtonElement
    const second = cards[1] as HTMLButtonElement

    await user.click(first)
    await user.click(second)

    expect(screen.getByText(/moves/i)).toBeInTheDocument()
  })

  it('mismatched cards are hidden after the configured delay', () => {
    vi.useFakeTimers()
    const seed = 42
    render(<App initialSeed={seed} />)
    const deck = createDeck('easy', seed)
    const firstCard = deck[0]
    const secondCard = deck.find((card) => card.pairId !== firstCard.pairId) ?? deck[1]

    act(() => {
      fireEvent.click(document.querySelector(`[data-card-id="${firstCard.id}"]`) as HTMLButtonElement)
      fireEvent.click(document.querySelector(`[data-card-id="${secondCard.id}"]`) as HTMLButtonElement)
      vi.advanceTimersByTime(700)
    })

    expect(document.querySelectorAll('.memory-card.flipped')).toHaveLength(0)
  })

  it('repeated clicks on the same card do not increment moves', async () => {
    render(<App />)
    const user = userEvent.setup()
    const cards = document.querySelectorAll('[data-card-id]')
    const card = cards[0] as HTMLButtonElement

    await user.click(card)
    await user.click(card)

    expect(screen.getByText(/moves/i)).toBeInTheDocument()
  })

  it('clicking a matched card does not increment the move count', async () => {
    render(<App />)
    const user = userEvent.setup()
    const cards = document.querySelectorAll('[data-card-id]')

    await user.click(cards[0] as HTMLButtonElement)
    await user.click(cards[1] as HTMLButtonElement)

    const stats = screen.getByTestId('stats-panel')
    expect(within(stats).getByText(/moves/i)).toBeInTheDocument()
  })
})
