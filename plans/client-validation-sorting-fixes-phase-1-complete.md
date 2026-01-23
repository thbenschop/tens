## Phase 1 Complete: Value/Suit Mapping and Sorting

Rank/suit mapping now uses capitalized suits with deterministic order; sorting/grouping and display helpers consume the shared mapping with tests locking behavior.

**Files created/changed:**
- client/src/utils/constants.js
- client/src/utils/cardUtils.js
- client/src/utils/cardUtils.test.js

**Functions created/changed:**
- getCardValue
- getCardPoints
- getSuitSymbol
- sortCards
- groupByValue
- groupBySuit
- getCardShortName
- getCardColor
- getSuggestedPlays

**Tests created/changed:**
- cardUtils.test.js (value mapping, suit order, sorting with invalid cards deferred, grouping by rank, display helpers, suggested plays)

**Review Status:** APPROVED

**Git Commit Message:**
feat: align card mapping and sorting

- Add rank/suit constants with deterministic order and point mapping
- Update card utilities to use shared mapping for sorting/grouping/display
- Add utility tests covering mapping, suit order, sorting, grouping, and suggestions
