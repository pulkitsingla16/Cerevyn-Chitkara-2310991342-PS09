import { app } from './app'

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`[MemoryMatch Backend] Server running at http://localhost:${PORT}`)
  console.log(`[MemoryMatch Backend] Health check: http://localhost:${PORT}/api/health`)
  console.log(`[MemoryMatch Backend] Analytics API: http://localhost:${PORT}/api/game/analytics`)
})
