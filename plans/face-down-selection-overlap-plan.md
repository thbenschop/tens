## Plan: Face-Down Selection and Overlap

Enable selecting a specific face-down card via FLIP_FACE_DOWN when its corresponding face-up slot has been cleared and visually pair face-up cards over corresponding face-down cards by index.

**Phases 3**
1. **Phase 1: Table face-down selection rules**
    - **Objective:** Make a face-down table card selectable only when its paired face-up slot (same index) is empty; keep other face-down cards inert.
    - **Files/Functions to Modify/Create:** [client/src/components/game/TableCards.js](client/src/components/game/TableCards.js); [client/src/components/ui/CardSelector.js](client/src/components/ui/CardSelector.js) if selection gating needed; [client/src/components/game/TableCards.test.js](client/src/components/game/TableCards.test.js)
    - **Tests to Write:** A face-down card is inert while its paired face-up exists; it becomes selectable and invokes play/flip callback once that paired face-up is gone; other face-down slots remain inert until their face-up is cleared.
    - **Steps:**
        1. Add tests covering disabled vs enabled face-down interaction and callback firing.
        2. Run tests to confirm failure.
        3. Wire face-down cards through selection/play when face-up depleted; keep disabled otherwise.
        4. Run tests to confirm pass.

2. **Phase 2: GameBoard face-down flip dispatch**
    - **Objective:** When a face-down card’s paired face-up slot is empty, dispatch FLIP_FACE_DOWN for that selected face-down card; block face-down selection when its paired face-up still exists; retain existing flip button behavior for random flips.
    - **Files/Functions to Modify/Create:** [client/src/components/game/GameBoard.js](client/src/components/game/GameBoard.js); [client/src/hooks/useGameState.js](client/src/hooks/useGameState.js) if helper needed; [client/src/components/game/GameBoard.test.js](client/src/components/game/GameBoard.test.js)
    - **Tests to Write:** Selecting a face-down card whose paired face-up is cleared triggers FLIP_FACE_DOWN with that card id; selecting a face-down whose paired face-up still exists is blocked; extra face-down without matching face-up index (e.g., slot 3 when 0-2 existed) is selectable if its own paired face-up is empty.
    - **Steps:**
        1. Add integration tests for eligible/ineligible face-down flip dispatch.
        2. Run tests to confirm failure.
        3. Implement handler to send FLIP_FACE_DOWN with selected face-down id; keep existing flip button intact.
        4. Run tests to confirm pass.

3. **Phase 3: Overlap UI pairing by index**
    - **Objective:** Visually stack face-up cards over corresponding face-down cards (aligned by array index) with slight offset so the face-down is mostly covered but still visible.
    - **Files/Functions to Modify/Create:** [client/src/components/game/TableCards.js](client/src/components/game/TableCards.js); [client/src/styles/game.css](client/src/styles/game.css); [client/src/styles/cards.css](client/src/styles/cards.css); [client/src/components/game/TableCards.test.js](client/src/components/game/TableCards.test.js)
    - **Tests to Write:** DOM structure supports paired wrappers for overlap; face-down back remains visible; face-up positioned above matching index.
    - **Steps:**
        1. Add structure test for paired/overlap container.
        2. Run tests to confirm failure.
        3. Adjust markup and CSS to overlay face-up over face-down with offset.
        4. Run tests to confirm pass.

**Open Questions**
- None.
