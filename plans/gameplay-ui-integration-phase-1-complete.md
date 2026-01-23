## Phase 1 Complete: Card UI Foundations

Built the card UI primitives with selection and play interactions, minimal styling, and stacking/slide visuals, covered by component tests.

**Files created/changed:**
- client/src/components/ui/Card.js
- client/src/components/ui/CardSelector.js
- client/src/components/ui/Card.test.js
- client/src/components/ui/CardSelector.test.js
- client/src/components/game/PlayerHand.js
- client/src/components/game/PlayerHand.test.js
- client/src/components/game/TableCards.js
- client/src/components/game/TableCards.test.js
- client/src/components/game/CenterPile.js
- client/src/components/game/CenterPile.test.js
- client/src/styles/cards.css
- client/src/styles/game.css

**Functions created/changed:**
- Card component (single-tap select, double-tap play, face-up/down rendering)
- CardSelector component (multi-select with value grouping, play dispatch)
- PlayerHand component (sorted rendering, selection/play plumbing)
- TableCards component (face-up/down split rendering)
- CenterPile component (stacked center pile with visual layering)

**Tests created/changed:**
- Card renders/interaction coverage
- CardSelector selection and play behaviors
- PlayerHand sorting/selection/play integration
- TableCards face-up vs face-down rendering
- CenterPile order preservation

**Review Status:** APPROVED

**Git Commit Message:**
feat: add card UI primitives

- add card, selector, hand, table, and center pile components
- implement minimal card styling with stacking visuals
- cover selection and play interactions with component tests
