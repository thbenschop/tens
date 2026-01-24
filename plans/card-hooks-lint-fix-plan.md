## Plan: Card Hooks Lint Fix

Resolve the ESLint hook ordering errors in Card by defining expected missing-card UI (red X placeholder) and refactoring hooks safely under test coverage.

**Phases 3**
1. **Phase 1: Specify missing-card rendering**
    - **Objective:** Define and lock in behavior for when `card` is absent by adding a placeholder expectation to tests.
    - **Files/Functions to Modify/Create:** client/src/components/ui/Card.test.js
    - **Tests to Write:** renders placeholder X when card prop missing
    - **Steps:**
        1. Add a test covering rendering when `card` is null/undefined and assert the placeholder is shown.
        2. Run the test to see it fail or confirm current behavior.
        3. Adjust expectation if needed so the test captures the desired placeholder behavior.

2. **Phase 2: Refactor Card hooks**
    - **Objective:** Move hook calls out of conditional flow to satisfy hook rules while preserving click/double-click behavior and placeholder rendering.
    - **Files/Functions to Modify/Create:** client/src/components/ui/Card.js
    - **Tests to Write:** None new; rely on Phase 1 plus existing Card tests.
    - **Steps:**
        1. Run tests to ensure baseline failures only stem from the new placeholder test.
        2. Refactor to call `useRef`/`useEffect` unconditionally and render placeholder when `card` is missing.
        3. Run tests to confirm passing and rerun lint to verify hook rule cleared.

3. **Phase 3: Verification**
    - **Objective:** Ensure dev workflow is clean with hooks lint resolved.
    - **Files/Functions to Modify/Create:** none
    - **Tests to Write:** none
    - **Steps:**
        1. Run test suite once more.
        2. Run lint (npm run lint or npm start) to confirm no hook violations.
        3. Summarize outcomes.

**Open Questions**
1. None (missing-card UI will display a red X placeholder).