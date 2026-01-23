## Phase 3 Complete: Client-Server Payload Parity

Aligned client state handling with server game payloads and added integration coverage for gameplay WebSocket actions.

**Files created/changed:**
- client/src/hooks/useGameState.js
- client/src/hooks/useGameState.test.js
- server/internal/handlers/game.go
- server/internal/handlers/game_test.go

**Functions created/changed:**
- useGameState message handling for GAME_STARTED, GAME_UPDATE, ROUND_END, ROUND_STARTED
- RoomHandler.handleNextRound host check (locked)
- Game handler responses (GameResponse) and broadcast behavior

**Tests created/changed:**
- Client hook tests for GAME_STARTED/UPDATE and ROUND_END/ROUND_STARTED payloads
- Server PLAY_CARDS integration test ensuring GAME_UPDATE broadcast and center pile update

**Review Status:** APPROVED

**Git Commit Message:**
fix: align payloads and add game handler tests

- Map client game state to server GAME_STARTED/UPDATE/ROUND_END payloads and cover with hook tests
- Add game handler integration test for PLAY_CARDS and use locked host check for next round
- Adjust game response schema to carry game data consistently
