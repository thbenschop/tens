## Phase 2 Complete: Play Validation and Table Key Parity

Validation now enforces same-face selections, wild tens, rank comparisons, after-pickup bypass, and coherent reasons; availability checks hand/tableCardsUp/tableCardsDown. Player display uses tableCardsUp/tableCardsDown consistently.

**Files created/changed:**
- client/src/utils/gameLogic.js
- client/src/utils/gameLogic.test.js
- client/src/components/game/PlayerInfo.js
- client/src/components/game/PlayerInfo.test.js

**Functions created/changed:**
- isValidPlay
- allSameValue
- getCardValue (gameLogic version)
- canPlayCards
- calculatePoints (comment clarification only)

**Tests created/changed:**
- gameLogic.test.js (validation reasons, tens wild, empty pile, rank comparison, availability across hand/tableCardsUp/tableCardsDown)
- PlayerInfo.test.js (counts and breakdown using tableCardsUp/tableCardsDown)

**Review Status:** APPROVED

**Git Commit Message:**
feat: solidify play validation and table keys

- Enforce play rules with wild tens, rank checks, after-pickup bypass, and clear reasons
- Validate selections across hand/tableCardsUp/tableCardsDown with tests
- Align PlayerInfo counts to tableCardsUp/tableCardsDown and update coverage
