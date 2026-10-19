# MemoryMatch architecture notes

## Author

Pulkit Singla — 2310991342 — Computer Science

## Overview

This project is a client-side memory matching game built with React, TypeScript, and Vite. The app keeps its core rules and deterministic deck generation in the `src/game` layer, while the UI and browser persistence live in separate modules for easier maintenance and future API integration.

## Core layers

### Game engine

- `src/game/types.ts` defines the game and session types, including personal best tracking.
- `src/game/config.ts` contains difficulty data (Easy 4×4, Medium 4×5, Hard 4×6), timing, and three-level adaptive thresholds.
- `src/game/shuffle.ts` handles Fisher–Yates shuffling with optional fixed seeds for deterministic testing.
- `src/game/difficulty.ts` contains the three-level adaptive difficulty rules and decision explanations.
- `src/game/gameLogic.ts` exposes pure helper logic for board completion and match checks.

### UI and state

- `src/hooks/useMemoryGame.ts` manages the lifecycle of a round, timer, mismatch lock, personal best tracking, and completion flow.
- `src/hooks/useSessionHistory.ts` wraps session persistence and storage error handling.
- `src/components/*` render the 3D-flip card board, stats, session history, confetti celebration, instructions, and completion panels.

### Persistence and Privacy

- `src/services/storage.ts` reads and writes versioned localStorage keys: `memory-match-history-v1` and `memory-match-best-v1`.
- Stored records are validated with a type guard before use.
- Malformed data and disabled storage fail closed without crashing the game.
- Individual player history remains private to each visitor's browser.

### Telemetry Backend (Optional Layer)

- `server/src/app.ts` provides an Express 5 REST API for non-identifying telemetry.
- Endpoints:
  - `GET /api/health` — System status and developer metadata.
  - `GET /api/game/rules` — Static rules and adaptive threshold definitions.
  - `POST /api/game/session` — Accepts completed game metrics (validated strictly; never stores or exposes client IP).
  - `GET /api/game/analytics` — Computes global round averages, difficulty distributions, and leaderboard.
- The client seamlessly operates without the backend when deployed to static CDNs (e.g., GitHub Pages).

## Hybrid Architecture Rationale

1. **Client Independence:** The core memory game, adaptive difficulty engine, and private score history run 100% in the client browser with zero mandatory dependencies on external APIs.
2. **Optional Cloud Telemetry:** When deployed to Azure App Service or when the Node server is running locally, the game broadcasts anonymous metrics to generate multi-user statistics and leaderboards.
3. **Resilience:** If the backend is offline or unreachable, the client continues uninterrupted, computing local analytics directly from `localStorage`.

## Deterministic behavior

Seeded shuffles are supported explicitly for tests and demo scenarios. In normal gameplay the seed is generated at runtime so each round can vary while still preserving reproducible behavior when a fixed seed is passed in.
