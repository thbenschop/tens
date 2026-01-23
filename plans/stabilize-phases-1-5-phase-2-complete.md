## Phase 2 Complete: Deterministic Turn/Dealer Ordering

Ensured join order is preserved for gameplay by tracking player order in rooms, using it when starting games, and serializing with thread-safe accessors; added test coverage.

**Files created/changed:**
- server/internal/models/room.go
- server/internal/services/roomService.go
- server/internal/handlers/room.go
- server/internal/handlers/room_test.go

**Functions created/changed:**
- Room.AddPlayer / RemovePlayer with PlayerOrder tracking
- Room GetHostID/SetHostID/NextHost helpers and GetPlayersInOrder
- handleStartGame uses join order and locked host check
- serializeRoom uses ordered, thread-safe player data

**Tests created/changed:**
- START_GAME players follow join order

**Review Status:** APPROVED

**Git Commit Message:**
fix: enforce deterministic player ordering

- Track player join order in rooms and reassign host via locked accessors
- Start games and serialize rooms using deterministic ordering and safe reads
- Add GAME_STARTED test asserting players follow join order
