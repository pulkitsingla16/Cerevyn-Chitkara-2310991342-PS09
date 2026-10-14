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

### Persistence

- `src/services/storage.ts` reads and writes versioned localStorage keys: `memory-match-history-v1` and `memory-match-best-v1`.
- Stored records are validated with a type guard before use.
- Malformed data and disabled storage fail closed without crashing the game.

## Why a client-side app

The assessment requirements are fully satisfied without a Node.js backend or database. The game state is ephemeral per browser session, while anonymous history is kept locally in storage. This keeps the architecture simple and is a good foundation for a later API-backed version if the product grows.

## Deterministic behavior

Seeded shuffles are supported explicitly for tests and demo scenarios. In normal gameplay the seed is generated at runtime so each round can vary while still preserving reproducible behavior when a fixed seed is passed in.
