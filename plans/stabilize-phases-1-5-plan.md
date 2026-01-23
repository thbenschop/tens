## Plan: Stabilize Phases 1–5 (Server/Game/UI Parity)

Stabilize server play rules, deterministic ordering, payload parity, and client utility correctness for completed phases 1–5, adding tests to lock behavior.

**Phases 4 phases**
1. **Phase 1: Server Play/Pickup Rules Fixes**
    - **Objective:** Enforce pile pickup on over-value plays, carry `afterPickup` state, and add validation reason coverage.
    - **Files/Functions to Modify/Create:** server/internal/services/gameService.go (PlayCards, PickupPile), server/internal/utils/validator_test.go, server/internal/services/gameService_test.go.
    - **Tests to Write:** Add PlayCards over-value pickup test; add validator reason assertions.
    - **Steps:**
        1. Write failing tests for over-value play triggering PickupPile and for validation reasons.
        2. Implement server-side pickup path and ensure afterPickup updates.
        3. Run tests to greenlight behavior.

2. **Phase 2: Deterministic Turn/Dealer Ordering**
    - **Objective:** Ensure initial player order is deterministic (clockwise) and consistent for turn/dealer rotation.
    - **Files/Functions to Modify/Create:** server/internal/handlers/room.go (ordering), server/internal/services/gameService_test.go (dealer rotation), new/updated handler test.
    - **Tests to Write:** Handler test for deterministic ordering; dealer rotation test ensuring clockwise order.
    - **Steps:**
        1. Write failing tests asserting stable order on start.
        2. Implement ordering logic (stable slice from lobby order).
        3. Verify dealer rotation honors order.

3. **Phase 3: Client-Server Payload Parity**
    - **Objective:** Align payload shapes/field names for GAME_STARTED/UPDATE/ROUND_END, and add handler tests.
    - **Files/Functions to Modify/Create:** client/src/hooks/useGameState.js, client/src/components/game/PlayerInfo.js, server/internal/handlers/game.go, server/internal/handlers/room_test.go or new server/internal/handlers/game_test.go.
    - **Tests to Write:** Client hook tests for GAME_STARTED/GAME_UPDATE/ROUND_END; handler tests for PLAY_CARDS and FLIP_FACE_DOWN payloads.
    - **Steps:**
        1. Write failing client hook tests for event handling and state mapping.
        2. Adjust server payload fields or client mapping for consistent schema.
        3. Add handler tests for game actions and run suite.

4. **Phase 4: Client Validation/Sorting Fixes + Coverage**
    - **Objective:** Correct getCardValue/sortCards logic, suit/value mapping, and add missing client utility tests.
    - **Files/Functions to Modify/Create:** client/src/utils/cardUtils.js, client/src/utils/gameLogic.js, client/src/components/game/PlayerInfo.js (table keys), constants if needed; new tests in client utils.
    - **Tests to Write:** cardUtils tests for sorting/grouping; gameLogic tests for validation against last value, wild tens, first play; suit/value rendering expectations.
    - **Steps:**
        1. Write failing tests covering sorting, value mapping, and validation scenarios.
        2. Fix utilities and any component field mismatches.
        3. Run client test suite to confirm parity.

**Open Questions 3 questions**
1. Align payloads: adjust client to server.
2. Desired ordering: join order.
3. UI should reflect picked up cards in the player's hand.
