## Plan: Face Up Play and Stack Rules

Implement face-up card play and revised stack resolution so over-value plays stay unless forming a 4+ set that clears and grants another turn, with matching UI messaging and clarified face-down flip rules.

**Phases 4**
1. **Phase 1: Align Rules and Tests (failing-first)**
    - **Objective:** Capture new rules in documentation and tests before code changes.
    - **Files/Functions to Modify/Create:** GAME_RULES.md; client/src/utils/gameLogic.test.js; server/internal/services/gameService_test.go; server/internal/utils/validator_test.go.
    - **Tests to Write:** Over-value play keeps stack; 4-of-a-kind on over-value clears and grants extra turn; face-up card treated as playable source; clear message string includes "Cleared by <number_of> <card_rank>!" or "Cleared by 10!" when applicable.
    - **Steps:**
        1. Update GAME_RULES.md to describe over-value stay/clear-on-set, face-up play allowed, face-down flip/auto-play linkage, and clear messaging.
        2. Add/adjust client tests to expect over-value plays allowed, set clearing, face-up play, and clearing message presence; run to see failures.
        3. Add/adjust server tests for new stack rule, extra turn on 4+ set, and clearing message propagation if surfaced; run to see failures.
        4. Ensure tests fail against current implementation (red state).

2. **Phase 2: Client Play Validation and Selection**
    - **Objective:** Permit face-up card plays, honor new stack rule, and emit clear messages on the client.
    - **Files/Functions to Modify/Create:** client/src/utils/gameLogic.js; client/src/components/ui/CardSelector.js; client/src/components/game/GameBoard.js; client/src/components/game/TableCards.js (if needed for messaging display); related tests.
    - **Tests to Write:** canPlayCards allows face-up selection; over-value play leaves stack unless 4+ set clears; set clear emits "Cleared by <number_of> <card_rank>!" or "Cleared by 10!"; face-down flip linkage respected per rule; extra turn flag if represented.
    - **Steps:**
        1. Update validation to allow over-value plays and detect 4+ top set to clear; tens unchanged.
        2. Enable selecting/playing face-up cards via CardSelector/GameBoard wiring; ensure face-down flip availability only after paired face-up is played.
        3. Surface clearing message in UI when pile clears; ensure optional hand-matching play with flipped face-down remains valid.
        4. Adjust client tests to green and run client suite.

3. **Phase 3: Server Stack Resolution Logic**
    - **Objective:** Change server play flow to leave over-value cards, only clear on 4+ set, preserve turn rules, and emit clear messages.
    - **Files/Functions to Modify/Create:** server/internal/services/gameService.go (PlayCards, FlipFaceDown if needed), server/internal/utils/validator.go (DetectSet/validation flow), related tests.
    - **Tests to Write:** Over-value play appends and ends turn; over-value forming 4+ clears and grants extra turn; tens still clear with "Cleared by 10!"; face-up cards playable; face-down auto-play after paired face-up is used; clearing message included.
    - **Steps:**
        1. Adjust validation/flow so over-value is permitted (no auto-pickup) and ends turn unless a 4+ set clears and keeps turn; tens clear immediately.
        2. Detect set after play; clear pile and keep current player turn on 4+; include clearing message text in responses/state.
        3. Ensure face-up cards are accepted as playable sources; maintain face-down flip rules (paired under face-up, auto-play when flipped, allow optional matching hand cards).
        4. Update tests to green and run server suite.

4. **Phase 4: End-to-End Sync and Regression**
    - **Objective:** Ensure client/server behaviors match with messaging and turn handling intact.
    - **Files/Functions to Modify/Create:** Cross-cutting integration or hook tests; any shared constants/messages; UI surface for clearing message if needed.
    - **Tests to Write:** Scenario combining face-up play with over-value and set clearing; confirm clearing message text; confirm turn advancement/retention matches rule; face-down flip flow end-to-end.
    - **Steps:**
        1. Add/adjust integration-style tests (client hooks or server service) to mirror new rule and message.
        2. Run full test suites (client and server); address mismatches.
        3. Final doc touch-ups if wording needs alignment.

**Open Questions**
1. None; clarified: show "Cleared by <number_of> <card_rank>!" or "Cleared by 10!", face-down sits under face-up and auto-plays when flipped after its face-up is used, turn handling remains as currently implemented.
