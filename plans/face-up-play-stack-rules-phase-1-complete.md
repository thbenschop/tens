## Phase 1 Complete: Align Rules and Tests (failing-first)

Captured new gameplay rules in docs and added failing-first coverage for face-up play, over-value pile handling, clearing messages, and face-down flip pairing.

**Files created/changed:**
- plans/face-up-play-stack-rules-plan.md
- GAME_RULES.md
- client/src/utils/gameLogic.test.js
- server/internal/services/gameService_test.go
- server/internal/utils/validator_test.go

**Functions created/changed:**
- Client validation test cases for face-up play, over-value set clearing, non-clearing over-value, and clear message metadata
- Server PlayCards tests for face-up play with remaining hand cards, over-value set/non-set outcomes, and pluralized clear messages
- Server FlipFaceDown tests blocking flips while paired face-up remains
- Validator tests covering over-value legality and set detection expectations

**Tests created/changed:**
- client/src/utils/gameLogic.test.js over-value and face-up play cases
- server/internal/services/gameService_test.go PlayCards/FlipFaceDown/clear-message cases
- server/internal/utils/validator_test.go validator expectation cases

**Review Status:** APPROVED

**Git Commit Message:**
test: add stack rule coverage

- document over-value stay/clear and face-up/face-down rules
- add client validation tests for face-up play and clearing messages
- add server tests for over-value pile behavior and flip pairing guard
