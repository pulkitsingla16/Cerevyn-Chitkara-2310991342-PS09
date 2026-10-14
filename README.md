# MemoryMatch — PS09 Adaptive Memory Matching Game

## Project identity

- **Project name:** MemoryMatch
- **Assessment ID:** PS09
- **Candidate name:** Pulkit Singla
- **Roll number:** 2310991342
- **Branch:** Computer Science
- **GitHub:** [github.com/pulkitsingla16](https://github.com/pulkitsingla16)

## Problem statement

Build a browser memory game in which players reveal cards and match pairs. The game must track session performance and adjust the next round using a clear rule based on the previous result.

## Approach and design decisions

I chose a **client-side React + TypeScript** architecture to keep the application lightweight and easy to deploy to Azure Static Web Apps. The game logic (shuffling, matching, adaptive difficulty) is completely separated from the UI layer so each part can be tested independently.

### Key design choices

1. **Three-level adaptive difficulty** — Easy (4×4), Medium (4×5), Hard (4×6) instead of just two levels, providing a smoother progression curve.
2. **Seeded PRNG** — a deterministic Fisher–Yates shuffle using a 32-bit hash function allows tests and demo sessions to produce identical boards from the same seed.
3. **Epoch-based mismatch guard** — instead of simply clearing timeouts on restart, each mismatch timeout carries a monotonic token; stale callbacks silently exit.
4. **Personal best tracking** — stored separately from session history, with a "fewer moves wins, then faster time breaks ties" comparison rule.

## Feature overview

- Responsive 4×4, 4×5, and 4×6 memory board layouts
- 3D CSS card flip animation
- Confetti celebration on round completion
- Personal best tracking per difficulty level
- Seeded shuffle support for deterministic tests and demos
- Move, timer, and completion tracking
- Three-level adaptive difficulty with visible explanations
- Versioned localStorage session history with validation and clear support
- Keyboard-accessible controls and modern dark interface

## Technology stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript 6 |
| Build tool | Vite 8 |
| Test runner | Vitest 5 + React Testing Library + jsdom |
| Linting | ESLint + TypeScript strict checks |
| Persistence | Browser localStorage (versioned, validated) |
| Icons | lucide-react |
| CI/CD | GitHub Actions |
| Hosting target | Azure Static Web Apps |

## Prerequisites

- Node.js 22.12+ (or 24+)
- npm 10+
- A modern browser (Chrome, Firefox, Edge, Safari)

## Setup and run instructions

```bash
# 1. Clone the repository
git clone https://github.com/pulkitsingla16/Cerevyn-Chitkara-2310991342-PS09.git
cd Cerevyn-Chitkara-2310991342-PS09

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
# Open http://localhost:5173 in a browser

# 4. Run the full test suite
npm test

# 5. Lint and type-check
npm run lint
npm run typecheck

# 6. Production build
npm run build
```

## Game rules

1. Click a card to reveal it.
2. Click a second card — if both symbols match, they stay face-up.
3. If the symbols do not match, both cards flip back after 650 ms.
4. A third click is blocked while two unmatched cards are displayed.
5. Clicking the same card again or a matched card is ignored (no move counted).
6. Match all pairs to complete the round.
7. The next round's difficulty is adjusted based on performance.

## Adaptive difficulty thresholds

| Transition | Condition |
|---|---|
| **Easy → Medium** | moves ≤ 18 **and** time ≤ 60 s |
| **Medium → Hard** | moves ≤ 22 **and** time ≤ 90 s |
| **Medium → Easy** | moves > 28 **or** time > 100 s |
| **Hard → Medium** | moves > 35 **or** time > 150 s |
| Otherwise | Difficulty stays the same |

Promotion requires meeting **both** thresholds. Reduction triggers if **either** threshold is exceeded. The UI displays the exact rule and metrics for every decision.

## Seeded shuffle explanation

The deck generator accepts an optional numeric seed. When provided, a deterministic 32-bit PRNG produces the same card arrangement every time. Normal gameplay generates a fresh cryptographic seed per round so boards vary. Tests pass a fixed seed (e.g., `42`) for reproducible scenarios.

## Session storage and privacy

- Session results are stored anonymously in browser `localStorage` under the versioned key `memory-match-history-v1`.
- Personal bests are stored under `memory-match-best-v1`.
- Records are validated with a type guard before use.
- Malformed data and storage failures (e.g., quota exceeded) fail gracefully without crashing.
- Users can clear history after a confirmation dialog.
- No personal information (names, emails) is collected.

## Repository structure

```text
.
├── .github/workflows/ci.yml       # GitHub Actions CI
├── docs/
│   ├── architecture.md             # Architecture notes
│   ├── azure-plan.md               # Azure deployment plan
│   └── testing.md                  # Testing guide
├── sample_data/
│   └── test-sessions.json          # Fixture data (5 sessions)
├── src/
│   ├── components/
│   │   ├── Confetti.tsx             # Canvas confetti animation
│   │   ├── ConfirmDialog.tsx        # Confirmation modal
│   │   ├── DifficultyNotice.tsx     # Adaptive decision display
│   │   ├── GameBoard.tsx            # Card grid layout
│   │   ├── GameStats.tsx            # Move/time/pair counters
│   │   ├── Header.tsx               # Top bar with restart
│   │   ├── Instructions.tsx         # How-to-play panel
│   │   ├── MemoryCard.tsx           # 3D-flip card button
│   │   ├── SessionHistory.tsx       # Past rounds list
│   │   └── WinPanel.tsx             # Win summary + next round
│   ├── game/
│   │   ├── config.ts                # Constants + thresholds
│   │   ├── difficulty.ts            # Adaptive decision logic
│   │   ├── gameLogic.ts             # Pure match helpers
│   │   ├── shuffle.ts               # Seeded Fisher–Yates
│   │   └── types.ts                 # TypeScript interfaces
│   ├── hooks/
│   │   ├── useMemoryGame.ts         # Core game state machine
│   │   └── useSessionHistory.ts     # Session persistence hook
│   ├── services/
│   │   └── storage.ts               # localStorage read/write/best
│   ├── test/setup.ts                # Vitest setup
│   ├── App.tsx                      # Root component
│   ├── App.css                      # All styles
│   ├── index.css                    # Global resets
│   └── main.tsx                     # Entry point
├── tests/
│   ├── difficulty.test.ts           # Adaptive rules (7 tests)
│   ├── game-ui.test.tsx             # UI lifecycle (4 tests)
│   ├── shuffle.test.ts              # Deck generation (5 tests)
│   ├── storage.test.ts              # Storage edge cases (4 tests)
│   └── timer-restart.test.tsx       # Timer + restart safety (1 test)
├── .env.example
├── index.html
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts
└── README.md
```

## Test summary

| Test file | Tests | Covers |
|---|---|---|
| `difficulty.test.ts` | 7 | Easy→Medium, Medium→Hard, Medium→Easy, Hard→Medium promotion and reduction boundaries, incomplete round guard |
| `shuffle.test.ts` | 5 | Deck sizes, pair counts, deterministic seeding, different seeds differ |
| `storage.test.ts` | 4 | Persist + reload, malformed JSON fallback, quota failure, clear confirmation |
| `timer-restart.test.tsx` | 1 | Timer starts on first click, resets to 0.0s on restart |
| `game-ui.test.tsx` | 4 | Match persistence, mismatch hide delay, repeat-click guard, matched-card guard |
| **Total** | **21** | |

## Demonstration scenarios

To verify the required behaviors, run `npm run dev` and:

1. **Match** — click two cards with the same symbol; they stay face-up with a green border.
2. **Mismatch** — click two different cards; they flip back after 450 ms.
3. **Rapid clicks** — click a third card while two mismatched cards are showing; the click is ignored.
4. **Restart during pending timer** — reveal one card, then click "Restart round"; the timer resets to 0.0 s and a fresh board appears.
5. **Difficulty change** — complete an Easy round in ≤ 18 moves and ≤ 60 s; the win panel shows "next: Medium" with the exact reason.

## Limitations

- Browser localStorage is device- and browser-specific, user-editable, and not synchronized across devices.
- This project intentionally avoids a backend database for the initial implementation.
- The assessment scope boundary states model training and elaborate UI design are not expected.

## Azure deployment summary

The project is designed for Azure Static Web Apps. The app is a static Vite bundle and does not require a server or database. See [docs/azure-plan.md](docs/azure-plan.md) for the full deployment procedure, security notes, and cost considerations.

## Contributions and AI assistance

This project was developed by **Pulkit Singla** as an individual submission for the Cerevyn × Chitkara University Round One Technical Assessment. AI coding assistants were used for boilerplate generation and code review. All architecture decisions, game logic, adaptive rules, and test scenarios were designed and validated by the candidate.

## Submission Deliverables & Links
- **Demo Video URL (3-5 min screen recording):** [Provide your YouTube/Loom/Drive link here]
- **Hosted Azure URL (Optional):** [Provide your Azure Static Web App URL if deployed]
- **GitHub Actions Workflow Run:** [Available under the Actions tab of this repository]
- **Final Release Tag / Commit:** `v1.0.0`

## License

Distributed under the MIT license as defined in [LICENSE](LICENSE).
