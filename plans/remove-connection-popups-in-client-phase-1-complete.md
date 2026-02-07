## Phase 1 Complete: Define new connection UI rules

Removed connection/reconnect banners and the global error alert while keeping the status light and home helper text intact across views.

**Files created/changed:**
- client/src/App.js
- client/src/App.test.js

**Functions created/changed:**
- App component connection status display and menu helper text

**Tests created/changed:**
- App integration: keeps status light and helper text without banner
- App integration: lobby-to-game flow still renders scoreboard
- App integration: does not render global error alert for server errors

**Review Status:** APPROVED

**Git Commit Message:**
feat: remove connection banners

- remove connection/reconnect banners and global error alert
- keep status light and menu helper text unchanged
- update app integration tests for new connection UI
