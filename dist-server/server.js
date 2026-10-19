// server/src/app.ts
import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var DATA_DIR = path.join(__dirname, "../../data");
var DB_FILE = path.join(DATA_DIR, "sessions.json");
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), "utf-8");
}
function readSessions() {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
function writeSessions(sessions) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(sessions.slice(-500), null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write sessions to file:", err);
  }
}
var app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "MemoryMatch API",
    version: "2.0.0",
    developer: "Pulkit Singla (2310991342)",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/game/rules", (_req, res) => {
  res.json({
    difficultyLevels: ["easy", "medium", "hard"],
    boardSizes: {
      easy: "4x4 (8 pairs)",
      medium: "4x5 (10 pairs)",
      hard: "4x6 (12 pairs)"
    },
    adaptationThresholds: {
      easyToMedium: { maxMoves: 18, maxSeconds: 60 },
      mediumToHard: { maxMoves: 22, maxSeconds: 90 },
      mediumToEasy: { maxMoves: 28, maxSeconds: 100 },
      hardToMedium: { maxMoves: 35, maxSeconds: 150 }
    }
  });
});
app.get("/api/game/sessions", (_req, res) => {
  const sessions = readSessions();
  res.json({
    success: true,
    count: sessions.length,
    sessions
  });
});
app.post("/api/game/session", (req, res) => {
  const body = req.body;
  if (!body.id || !body.difficulty || typeof body.moves !== "number" || typeof body.completedPairs !== "number" || typeof body.completionSeconds !== "number") {
    return res.status(400).json({
      success: false,
      error: "Invalid session payload. Missing required fields."
    });
  }
  const session = {
    id: String(body.id),
    difficulty: body.difficulty,
    moves: body.moves,
    completedPairs: body.completedPairs,
    completionSeconds: body.completionSeconds,
    status: body.status || "completed",
    seed: body.seed,
    timestamp: body.timestamp || (/* @__PURE__ */ new Date()).toISOString(),
    clientIp: req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1"
  };
  const sessions = readSessions();
  sessions.unshift(session);
  writeSessions(sessions);
  return res.status(201).json({
    success: true,
    message: "Session recorded successfully in server database",
    session
  });
});
app.get("/api/game/analytics", (_req, res) => {
  const sessions = readSessions();
  const completed = sessions.filter((s) => s.status === "completed");
  const totalRounds = completed.length;
  const totalMoves = completed.reduce((acc, curr) => acc + curr.moves, 0);
  const totalSeconds = completed.reduce((acc, curr) => acc + curr.completionSeconds, 0);
  const byDifficulty = {
    easy: completed.filter((s) => s.difficulty === "easy"),
    medium: completed.filter((s) => s.difficulty === "medium"),
    hard: completed.filter((s) => s.difficulty === "hard")
  };
  const avgMoves = totalRounds > 0 ? Number((totalMoves / totalRounds).toFixed(1)) : 0;
  const avgSeconds = totalRounds > 0 ? Number((totalSeconds / totalRounds).toFixed(1)) : 0;
  res.json({
    success: true,
    totalRounds,
    averageMovesOverall: avgMoves,
    averageSecondsOverall: avgSeconds,
    distribution: {
      easy: byDifficulty.easy.length,
      medium: byDifficulty.medium.length,
      hard: byDifficulty.hard.length
    },
    topPerformers: completed.sort((a, b) => a.moves - b.moves || a.completionSeconds - b.completionSeconds).slice(0, 5)
  });
});
app.delete("/api/game/sessions", (_req, res) => {
  writeSessions([]);
  res.json({
    success: true,
    message: "All database session history cleared"
  });
});
var DIST_DIR = path.join(__dirname, "../../dist");
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(DIST_DIR, "index.html"));
  });
}

// server/src/server.ts
var PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`[MemoryMatch Backend] Server running at http://localhost:${PORT}`);
  console.log(`[MemoryMatch Backend] Health check: http://localhost:${PORT}/api/health`);
  console.log(`[MemoryMatch Backend] Analytics API: http://localhost:${PORT}/api/game/analytics`);
});
