## Plan: Remove Connection Popups in Client

Goal: Remove reconnect/error banners from home and lobby while keeping the helper text under home buttons and relying on the status light; log other errors to the console.

**Phases**
1. **Phase 1: Define new connection UI rules**
    - **Objective:** Remove connection/reconnect banners and red error alert while keeping the status light and home helper text intact.
    - **Files/Functions to Modify/Create:** client/src/App.js (banner and alert rendering), related CSS if needed.
    - **Tests to Write:** App.test.js to assert banners/alerts are absent when connected or reconnecting and the status light remains visible.
    - **Steps:**
        1. Add or adjust tests in App.test.js expressing no banner/alert while the status light stays visible.
        2. Run tests to observe current failures.
        3. Update App.js render logic to drop banners/alerts per the rules.
        4. Re-run tests to confirm they pass.

2. **Phase 2: Align error propagation with UI removal**
    - **Objective:** Prevent WebSocket or game errors from surfacing as dismissible popups; ensure the status light is authoritative and log errors to the console.
    - **Files/Functions to Modify/Create:** client/src/hooks/useWebSocket.js (error handling and logging), client/src/hooks/useGameState.js (error propagation), client/src/App.js (error consumption).
    - **Tests to Write:** useWebSocket.test.js for error state and reconnect behavior; App.test.js to ensure no alert appears on transient socket errors while status light reflects state.
    - **Steps:**
        1. Add or adjust tests for error handling to match the new UI expectations.
        2. Run tests to see failures.
        3. Update hooks and App to avoid popup alerts and log errors to the console.
        4. Re-run tests to confirm they pass.

3. **Phase 3: Clean up helper text and edge cases**
    - **Objective:** Remove any remaining banner-like helpers tied to connection on home or lobby; keep the small helper text under home buttons and button-disable logic.
    - **Files/Functions to Modify/Create:** client/src/App.js helper text logic; related CSS or messages.
    - **Tests to Write:** App.test.js to ensure the helper text under buttons remains while banners are gone and the status light persists.
    - **Steps:**
        1. Add or adjust tests to assert helper text remains and banners are removed.
        2. Run tests to see failures.
        3. Refine UI to match the final rules.
        4. Re-run tests to confirm they pass.

**Open Questions**
- None.
