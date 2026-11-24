# Roadmap

1. Foundation — repository, documentation, TypeScript/Vite entry point, tests, Windows launcher. Windows launcher verified by user.
2. Virtual tabletop — implemented Exit room SVG, nodes, pieces, pan/zoom and spot inspection; user reported working.
3. Local multiplayer — implemented setup, turn rotation, legal one-step movement, occupancy; user reported working.
4. Exploration — complete; user reported working.
5. Tokens — implemented hidden supply, encounters and relics; v0.6.6 replaces manual die-driven token placement with 1–2 automatic random hidden tokens on room placement and one automatic token at each late-phase turn start; user reported working.
6. Effects — implemented traps, items, reactions, forced movement and drops; v0.6.3 adds single-click Possession destination selection within four steps; local verification pending.
7. Full loop — implemented in v0.7.0: victory after encounters, forced-movement victory, game-over lockout, late-phase integration tests, local autosave, resume and restart; local verification pending.
8. Polish — artwork, sound, tests, balancing and local distribution.
