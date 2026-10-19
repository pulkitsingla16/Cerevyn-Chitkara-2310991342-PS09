import express, { Request, Response } from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_DIR = path.join(__dirname, '../../data')
const DB_FILE = path.join(DATA_DIR, 'sessions.json')

// Ensure database directory & file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf-8')
}

export interface SessionData {
  id: string
  difficulty: 'easy' | 'medium' | 'hard'
  moves: number
  completedPairs: number
  completionSeconds: number
  status: 'completed' | 'incomplete'
  seed?: number | string
  timestamp: string
}

function readSessions(): SessionData[] {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(raw) as SessionData[]
  } catch {
    return []
  }
}

function writeSessions(sessions: SessionData[]): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(sessions.slice(-500), null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to write sessions to file:', err)
  }
}

export const app = express()

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'MemoryMatch API',
    version: '2.0.0',
    developer: 'Pulkit Singla (2310991342)',
    timestamp: new Date().toISOString(),
  })
})

// Rules endpoint
app.get('/api/game/rules', (_req: Request, res: Response) => {
  res.json({
    difficultyLevels: ['easy', 'medium', 'hard'],
    boardSizes: {
      easy: '4x4 (8 pairs)',
      medium: '4x5 (10 pairs)',
      hard: '4x6 (12 pairs)',
    },
    adaptationThresholds: {
      easyToMedium: { maxMoves: 18, maxSeconds: 60 },
      mediumToHard: { maxMoves: 22, maxSeconds: 90 },
      mediumToEasy: { maxMoves: 28, maxSeconds: 100 },
      hardToMedium: { maxMoves: 35, maxSeconds: 150 },
    },
  })
})

// Get sessions history
app.get('/api/game/sessions', (_req: Request, res: Response) => {
  const sessions = readSessions()
  res.json({
    success: true,
    count: sessions.length,
    sessions,
  })
})

// Post new completed game session with strict validation & privacy protection
app.post('/api/game/session', (req: Request, res: Response) => {
  const body = req.body as Partial<SessionData>
  const allowedDifficulties = ['easy', 'medium', 'hard']

  if (
    !body.id ||
    typeof body.id !== 'string' ||
    body.id.length > 100 ||
    !body.difficulty ||
    !allowedDifficulties.includes(body.difficulty) ||
    typeof body.moves !== 'number' ||
    !Number.isInteger(body.moves) ||
    body.moves < 1 ||
    body.moves > 500 ||
    typeof body.completedPairs !== 'number' ||
    !Number.isInteger(body.completedPairs) ||
    body.completedPairs < 1 ||
    body.completedPairs > 20 ||
    typeof body.completionSeconds !== 'number' ||
    body.completionSeconds <= 0 ||
    body.completionSeconds > 3600
  ) {
    return res.status(400).json({
      success: false,
      error: 'Invalid session payload. Difficulty must be easy/medium/hard; moves and seconds must be positive numbers within valid ranges.',
    })
  }

  const session: SessionData = {
    id: String(body.id).slice(0, 100),
    difficulty: body.difficulty as 'easy' | 'medium' | 'hard',
    moves: body.moves,
    completedPairs: body.completedPairs,
    completionSeconds: Number(body.completionSeconds.toFixed(2)),
    status: body.status === 'incomplete' ? 'incomplete' : 'completed',
    seed: body.seed ? String(body.seed).slice(0, 50) : undefined,
    timestamp: typeof body.timestamp === 'string' ? body.timestamp : new Date().toISOString(),
  }

  const sessions = readSessions()
  sessions.unshift(session)
  writeSessions(sessions)

  return res.status(201).json({
    success: true,
    message: 'Session recorded successfully in server database',
    session,
  })
})

// Global telemetry & analytics endpoint
app.get('/api/game/analytics', (_req: Request, res: Response) => {
  const sessions = readSessions()
  const completed = sessions.filter((s) => s.status === 'completed')

  const totalRounds = completed.length
  const totalMoves = completed.reduce((acc, curr) => acc + curr.moves, 0)
  const totalSeconds = completed.reduce((acc, curr) => acc + curr.completionSeconds, 0)

  const byDifficulty = {
    easy: completed.filter((s) => s.difficulty === 'easy'),
    medium: completed.filter((s) => s.difficulty === 'medium'),
    hard: completed.filter((s) => s.difficulty === 'hard'),
  }

  const avgMoves = totalRounds > 0 ? Number((totalMoves / totalRounds).toFixed(1)) : 0
  const avgSeconds = totalRounds > 0 ? Number((totalSeconds / totalRounds).toFixed(1)) : 0

  res.json({
    success: true,
    totalRounds,
    averageMovesOverall: avgMoves,
    averageSecondsOverall: avgSeconds,
    distribution: {
      easy: byDifficulty.easy.length,
      medium: byDifficulty.medium.length,
      hard: byDifficulty.hard.length,
    },
    topPerformers: completed
      .sort((a, b) => a.moves - b.moves || a.completionSeconds - b.completionSeconds)
      .slice(0, 5),
  })
})

// Clear sessions - restricted to authenticated admin or test environment
app.delete('/api/game/sessions', (req: Request, res: Response) => {
  const adminKey = req.headers['x-admin-key']
  const isTest = process.env.NODE_ENV === 'test'

  if (!isTest && adminKey !== (process.env.ADMIN_KEY || 'test-admin-key')) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized. Clearing global server session history is restricted.',
    })
  }

  writeSessions([])
  res.json({
    success: true,
    message: 'All database session history cleared',
  })
})

// Serve static frontend in production if built dist exists
const DIST_DIR = path.join(__dirname, '../../dist')
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  app.use((req: Request, res: Response, next) => {
    if (req.path.startsWith('/api')) {
      return next()
    }
    res.sendFile(path.join(DIST_DIR, 'index.html'))
  })
}
