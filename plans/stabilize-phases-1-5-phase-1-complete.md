## Phase 1 Complete: Server Play/Pickup Rules Fixes

Enforced pickup on over-value plays with afterPickup state tracking, reset that flag between rounds, and expanded validation coverage.

**Files created/changed:**
- server/internal/models/game.go
- server/internal/services/gameService.go
- server/internal/services/gameService_test.go
- server/internal/utils/validator_test.go

**Functions created/changed:**
- AfterPickup state handling
- PlayCards
- PickupPile
- InitializeRound / StartNextRound

**Tests created/changed:**
- Over-value play forces pickup and retains turn
- AfterPickup cleared when starting a new round
- Validator reason assertions for invalid plays

**Review Status:** APPROVED

**Git Commit Message:**
fix: enforce pickup rules and reset flag

- Add forced pickup path for over-value plays and maintain turn state
- Reset afterPickup when rounds start to avoid leaking state
- Expand validation and gameplay tests for pickup and reasons
