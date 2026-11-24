# Cave Hunters — GDD v0.3

Approved direction: 2–6 local players, shared screen and mouse, top-down 2D browser game. No network, accounts, health, currency or ordinary attacks. Original v0.2 remains the gameplay baseline.

## Setup and board
Separate Exit room with six distinct starting positions and a winning spot. Shuffle 30 square room cards (10 corridors, 8 turns, 8 open areas, 4 dead ends) and 54 tokens (30 traps, 20 items, 4 relics) independently. No starting hands. Turn order follows seating order after choosing first player. Rooms occupy grid cells; movement uses linked nodes and aligned edge connections. Rotate rooms to connect; dead ends allowed.

## Turns and exploration
Exactly one linked step unless blocked or affected by an effect; no shared player spot. Resolve encountered tokens before discovery. On reaching an unused connection, draw a room, place if legal, otherwise discard and end turn. Successful placement grants no extra move and triggers a die roll [0,0,1,1,2,2]. Blind-place that many available tokens on empty existing spots anywhere, including Exit. No stacking. When deck is exhausted or no reachable unused connections remain, subsequent turns begin with one blind token placement instead. Empty supply skips placement.

## Effects
Traps are removed after resolving: Snare skips next turn; Grasping Hands drops equipment; Relic Curse drops relic; Cave-In moves back one spot if possible; Possession lets the player to the left choose next move. Missing object means no effect. Equipment is unlimited and single-use: Lantern reveals a token on current room or adjacent spot; Protective Charm cancels trap; Rusty Blade displaces rival up to four linked steps on existing rooms; Thief's Hook steals item or relic on same room; Smoke Bomb cancels targeted item attack. Multiple items per turn; ordinary movement is not consumed; defensive reactions can occur out of turn. Resolve tokens encountered during forced movement; no expansion from forced movement.

## Drops and victory
Drop to eligible empty existing spot at shortest legal distance exactly 4, then 3, 2, 1. Affected player chooses trap-caused destination; responsible rival chooses player-caused destination. Dropped objects are visible and recoverable. Relics persist. First player returning to original winning spot with at least two relics wins after encounter resolution; Exit is not protected.

## Digital experience
Main menu, player setup, shared board with active player, inventory, public relic counts, log and camera pan/zoom. Highlight legal targets. Engine validates actions and pauses for reactions. See technical design and decisions for implementation details. Phase 1 is infrastructure only.
