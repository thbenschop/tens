## Phase 2 Complete: Game Board Assembly & Actions

Composed the in-game board with turn gating, play/flip controls, inline errors, and scoreboard wiring backed by enhanced game state derivations.

**Files created/changed:**
- client/src/components/game/GameBoard.js
- client/src/components/game/GameBoard.test.js
- client/src/components/game/index.js
- client/src/App.js
- client/src/App.test.js
- client/src/hooks/useGameState.js
- client/src/hooks/useGameState.test.js

**Functions created/changed:**
- GameBoard layout with hand/table/center pile, play and flip controls, turn indicator, inline error banner, ScoreBoard integration
- useGameState derived fields (players, currentTurnPlayerId, isPlayerTurn, center pile, hand/table cards, canFlip) plus sendPlayCards/flipFaceDown commands
- App now routes to GameBoard when gameStarted is true; exports GameBoard via index

**Tests created/changed:**
- GameBoard layout, turn indicator, play disable/dispatch, flip gating, error banner, scoreboard rendering
- useGameState derives turn state, handles round events, and sends play/flip payloads
- App renders GameBoard when game has started

**Review Status:** APPROVED

**Git Commit Message:**
feat: assemble game board UI

- add game board layout with play/flip controls and error banner
- derive player turn state and wire play/flip actions through useGameState
- render GameBoard when game starts and cover new UI behaviors with tests
