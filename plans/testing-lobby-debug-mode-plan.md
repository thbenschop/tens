## Plan: Testing Lobby Debug Mode

Adds a special “testing lobby” mode created from the client UI via a dedicated button. In this mode, only the host can participate; the host can add/remove synthetic players server-side and send host-override actions (strict turn) for any player. Testing lobbies are hard-rejected for joins and are deleted when the host disconnects.

**Phases**
1. **Phase 1: Protocol + Room Metadata**
    - **Objective:** Add a dedicated “create testing lobby” protocol message and persist a testing flag on rooms returned to the client.
    - **Files/Functions to Modify/Create:**
        - server/internal/handlers/room.go (create handler + response payload)
        - server/internal/services/roomService.go (room creation entry)
        - server/internal/models/room.go (room metadata)
        - client/src/hooks/useGameState.js (create message)
        - client/src/App.js (new create button wiring)
    - **Tests to Write:**
        - Server: creating a testing room returns room marked as testing
        - Client: “Create Testing Lobby” triggers the correct websocket message
    - **Steps:**
        1. Write failing tests for the new create-testing message and testing flag.
        2. Implement minimal server changes to create and return a testing room.
        3. Implement minimal client changes to send the create-testing message.
        4. Re-run targeted tests to confirm passing.

2. **Phase 2: Isolation + Host Disconnect Cleanup**
    - **Objective:** Enforce hard reject of all JOIN attempts for testing rooms and delete testing rooms when the host disconnects.
    - **Files/Functions to Modify/Create:**
        - server/internal/handlers/room.go (join handler gate, disconnect/leave path)
        - server/internal/services/roomService.go (delete testing room on host leave)
    - **Tests to Write:**
        - Join attempts to testing room receive ERROR
        - Host disconnect deletes testing room
    - **Steps:**
        1. Write failing tests for join rejection and room deletion on host disconnect.
        2. Implement join gating for testing rooms.
        3. Implement deletion behavior for testing rooms on host leave.
        4. Re-run server tests.

3. **Phase 3: Synthetic Players (Add/Remove)**
    - **Objective:** Allow host to add and remove synthetic players in a testing lobby without additional websocket connections.
    - **Files/Functions to Modify/Create:**
        - server/internal/handlers/room.go (new message types)
        - server/internal/services/roomService.go (add/remove synthetic player helpers)
        - client/src/components/lobby/Lobby.js (host-only testing controls)
        - client/src/hooks/useGameState.js (send messages, update state)
    - **Tests to Write:**
        - Server: add/remove synthetic players updates room player list; only host allowed; max player limit enforced
        - Client: testing controls render only for testing host
    - **Steps:**
        1. Write failing server tests for add/remove synthetic players and authorization.
        2. Implement server message handlers and service helpers.
        3. Write failing client tests for rendering and actions.
        4. Implement lobby UI and hook wiring.
        5. Re-run targeted tests.

4. **Phase 4: Host Controls All Players (Strict Turn)**
    - **Objective:** Add host-only testing actions to play/flip on behalf of any target player while preserving strict turn enforcement.
    - **Files/Functions to Modify/Create:**
        - server/internal/handlers/game.go (new message types)
        - client/src/components/game/GameBoard.js (act-as control + send host override actions)
        - client/src/hooks/useGameState.js (new action senders)
    - **Tests to Write:**
        - Server: host override actions update game; non-host rejected; out-of-turn actions rejected
        - Client: act-as selection changes target for host override actions
    - **Steps:**
        1. Write failing server tests for host override action authorization and turn rules.
        2. Implement server host override handlers calling existing game logic with target player.
        3. Write failing client tests for act-as selection and message payloads.
        4. Implement UI control and hook wiring.
        5. Re-run targeted tests.

5. **Phase 5: Polish + Error Messaging**
    - **Objective:** Improve UX around testing mode: clear labeling, safe defaults, and consistent ERROR messages.
    - **Files/Functions to Modify/Create:**
        - client/src/components/lobby/Lobby.js
        - client/src/App.js
        - server/internal/handlers/room.go
    - **Tests to Write:**
        - Client: error messages displayed for rejected joins
    - **Steps:**
        1. Add/adjust tests for error UX.
        2. Implement small UI and message improvements.
        3. Re-run tests.

**Open Questions**
1. Host reconnect allowed? No (testing room deleted when host disconnects).
2. Host override turn rules? Strict turn.
3. Synthetic players removable? Yes.
4. Join behavior for testing rooms? Hard reject.
