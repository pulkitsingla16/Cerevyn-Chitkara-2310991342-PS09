import request from 'supertest'
import { describe, it, expect, beforeEach } from 'vitest'
import { app } from '../server/src/app'

describe('MemoryMatch Backend REST API', () => {
  beforeEach(async () => {
    // Clear sessions in test environment
    await request(app).delete('/api/game/sessions')
  })

  it('GET /api/health returns system status and developer info', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
    expect(res.body.developer).toContain('Pulkit Singla')
  })

  it('GET /api/game/rules returns difficulty levels and adaptive rules', async () => {
    const res = await request(app).get('/api/game/rules')
    expect(res.status).toBe(200)
    expect(res.body.difficultyLevels).toEqual(['easy', 'medium', 'hard'])
    expect(res.body.adaptationThresholds).toHaveProperty('easyToMedium')
  })

  it('POST /api/game/session saves a round without storing or exposing client IP', async () => {
    const payload = {
      id: 'test-session-123',
      difficulty: 'easy',
      moves: 14,
      completedPairs: 8,
      completionSeconds: 42.5,
      status: 'completed',
    }

    const res = await request(app).post('/api/game/session').send(payload)
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.session).not.toHaveProperty('clientIp')

    const listRes = await request(app).get('/api/game/sessions')
    expect(listRes.status).toBe(200)
    expect(listRes.body.count).toBe(1)
    expect(listRes.body.sessions[0].id).toBe('test-session-123')
    expect(listRes.body.sessions[0]).not.toHaveProperty('clientIp')
  })

  it('POST /api/game/session rejects invalid difficulty, negative moves, or bad seconds with 400', async () => {
    // Invalid difficulty
    const badDiff = await request(app).post('/api/game/session').send({
      id: 'bad-1',
      difficulty: 'insane',
      moves: 10,
      completedPairs: 8,
      completionSeconds: 30,
    })
    expect(badDiff.status).toBe(400)
    expect(badDiff.body.success).toBe(false)

    // Negative moves
    const negMoves = await request(app).post('/api/game/session').send({
      id: 'bad-2',
      difficulty: 'easy',
      moves: -5,
      completedPairs: 8,
      completionSeconds: 30,
    })
    expect(negMoves.status).toBe(400)
    expect(negMoves.body.success).toBe(false)

    // Zero seconds
    const zeroSec = await request(app).post('/api/game/session').send({
      id: 'bad-3',
      difficulty: 'easy',
      moves: 10,
      completedPairs: 8,
      completionSeconds: 0,
    })
    expect(zeroSec.status).toBe(400)
    expect(zeroSec.body.success).toBe(false)
  })

  it('GET /api/game/analytics returns global telemetry and aggregate stats', async () => {
    await request(app).post('/api/game/session').send({
      id: 'session-1',
      difficulty: 'easy',
      moves: 12,
      completedPairs: 8,
      completionSeconds: 30,
      status: 'completed',
    })
    await request(app).post('/api/game/session').send({
      id: 'session-2',
      difficulty: 'medium',
      moves: 16,
      completedPairs: 10,
      completionSeconds: 40,
      status: 'completed',
    })

    const res = await request(app).get('/api/game/analytics')
    expect(res.status).toBe(200)
    expect(res.body.totalRounds).toBe(2)
    expect(res.body.averageMovesOverall).toBe(14)
    expect(res.body.distribution.easy).toBe(1)
    expect(res.body.distribution.medium).toBe(1)
  })
})
