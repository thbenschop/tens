## Phase 2 Complete: Align error propagation with UI removal

Prevented errors from surfacing as popups while keeping the status light authoritative and logging issues to the console.

**Files created/changed:**
- client/src/hooks/useWebSocket.js
- client/src/hooks/useWebSocket.test.js
- client/src/hooks/useGameState.js
- client/src/App.test.js

**Functions created/changed:**
- WebSocket error handling and reconnect scheduling guard
- Game state error logging without UI alerts
- App integration handling of socket/server errors via status light only

**Tests created/changed:**
- useWebSocket: single reconnect when error followed by close; error logging/clear on reconnect
- App integration: status-light-only behavior on socket errors; server errors do not render alerts

**Review Status:** APPROVED

**Git Commit Message:**
feat: log socket errors without alerts

- guard reconnect scheduling to avoid duplicate sockets on errors
- log websocket/server errors while keeping status light authoritative
- update websocket and app integration tests for alert-free error handling
