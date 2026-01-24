## Plan: Stabilize Client WebSocket Connection

Add tests capturing the render-driven reconnect loop, stabilize hook dependencies to keep a single socket per URL, and introduce a reconnect cooldown to prevent runaway retries and memory growth.

**Phases 3**
1. **Phase 1: Reproduce reconnect loop**
    - **Objective:** Demonstrate the current WebSocket effect recreates connections on each render and drives rapid retry growth.
    - **Files/Functions to Modify/Create:** client/src/hooks/useWebSocket.test.js; client/src/hooks/useGameState.test.js.
    - **Tests to Write:** Reconnection occurs when callbacks change per render; connectionAttempts increments on rerenders without URL change; baseline memory-safe behavior missing.
    - **Steps:**
        1. Add tests that render useWebSocket via a harness with changing inline handlers, asserting multiple connects per render cycle.
        2. Add tests verifying connectionAttempts rises with rerenders absent network loss.
        3. Run tests to confirm failures documenting the existing loop.

2. **Phase 2: Stabilize WebSocket dependencies**
    - **Objective:** Prevent socket recreation on rerender by memoizing handlers and narrowing effect dependencies while preserving reconnection on real drops.
    - **Files/Functions to Modify/Create:** client/src/hooks/useWebSocket.js; client/src/hooks/useGameState.js; related tests.
    - **Tests to Write:** No reconnection when rerendering with same URL/handlers; handlers fire correctly once per connection; connectionAttempts remains stable under state-driven rerenders; cleanup closes socket on unmount or URL change.
    - **Steps:**
        1. Memoize callbacks passed into useWebSocket and adjust effect dependency array to exclude unstable references.
        2. Ensure connect/cleanup only runs on URL change or unmount; keep backoff for genuine disconnects.
        3. Run tests to confirm stabilization and passing behavior.

3. **Phase 3: Add reconnect cooldown**
    - **Objective:** Introduce a cooldown after consecutive failures to throttle retries and mitigate memory/connection churn.
    - **Files/Functions to Modify/Create:** client/src/hooks/useWebSocket.js; client/src/hooks/useWebSocket.test.js; client/src/hooks/useGameState.test.js.
    - **Tests to Write:** Backoff honors cooldown after sustained failures; connectionAttempts growth is bounded under repeated drops; reconnect resumes after cooldown when the server is reachable.
    - **Steps:**
        1. Add tests defining cooldown behavior and expected timing bounds atop existing backoff.
        2. Implement cooldown gating in reconnect logic and expose state as needed for tests.
        3. Run the suite to ensure all tests pass and retries remain throttled.

**Open Questions**
1. Preferred cooldown duration/start threshold (e.g., 5–10 seconds after N consecutive failures)?
2. Should cooldown reset immediately on a successful connection? 
