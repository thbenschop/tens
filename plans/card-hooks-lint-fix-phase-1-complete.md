## Phase 1 Complete: Specify missing-card rendering

Captured expected behavior for absent cards by defining placeholder requirements in tests without prescribing styling details.

**Files created/changed:**
- client/src/components/ui/Card.test.js

**Functions created/changed:**
- None (tests only)

**Tests created/changed:**
- renders a placeholder when card is missing

**Review Status:** APPROVED

**Git Commit Message:**
test: add placeholder expectation for missing card

- Add tests describing placeholder X for null/undefined cards
- Ensure face/back elements are absent when card is missing
- Avoid styling assumptions while defining expected behavior
