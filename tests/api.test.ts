import request from 'supertest'
import { describe, it, expect, beforeEach } from 'vitest'
import { app } from '../server/src/app'

describe('MemoryMatch Backend REST API', () => {
  beforeEach(async () => {
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

  it('POST /api/game/session saves a round to server database', async () => {
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

    const listRes = await request(app).get('/api/game/sessions')
    expect(listRes.status).toBe(200)
    expect(listRes.body.count).toBe(1)
    expect(listRes.body.sessions[0].id).toBe('test-session-123')
  })

  it('POST /api/game/session rejects invalid payload with 400', async () => {
    const badPayload = { id: 'incomplete-data' }
    const res = await request(app).post('/api/game/session').send(badPayload)
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
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
