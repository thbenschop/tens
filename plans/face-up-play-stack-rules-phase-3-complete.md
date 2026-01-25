## Phase 3 Complete: Server Stack Resolution Logic

Server now allows over-value plays to stay on the pile, clears on 4+ trailing sets or tens with turn retention and clear messages, and enforces face-up/face-down pairing rules.

**Files created/changed:**
- server/internal/services/gameService.go
- server/internal/utils/validator.go
- server/internal/models/game.go

**Functions created/changed:**
- PlayCards now permits over-value plays, clears on 4+ sets with formatted messages, clears tens with message, and advances/retains turn per rules
- FlipFaceDown enforces paired face-up gating, supports over-value flips, and emits clear messages on clears
- Clear message tracking added to Game with thread-safe getters/setters
- Validator now treats over-value as valid and provides trailing set counting for clear detection

**Tests created/changed:**
- server/internal/services/gameService_test.go over-value, face-up play, clear messaging, and flip gating cases
- server/internal/utils/validator_test.go over-value allowance and trailing set expectations

**Review Status:** APPROVED

**Git Commit Message:**
feat: support over-value stack rules on server

- allow face-up and over-value plays to stay on pile and clear on 4+ runs
- emit clear messages for tens and sets and keep turn on clears
- enforce face-down flip pairing and thread-safe clear message tracking
