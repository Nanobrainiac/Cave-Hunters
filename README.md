# Cave Hunters

A competitive top-down 2D browser board game for 2–6 local players sharing one screen and mouse. Recover at least two relics and return to the original Exit.

## Development

Requires Node.js 22.12+ and npm.

```sh
npm install
npm run dev
npm test
npm run build
```

Phase 6 adds trap effects, equipment activation, defensive reactions, forced movement and dropped objects. Possession immediately lets the player to the left select any highlighted destination within four legal linked steps; movement resolves automatically along a shortest route (v0.6.3). Placing a room now automatically spawns one or two hidden tokens on random empty board spots; after expansion, one spawns automatically each turn (v0.6.6). Victory and saves remain Phase 7. See [design](docs/GDD-v0.3.md), [technical design](docs/TECHNICAL-DESIGN.md), [decisions](docs/DECISIONS.md), and [roadmap](docs/ROADMAP.md).

No backend, accounts, or networking. GitHub is source storage only. On Windows, download the repository ZIP, extract it, and double-click Launch-Cave-Hunters.cmd. The launcher installs missing local dependencies and starts the loopback-only game server.
