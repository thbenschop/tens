## Phase 2 Complete: Refactor Card hooks

Moved Card hooks to run unconditionally and added placeholder rendering for missing cards, keeping click/double-click behavior intact.

**Files created/changed:**
- client/src/components/ui/Card.js
- client/src/styles/cards.css

**Functions created/changed:**
- Card component: unconditional hooks, placeholder rendering for missing cards

**Tests created/changed:**
- None (Card tests now pass with new placeholder behavior)

**Review Status:** APPROVED

**Git Commit Message:**
feat: render placeholder when card missing

- Refactor Card hooks to run unconditionally per lint rules
- Render red X placeholder for null/undefined cards and relax prop types
- Keep click/double-click behavior for real cards and clean up timers
