## Plan Complete: Remove Connection Popups in Client

Removed reconnect/error banners and global alerts from home and lobby, relying on the status light while retaining the small helper text under home buttons and logging errors to the console.

**Phases Completed:** 3 of 3
1. ✅ Phase 1: Define new connection UI rules
2. ✅ Phase 2: Align error propagation with UI removal
3. ✅ Phase 3: Clean up helper text and edge cases

**All Files Created/Modified:**
- client/src/App.js
- client/src/App.test.js
- client/src/hooks/useWebSocket.js
- client/src/hooks/useWebSocket.test.js
- client/src/hooks/useGameState.js
- plans/remove-connection-popups-in-client-plan.md
- plans/remove-connection-popups-in-client-phase-1-complete.md
- plans/remove-connection-popups-in-client-phase-2-complete.md
- plans/remove-connection-popups-in-client-phase-3-complete.md
- plans/remove-connection-popups-in-client-complete.md

**Key Functions/Classes Added:**
- App connection status display with aria-label/test id
- WebSocket error handling with guarded reconnect scheduling
- Game state error logging without popup surfacing

**Test Coverage:**
- Total tests written/updated: 6
- All tests passing: ✅

**Recommendations for Next Steps:**
- Run the full client test suite to ensure broader coverage beyond updated specs.
