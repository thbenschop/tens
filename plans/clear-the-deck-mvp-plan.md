## Plan: Clear the Deck - Multiplayer Card Game MVP

This plan implements a browser-based multiplayer card game with React frontend and Go backend using WebSockets for real-time gameplay. The MVP focuses on core gameplay mechanics with 3-10 players, ensuring all critical game rules are enforced through test-driven development.

**Tech Stack:** React + Tailwind CSS + Go + WebSockets  
**Approach:** Test-Driven Development (TDD) - Write tests first, implement minimal code, verify tests pass

---

## Phases (7 phases)

### Phase 1: Project Foundation & Environment Setup
**Objective:** Set up project structure, development environment, and establish basic WebSocket connection between React client and Go server.

**Files/Functions to Modify/Create:**
- `server/cmd/main.go` - Go server entry point with WebSocket endpoint
- `server/internal/models/room.go` - Room model structure
- `server/internal/handlers/websocket.go` - WebSocket connection handler
- `server/go.mod` - Go dependencies
- `client/src/hooks/useWebSocket.js` - WebSocket connection hook
- `client/src/App.js` - Main React app component
- `client/package.json` - React dependencies (Tailwind CSS)
- `.env.example` - Environment variable template

**Tests to Write:**
- `server/internal/handlers/websocket_test.go` - WebSocket connection tests
- `client/src/hooks/useWebSocket.test.js` - Hook connection tests

**Steps:**
1. Write test for Go WebSocket server connection handling (should fail - no server exists)
2. Create Go server with WebSocket endpoint and basic connection handling
3. Run test to verify WebSocket connection succeeds
4. Write test for React useWebSocket hook connection (should fail - no hook exists)
5. Create useWebSocket hook that connects to server
6. Run test to verify hook connects successfully
7. Add linting and formatting configuration
8. Set up Tailwind CSS in React project

---

### Phase 2: Room Management System
**Objective:** Implement room creation, joining with 6-character codes, lobby display, and host game start functionality.

**Files/Functions to Modify/Create:**
- `server/internal/models/room.go` - Room struct with players array, code, host ID
- `server/internal/services/roomService.go` - CreateRoom(), JoinRoom(), LeaveRoom(), GetRoom()
- `server/internal/handlers/room.go` - Room message handlers
- `server/internal/utils/codegen.go` - GenerateRoomCode() function
- `client/src/components/lobby/CreateRoom.js` - Room creation UI
- `client/src/components/lobby/JoinRoom.js` - Room joining UI
- `client/src/components/lobby/Lobby.js` - Pre-game lobby display
- `client/src/hooks/useGameState.js` - Game state management hook

**Tests to Write:**
- `server/internal/utils/codegen_test.go` - Test 6-character code generation (unique, alphanumeric)
- `server/internal/services/roomService_test.go` - Test room creation, joining, validation
- `server/internal/handlers/room_test.go` - Test room WebSocket message handling
- `client/src/components/lobby/CreateRoom.test.js` - Test room creation component
- `client/src/components/lobby/JoinRoom.test.js` - Test room joining with code validation

**Steps:**
1. Write test for GenerateRoomCode() (should fail - function doesn't exist)
2. Implement GenerateRoomCode() to create unique 6-character codes
3. Run test to verify codes are generated correctly
4. Write test for CreateRoom() service function (should fail)
5. Implement CreateRoom() with room model and code generation
6. Run test to verify room creation
7. Write test for JoinRoom() validation (should fail)
8. Implement JoinRoom() with code validation and player addition
9. Run test to verify joining works and invalid codes are rejected
10. Write test for lobby WebSocket message flow (should fail)
11. Implement WebSocket handlers for CREATE_ROOM, JOIN_ROOM, LEAVE_ROOM
12. Run test to verify messages are processed correctly
13. Write test for CreateRoom component (should fail)
14. Implement CreateRoom UI component with Tailwind styling
15. Run test to verify component renders and submits
16. Write test for JoinRoom component (should fail)
17. Implement JoinRoom UI component with Tailwind styling
18. Run test to verify component validates and submits
19. Implement Lobby component showing connected players and host controls

---

### Phase 3: Deck & Dealing System
**Objective:** Implement deck generation based on player count, shuffling algorithm, and card dealing sequence (4 face-down, 4 face-up, 12 to hand).

**Files/Functions to Modify/Create:**
- `server/internal/models/card.go` - Card struct (suit, value, id)
- `server/internal/models/player.go` - Player struct with hand, tableCardsUp, tableCardsDown
- `server/internal/models/game.go` - Game struct with deck, discard pile, center pile
- `server/internal/utils/deck.go` - CreateDeck(), ShuffleDeck(), DealCards()
- `server/internal/services/gameService.go` - StartGame(), InitializeRound()
- `client/src/utils/constants.js` - Card values and game constants

**Tests to Write:**
- `server/internal/utils/deck_test.go` - Test deck creation (correct count based on players), shuffling, dealing
- `server/internal/services/gameService_test.go` - Test game start and card distribution
- Test dealing sequence: 4 face-down → 4 face-up → 12 hand per player
- Test remaining cards become discard pile

**Steps:**
1. Write test for CreateDeck() with player count (should fail)
2. Implement CreateDeck() that returns 2/3/4 decks based on player count (3-5=2, 6-7=3, 8-10=4)
3. Run test to verify correct number of cards created
4. Write test for ShuffleDeck() producing random distribution (should fail)
5. Implement ShuffleDeck() using Fisher-Yates algorithm
6. Run test to verify shuffling randomness
7. Write test for DealCards() distributing cards correctly (should fail)
8. Implement DealCards() following the 4+4+12 sequence per player
9. Run test to verify each player gets 20 cards in correct locations
10. Write test for StartGame() initializing game state (should fail)
11. Implement StartGame() that creates deck, shuffles, deals, and initializes game
12. Run test to verify game starts with correct state
13. Add WebSocket handler for START_GAME message
14. Broadcast GAME_STARTED with initial state to all players

---

### Phase 4: Core Game Logic & Validation
**Objective:** Implement turn management, card play validation (equal/lesser rule), set detection, pile pickup, wild tens, and face-down card flipping.

**Files/Functions to Modify/Create:**
- `server/internal/services/gameService.go` - PlayCards(), FlipFaceDown(), ValidatePlay(), DetectSet(), ClearDeck(), PickupPile()
- `server/internal/utils/validator.go` - IsValidPlay(), AllSameValue(), IsSet()
- `server/internal/handlers/game.go` - PLAY_CARDS and FLIP_FACE_DOWN handlers
- `client/src/utils/gameLogic.js` - Client-side validation helpers
- `client/src/utils/cardUtils.js` - Card sorting and grouping functions

**Tests to Write:**
- `server/internal/utils/validator_test.go`:
  - Test IsValidPlay() with equal value (pass)
  - Test IsValidPlay() with lesser value (pass)
  - Test IsValidPlay() with greater value (fail)
  - Test IsValidPlay() with wild tens (always pass)
  - Test IsValidPlay() with first play (always pass)
  - Test AllSameValue() with matching cards (pass) and mixed (fail)
- `server/internal/services/gameService_test.go`:
  - Test DetectSet() with 4+ same value (detect set)
  - Test DetectSet() with less than 4 same value (no set)
  - Test set detection across multiple player turns
  - Test ClearDeck() removes cards and grants additional turn
  - Test PickupPile() adds cards to hand and grants additional turn
  - Test FlipFaceDown() reveals card and enforces play
  - Test PlayCards() with valid play updates game state
  - Test PlayCards() with invalid play returns error

**Steps:**
1. Write test for AllSameValue() helper (should fail)
2. Implement AllSameValue() to check all cards have same value
3. Run test to verify validation works
4. Write test for IsValidPlay() with various scenarios (should fail)
5. Implement IsValidPlay() with equal/lesser rule, wild tens, first play exception
6. Run test to verify all validation cases pass
7. Write test for DetectSet() with accumulated center pile (should fail)
8. Implement DetectSet() checking for 4+ cards of same value
9. Run test to verify set detection including cross-player accumulation
10. Write test for PlayCards() happy path (should fail)
11. Implement PlayCards() that validates, updates state, detects sets
12. Run test to verify card play updates center pile correctly
13. Write test for PlayCards() triggering set clear (should fail)
14. Implement ClearDeck() that moves center pile to discard and grants additional turn
15. Run test to verify clearing works and turn stays with player
16. Write test for PlayCards() with higher value triggering pickup (should fail)
17. Implement PickupPile() that adds center cards to hand and grants additional turn
18. Run test to verify pile pickup works correctly
19. Write test for FlipFaceDown() revealing card (should fail)
20. Implement FlipFaceDown() that reveals card and validates play
21. Run test to verify face-down flip mechanism works
22. Write test for wild tens clearing deck (should fail)
23. Implement wild tens special handling in PlayCards()
24. Run test to verify tens clear deck regardless of last value
25. Implement WebSocket handlers for PLAY_CARDS and FLIP_FACE_DOWN
26. Broadcast state updates after each action

---

### Phase 5: Win Detection & Scoring System
**Objective:** Implement win condition (0 cards remaining), round-end scoring calculation with correct point values, cumulative scoring, and dealer rotation.

**Files/Functions to Modify/Create:**
- `server/internal/services/gameService.go` - CheckWinCondition(), CalculateScore(), EndRound(), StartNextRound()
- `server/internal/utils/scorer.go` - GetCardValue() function for scoring
- `client/src/components/game/ScoreBoard.js` - Score display component
- `client/src/components/game/PlayerInfo.js` - Player score display

**Tests to Write:**
- `server/internal/utils/scorer_test.go`:
  - Test GetCardValue() for number cards (2-9)
  - Test GetCardValue() for face cards (J=11, Q=12, K=13)
  - Test GetCardValue() for Ace (1)
  - Test GetCardValue() for Ten (20 points)
- `server/internal/services/gameService_test.go`:
  - Test CheckWinCondition() with 0 cards (win)
  - Test CheckWinCondition() with remaining cards (continue)
  - Test CalculateScore() includes hand + face-up + face-down cards
  - Test CalculateScore() with tens worth 20 points
  - Test EndRound() calculates all player scores
  - Test winner receives 0 points
  - Test StartNextRound() rotates dealer clockwise
  - Test cumulative score tracking across rounds

**Steps:**
1. Write test for GetCardValue() with all card types (should fail)
2. Implement GetCardValue() returning correct point values (Ten=20)
3. Run test to verify all card values are correct
4. Write test for CheckWinCondition() (should fail)
5. Implement CheckWinCondition() checking if player has 0 total cards
6. Run test to verify win detection when all cards played
7. Write test for CalculateScore() counting all cards (should fail)
8. Implement CalculateScore() summing hand + tableCardsUp + tableCardsDown
9. Run test to verify score calculation includes all cards
10. Write test for EndRound() with winner receiving 0 points (should fail)
11. Implement EndRound() that calculates scores and sets winner to 0
12. Run test to verify round ending logic
13. Write test for dealer rotation (should fail)
14. Implement StartNextRound() that increments dealer index clockwise
15. Run test to verify dealer rotates correctly
16. Implement WebSocket handler for ROUND_END message
17. Broadcast round scores to all players
18. Create ScoreBoard component with Tailwind styling
19. Display round results and cumulative scores

---

### Phase 6: Game UI Components & Card Interaction
**Objective:** Build React UI components for game board, card display, card selection, and player interactions with responsive design.

**Files/Functions to Modify/Create:**
- `client/src/components/game/GameBoard.js` - Main game layout
- `client/src/components/game/PlayerHand.js` - Player's 12-card hand display
- `client/src/components/game/TableCards.js` - Face-up and face-down cards display
- `client/src/components/game/CenterPile.js` - Center pile with card order
- `client/src/components/game/PlayerInfo.js` - Player name, card counts, turn indicator
- `client/src/components/ui/Card.js` - Individual card component with CSS rendering
- `client/src/components/ui/CardSelector.js` - Multi-select interface
- `client/src/styles/game.css` - Game layout styles
- `client/src/styles/cards.css` - Card visual styles

**Tests to Write:**
- `client/src/components/ui/Card.test.js` - Test card rendering with different suits/values
- `client/src/components/ui/CardSelector.test.js` - Test multi-select behavior
- `client/src/components/game/PlayerHand.test.js` - Test hand display and selection
- `client/src/components/game/CenterPile.test.js` - Test center pile card order display
- `client/src/components/game/TableCards.test.js` - Test face-up vs face-down rendering
- `client/src/components/game/GameBoard.test.js` - Test overall layout and state updates

**Steps:**
1. Write test for Card component rendering (should fail)
2. Implement Card component with CSS-based card display (suit symbols, value)
3. Run test to verify cards render correctly
4. Write test for CardSelector multi-select (should fail)
5. Implement CardSelector with click/tap to toggle selection
6. Run test to verify multiple cards can be selected
7. Write test for PlayerHand displaying sorted cards (should fail)
8. Implement PlayerHand component with card sorting and selection
9. Run test to verify hand displays correctly
10. Write test for TableCards showing face-up vs face-down (should fail)
11. Implement TableCards with visual distinction (face-down shows card back)
12. Run test to verify face-down cards don't reveal values
13. Write test for CenterPile showing card order (should fail)
14. Implement CenterPile displaying all cards with visible stacking
15. Run test to verify center pile shows correct order
16. Write test for PlayerInfo showing turn indicator (should fail)
17. Implement PlayerInfo with highlighted current player
18. Run test to verify turn indicator displays correctly
19. Write test for GameBoard layout (should fail)
20. Implement GameBoard arranging all components responsively
21. Run test to verify layout works on different screen sizes
22. Add CSS animations for card movements
23. Implement mobile-friendly touch interactions
24. Test responsive design on mobile and desktop

---

### Phase 7: Integration & Full Game Flow
**Objective:** Integrate all components and services into complete game loop, implement error handling, and ensure real-time synchronization across all clients.

**Files/Functions to Modify/Create:**
- `client/src/App.js` - Complete game flow orchestration
- `client/src/hooks/useGameState.js` - State management with WebSocket updates
- `server/internal/handlers/game.go` - Complete game action handlers
- `server/internal/services/gameService.go` - Full game loop coordination
- Error handling and user feedback throughout

**Tests to Write:**
- End-to-end integration tests:
  - Complete 3-player game from lobby to round end
  - Set clearing scenario with multiple players
  - Pile pickup scenario
  - Face-down card reveal scenarios
  - Wild tens clearing deck
  - Multiple additional turns in sequence
  - Full synchronization across 3 clients
- Error handling tests:
  - Invalid card play shows error message
  - Disconnected player handling
  - Out-of-turn action rejection

**Steps:**
1. Write E2E test for complete game flow (should fail)
2. Connect all WebSocket handlers to game service functions
3. Implement state broadcasting after each game action
4. Run test to verify game flows from start to end
5. Write test for set clearing across players (should fail)
6. Verify set detection and clearing works in integration
7. Run test to verify set clearing works correctly
8. Write test for face-down card flip integration (should fail)
9. Implement face-down flip UI and WebSocket flow
10. Run test to verify face-down flipping works end-to-end
11. Write test for error handling (should fail)
12. Implement error messages and validation feedback in UI
13. Run test to verify errors are displayed correctly
14. Write test for multi-client synchronization (should fail)
15. Verify state updates broadcast to all connected clients
16. Run test to verify all clients stay synchronized
17. Implement loading states and transitions
18. Add visual feedback for valid/invalid moves
19. Test full game with 3+ players locally
20. Fix any bugs discovered during integration testing
21. Run full test suite and ensure all tests pass
22. Lint and format all code

---

## Decisions Made

1. **Ten Scoring Value:** 20 points (per game rules)
2. **Card Styling:** Styled CSS cards with Tailwind framework
3. **CSS Framework:** Tailwind CSS (simple and flexible)
4. **Minimum Players:** 3-10 players enforced
5. **Game End Mode:** Rounds mode (target score deferred to post-MVP)
6. **Disconnect Timeout:** 60 seconds before removing player

---

## Success Criteria

- [ ] 3-10 players can join and play simultaneously
- [ ] All game rules from GAME_RULES.md are correctly implemented
- [ ] Game state stays synchronized across all clients
- [ ] Responsive on mobile and desktop browsers
- [ ] Handle player disconnection (60s timeout)
- [ ] Score calculation matches rules exactly (tens = 20 points)
- [ ] UI is intuitive with styled CSS cards
- [ ] No game-breaking bugs in core gameplay
- [ ] All tests pass for each phase
- [ ] Code is linted and formatted
