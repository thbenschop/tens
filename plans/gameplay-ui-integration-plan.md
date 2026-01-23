## Plan: Clear the Deck – Gameplay UI & Integration

Deliver interactive in-game UI, card interactions, and full client-server game flow with responsive design and real-time sync, using TDD for all additions.

**Phases 3**
1. **Phase 1: Card UI Foundations**
    - **Objective:** Build visual card system and selection primitives used by game views.
    - **Files/Functions to Modify/Create:** client/src/components/ui/Card.js, CardSelector.js; client/src/components/game/PlayerHand.js, TableCards.js, CenterPile.js; client/src/styles/cards.css, game.css; client/src/utils/cardUtils.js (sorting helpers as needed).
    - **Tests to Write:** Card renders suit/value; CardSelector multi-select toggles; PlayerHand displays sorted selectable cards; TableCards shows face-up vs face-down; CenterPile preserves play order.
    - **Steps:**
        1. Add failing tests for Card, CardSelector, PlayerHand, TableCards, CenterPile.
        2. Implement Card visuals (value/suit, card back), CardSelector toggling, layout components with responsive styles.
        3. Run tests and iterate until passing; refine accessibility and touch targets.

2. **Phase 2: Game Board Assembly & Actions**
    - **Objective:** Compose in-game layout and wire client actions to backend (play cards, flip face-down) with turn gating and feedback.
    - **Files/Functions to Modify/Create:** client/src/components/game/GameBoard.js, PlayerInfo.js integration, ScoreBoard.js integration; client/src/App.js; client/src/hooks/useGameState.js (action senders, state mapping); client/src/utils/gameLogic.js (client validations if needed).
    - **Tests to Write:** GameBoard renders players, hand, table, center; turn indicator highlights current player; action buttons disable out-of-turn; play/flip calls dispatch correct messages; round results surface via ScoreBoard.
    - **Steps:**
        1. Add failing tests covering GameBoard layout, turn gating, action dispatch, and round result display.
        2. Implement GameBoard composition using Phase 1 components; add controls for play/flip; integrate PlayerInfo and ScoreBoard.
        3. Extend useGameState to expose play/flip/send helpers and map server updates; rerun tests to green.

3. **Phase 3: Integration & Sync Reliability**
    - **Objective:** Validate end-to-end flow across game states, add user-facing error/loading states, and ensure multi-client sync correctness.
    - **Files/Functions to Modify/Create:** client/src/App.test.js (integration cases), client/src/hooks/useWebSocket.js (light retry/connection state), client/src/App.js (error/loading banners), optional new mock helpers for tests.
    - **Tests to Write:** Multi-player flow from lobby to active play to round end; set clear and pile pickup scenarios reflect in UI; face-down flip path; error feedback on invalid play; disconnect/reconnect UI state; broadcast updates apply to all clients.
    - **Steps:**
        1. Add failing integration tests (mock WebSocket) for full game loop and error handling.
        2. Implement minimal reconnect/status handling, surface errors/loading in App, ensure state updates fan out to composed components.
        3. Run integration suite, adjust for sync correctness; finalize responsive/touch polish.

**Open Questions**
1. Card visuals: prefer classic suits with minimal color scheme or richer themed styling?
2. Touch interactions: single-tap select, double-tap play, or button-driven play after selection?
3. Should we add lightweight reconnect/backoff now or defer to a later hardening task?
4. Error surfacing: toast-style alerts or inline banners in GameBoard?
5. Animations: simple fades/transitions or add stacking/slide motions for center pile?
