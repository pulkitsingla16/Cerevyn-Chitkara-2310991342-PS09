import { describe, expect, it } from 'vitest'

import { decideNextDifficulty } from '../src/game/difficulty'

describe('adaptive difficulty', () => {
  it('Easy promotes to Medium at the exact configured boundary', () => {
    expect(decideNextDifficulty('easy', { moves: 18, elapsedSeconds: 60 })).toMatchObject({
      nextDifficulty: 'medium',
    })
  })

  it('Easy does not promote if only one threshold is met', () => {
    expect(decideNextDifficulty('easy', { moves: 18, elapsedSeconds: 61 })).toMatchObject({
      nextDifficulty: 'easy',
    })
  })

  it('Medium reduces to Easy when either reduction threshold is exceeded', () => {
    expect(decideNextDifficulty('medium', { moves: 29, elapsedSeconds: 70 })).toMatchObject({
      nextDifficulty: 'easy',
    })
    expect(decideNextDifficulty('medium', { moves: 28, elapsedSeconds: 101 })).toMatchObject({
      nextDifficulty: 'easy',
    })
  })

  it('Hard reduces to Medium when either reduction threshold is exceeded', () => {
    expect(decideNextDifficulty('hard', { moves: 36, elapsedSeconds: 70 })).toMatchObject({
      nextDifficulty: 'medium',
    })
    expect(decideNextDifficulty('hard', { moves: 35, elapsedSeconds: 151 })).toMatchObject({
      nextDifficulty: 'medium',
    })
  })

  it('Hard remains Hard at the defined inclusive boundaries', () => {
    expect(decideNextDifficulty('hard', { moves: 35, elapsedSeconds: 150 })).toMatchObject({
      nextDifficulty: 'hard',
    })
    expect(decideNextDifficulty('hard', { moves: 18, elapsedSeconds: 60 })).toMatchObject({
      nextDifficulty: 'hard',
    })
  })

  it('Medium promotes to Hard at the exact configured boundary', () => {
    expect(decideNextDifficulty('medium', { moves: 22, elapsedSeconds: 90 })).toMatchObject({
      nextDifficulty: 'hard',
    })
  })

  it('Incomplete rounds do not trigger difficulty adaptation', () => {
    expect(decideNextDifficulty('easy', null)).toMatchObject({
      nextDifficulty: 'easy',
    })
  })
})
