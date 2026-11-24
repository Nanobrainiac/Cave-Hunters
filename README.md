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

Phase 1 is the project foundation, not a playable match. See [design](docs/GDD-v0.3.md), [technical design](docs/TECHNICAL-DESIGN.md), [decisions](docs/DECISIONS.md), and [roadmap](docs/ROADMAP.md).

No backend, accounts, or networking. GitHub is source storage only. On Windows, download the repository ZIP, extract it, and double-click Launch-Cave-Hunters.cmd. The launcher installs missing local dependencies and starts the loopback-only game server.
