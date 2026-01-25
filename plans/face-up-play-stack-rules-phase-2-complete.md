## Phase 2 Complete: Client Play Validation and Selection

Enabled client-side validation and UI selection to allow face-up plays, support over-value stacking with set-based clears, and emit clear messages for tens and 4+ runs.

**Files created/changed:**
- client/src/utils/gameLogic.js
- client/src/utils/gameLogic.test.js
- client/src/components/game/GameBoard.js
- client/src/components/game/TableCards.js

**Functions created/changed:**
- isValidPlay now allows over-value plays, clears on 4+ runs, and emits clear messages/keepTurn metadata for sets and tens
- canPlayCards supports face-up selections alongside hand cards and annotates face-up over-value messaging
- GameBoard merges hand/table selections for Play Selected and routes face-up play actions
- TableCards exposes selection/play handlers for face-up cards

**Tests created/changed:**
- client/src/utils/gameLogic.test.js covering tens clear messaging, over-value non-clear and set-clear flows, and face-up play acceptance

**Review Status:** APPROVED

**Git Commit Message:**
feat: allow face-up plays on client

- enable face-up selection/play with merged hand selections
- permit over-value stacking and clear on 4+ runs with messages
- surface tens clear messaging and keep-turn metadata in validation
