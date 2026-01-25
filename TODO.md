<!-- 1. Fix vulnerabilities raised by `npm install`  -->
1. Playing face up cards is not possible, it should be allowed to play a face up card as though it was in the player's hand.
2. When a higher card than the current stack low value is played, the higher card (and all those matching) should be left in the stack. The turn is then over. However if there are enough cards to create a set (4+ identical card values) then the stack should be cleared, and the player will get another turn. Update the `GAME_RULES.md` to reflect this behavior if needed.
4. Connection issue popups show up on lobby screens, even when a valid connection is made and the "connected" status light is on.
5. Overhaul of the gameplay interface, it should look more like a poker table with players sitting in a circle. Visualize the face down + face up cards on the table as the face up cards partially covering the face down. Players should be able to see all face up & face down cards on the table, not just their own.
6. 