## Phase 5 Complete: Win Detection & Scoring System

Implemented comprehensive win detection, scoring calculation, round end logic, and dealer rotation using Test-Driven Development. All 36 new tests passing, with correct scoring rules (tens worth 25 points) and proper win detection timing integrated into the game flow.

**Files created/changed:**
- server/internal/utils/scorer.go (NEW)
- server/internal/utils/scorer_test.go (NEW)
- server/internal/models/room.go
- server/internal/services/gameService.go
- server/internal/services/gameService_test.go
- server/internal/handlers/game.go
- server/internal/handlers/room.go

**Functions created/changed:**
- scorer.GetCardPointValue() - Returns point value for cards (A=1, 2-9=face, 10=25, J=11, Q=12, K=13)
- scorer.CalculatePlayerScore() - Sums points from all player card locations
- gameService.CheckWinCondition() - Returns true if player has 0 cards remaining
- gameService.EndRound() - Calculates scores (winner=0, others=remaining cards), updates totals
- gameService.StartNextRound() - Increments round, rotates dealer clockwise, resets scores, deals cards
- gameService.PlayCards() - Integrated win checking after deck clears
- gameService.FlipFaceDown() - Integrated win checking after deck clears
- handlers.broadcastRoundEnd() - Sends ROUND_END message with winner, scores, round number
- handlers.handleNextRound() - Host-only function to start next round

**Tests created/changed:**
- TestGetCardPointValue_AllValues (scorer_test.go) - Verifies all 13 card point values
- TestCalculatePlayerScore_EmptyHands (scorer_test.go) - Tests player with no cards
- TestCalculatePlayerScore_CardsInHand (scorer_test.go) - Tests scoring cards in hand
- TestCalculatePlayerScore_CardsOnTableUp (scorer_test.go) - Tests scoring face-up table cards
- TestCalculatePlayerScore_CardsOnTableDown (scorer_test.go) - Tests scoring face-down table cards
- TestCalculatePlayerScore_CardsInMultipleLocations (scorer_test.go) - Tests mixed card locations
- TestCheckWinCondition (gameService_test.go) - 4 subtests for win detection in various scenarios
- TestEndRound (gameService_test.go) - 3 subtests for scoring calculation and cumulative totals
- TestStartNextRound (gameService_test.go) - 4 subtests for dealer rotation and round management
- Updated TestPlayCards (gameService_test.go) - Adjusted for win detection integration
- Updated TestFlipFaceDown (gameService_test.go) - Adjusted for win detection integration

**Review Status:** APPROVED

**Git Commit Message:**
feat: Implement win detection and scoring system

- Add scorer utility with correct point values (tens=25 points)
- Implement win condition checking (0 cards remaining)
- Add round end logic with winner scoring (0 points) and cumulative totals
- Implement dealer rotation (clockwise) for next round
- Integrate win detection into PlayCards and FlipFaceDown handlers
- Add WebSocket handlers for round end and next round start (ROUND_END, NEXT_ROUND, ROUND_STARTED)
- All 36 new tests passing with full backend test suite
