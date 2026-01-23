## Plan: Client Validation and Sorting Fixes

Tighten client card rank/suit mapping, sorting/grouping, play validation, and coverage so client behavior matches agreed rules (capitalized suits, tens worth 20, tableCardsUp/tableCardsDown keys).

**Phases 3 phases**
1. **Phase 1: Value/Suit Mapping and Sorting**
    - **Objective:** Define correct rank map for cards, harmonize suit casing/order, and ensure card sorting/grouping uses numeric ranks with deterministic suit ordering.
    - **Files/Functions to Modify/Create:** client/src/utils/constants.js, client/src/utils/cardUtils.js, new client utility tests (e.g., cardUtils.test.js).
    - **Tests to Write:** getCardValue returns correct ranks (tens=20 rule applied where relevant), sortCards orders by value then suit using capitalized suits, groupByValue clusters identical ranks, suit symbol/color mapping matches expected casing.
    - **Steps:**
        1. Add failing utility tests covering rank map, sort/group behavior, and suit symbol/color outputs.
        2. Implement/adjust rank map and suit handling to satisfy tests, ensuring deterministic ordering with capitalized suits.
        3. Rerun tests to confirm sorting and mapping correctness.

2. **Phase 2: Play Validation and Table Key Parity**
    - **Objective:** Fix validation to honor wild tens, last-value comparison, afterPickup bypass, and ensure table key naming matches tableCardsUp/tableCardsDown usage.
    - **Files/Functions to Modify/Create:** client/src/utils/gameLogic.js, client/src/utils/cardUtils.js (suggested plays if needed), client/src/components/game/PlayerInfo.js if key alignment is required; new tests in gameLogic utils.
    - **Tests to Write:** isValidPlay enforces same-value sets, tens always valid, empty pile allowed, over-value rejected with reason; afterPickup allows any play; canPlayCards accepts selections from hand/tableCardsUp/tableCardsDown; suggested plays respect last pile value.
    - **Steps:**
        1. Add failing validation tests covering the scenarios above, including key parity for selections.
        2. Update validation logic and key handling to pass tests; align table key names if mismatched.
        3. Rerun tests to ensure validation and selection paths behave as expected.

3. **Phase 3: Scoring and Render Parity Coverage**
    - **Objective:** Lock calculatePoints and set detection, and ensure PlayerInfo renders counts/values consistently with updated mapping.
    - **Files/Functions to Modify/Create:** client/src/utils/gameLogic.js (calculatePoints, detectSet), client/src/components/game/PlayerInfo.js; new tests for these behaviors.
    - **Tests to Write:** calculatePoints uses correct card values with tens worth 20; detectSet threshold behavior; PlayerInfo displays hand/table counts consistent with tableCardsUp/tableCardsDown and capitalized suits.
    - **Steps:**
        1. Add failing tests for scoring, set detection, and PlayerInfo display consistency.
        2. Adjust scoring/detection logic and component rendering to satisfy tests.
        3. Rerun suite to confirm coverage and parity.

**Open Questions 1 question**
1. None; decisions confirmed (tens worth 20, suits capitalized, tableCardsUp/tableCardsDown keys).
