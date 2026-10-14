import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import App from '../src/App'

describe('timer and restart safety', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    localStorage.clear()
  })

  it('starts on the first valid selection and resets on restart', () => {
    render(<App />)

    const cards = document.querySelectorAll('[data-card-id]')
    act(() => {
      fireEvent.click(cards[0] as HTMLButtonElement)
      vi.advanceTimersByTime(1200)
    })

    const activeTimeBox = screen.getByText('Active time').closest('.stat-box')
    expect(activeTimeBox).not.toBeNull()
    expect(activeTimeBox?.textContent).toContain('1.2')

    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /restart round/i }))
    })
    const resetBox = screen.getByText('Active time').closest('.stat-box')
    expect(resetBox?.textContent).toContain('0.0')
  })
})
