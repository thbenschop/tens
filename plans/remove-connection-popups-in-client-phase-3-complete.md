## Phase 3 Complete: Clean up helper text and edge cases

Removed remaining banner-style connection copy while keeping the status light (with an accessible label) and the small helper text under the home buttons intact.

**Files created/changed:**
- client/src/App.js
- client/src/App.test.js

**Functions created/changed:**
- App connection status display (aria-label/test id) and menu helper text handling

**Tests created/changed:**
- App integration: status light labeled without banner text; helper text persists; alert-free error handling remains

**Review Status:** APPROVED

**Git Commit Message:**
feat: rely on status light only

- remove remaining banner-like connection copy from header
- keep helper text under home buttons and status light with aria label
- update app integration tests for banner-free status display
