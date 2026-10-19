# Testing guide

## Author

Pulkit Singla — 2310991342 — Computer Science

## Commands

- `npm test` runs the full Vitest suite (27 tests across 6 files).
- `npm run test:watch` keeps the suite open for development.
- `npm run typecheck` runs the TypeScript check.
- `npm run lint` runs ESLint.

## Test files

| File | Tests | Purpose |
|---|---|---|
| `tests/difficulty.test.ts` | 7 | Three-level adaptive rules — Easy→Medium, Medium→Hard, Medium→Easy, Hard→Medium, boundary inclusivity, incomplete round guard |
| `tests/shuffle.test.ts` | 5 | Deck generation for Easy and Hard, pair integrity, deterministic seed, different seeds differ |
| `tests/storage.test.ts` | 4 | Persist and reload, malformed JSON fallback, quota-exceeded graceful failure, clear confirmation |
| `tests/timer-restart.test.tsx` | 1 | Timer starts on first click, resets to 0.0 s on restart |
| `tests/game-ui.test.tsx` | 5 | Match persistence, exact move count assertions, 450ms mismatch hide, repeat-click guard, mismatch restart safety |
| `tests/api.test.ts` | 5 | REST API health check, rules query, session persistence without IP exposure, invalid payload/range 400 rejection, and global telemetry aggregates |
| **Total** | **27** | **27 automated tests passing across 6 test suites** |

## Fixtures

The sample data file at `sample_data/test-sessions.json` contains five completed sessions used for local validation and documentation examples.

## Deterministic checks

- Use seeded shuffle calls for board reproducibility.
- Use fake timers for mismatch delay and restart tests.
- Validate storage failures by forcing `localStorage.setItem` to throw.
- Keep assertions on real app behavior rather than mock-only states.
