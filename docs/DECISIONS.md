# Decisions

Approved: local shared-screen/mouse multiplayer, 2–6 players, top-down 2D, TypeScript/Vite/SVG/CSS, local loopback hosting, no accounts/backend. User agreed to v0.3 direction.

Adopted prototype defaults from agreed direction, subject to playtest: public equipment and Lantern discoveries; six copies per trap and four per item; same-room Rusty Blade targeting, occupied nodes block forced paths, resolve each step and revalidate; skip placement if full, cancel drop if no destination; retry failed room draw from same connection consuming normal move. Exit design must support six starts and winning spot; exact geometry pending.

Still open: exact room templates and Exit layout; precise item timing and skip-turn precedence; forced-movement victory; permanent blocking; reachability definition and multi-edge placement conflicts. Do not silently encode unresolved rules as final.
