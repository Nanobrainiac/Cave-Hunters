# Technical design

TypeScript with Vite, SVG/HTML/CSS, Vitest, local browser hosting. No backend. Separate pure engine from UI; commands validate against authoritative local state and return state/events. UI renders legal actions, not direct mutations. Future server migration is possible, not implemented.

Room templates define normalized node coordinates, internal edges, edge ports; room instances define grid position and quarter-turn rotation. Unique global node IDs link rooms. Use breadth-first search for shortest legal drop distances and reachable connections. Track player position, inventory, relics, statuses, turn owner, decision owner, phase, room deck, token supply, board objects, pending effects and winner. Inject randomness for repeatable tests. Hidden token identities must not appear in rendered UI; local browser storage/devtools are not a security boundary.

Turn state machine: start effects and late placement (precedence to finalize), item/move actions, encounter and defensive reactions, victory check, discovery, seeding, remaining legal item actions, end turn. Pause on pending player decisions. Resolve forced steps individually. Save versioned snapshots locally in later phase; validate saves and avoid persisting transient UI. No offline reload guarantee until offline caching is implemented.

Test component counts, graph rotation/alignment, occupancy, one-step movement, turn progression, token secrecy, drop priorities, reaction chains and victory. Tests and builds run manually on the player's local machine. No GitHub Actions or Pages.
