import './styles/main.css';
import { RULES } from './data/config';
const app = document.querySelector<HTMLElement>('#app');
if (!app) throw new Error('Missing app root');
app.innerHTML = `<section><p class="eyebrow">LOCAL MULTIPLAYER · DEVELOPMENT BUILD</p><h1>Cave Hunters</h1><p>Explore. Recover. Escape.</p><hr><p>${RULES.minPlayers}–${RULES.maxPlayers} players · One screen · One mouse</p><p class="status">Phase 1 — Project foundation</p><button disabled>New Game — coming in a later phase</button></section>`;
