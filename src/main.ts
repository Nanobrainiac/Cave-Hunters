import './styles/main.css';
import { RULES } from './data/config';
import { EXIT_ROOM, PLAYER_COLORS } from './data/rooms';
import { renderBoard } from './ui/board';
import { attachCamera } from './ui/camera';
const app=document.querySelector<HTMLElement>('#app');
if(!app)throw new Error('Missing app root');
app.innerHTML=`<header><div><p class="eyebrow">LOCAL MULTIPLAYER / PHASE 2</p><h1>Cave Hunters</h1></div><span class="tag">TABLETOP PROTOTYPE</span></header><div class="layout"><section class="tabletop" aria-label="Cave tabletop"><div class="boardbar"><strong>Cave map</strong><span>1 room explored</span></div><svg id="board" aria-label="Interactive Exit room" xmlns="http://www.w3.org/2000/svg"></svg><div class="camera"><button id="minus" aria-label="Zoom out">−</button><span id="zoom">100%</span><button id="plus" aria-label="Zoom in">+</button><button id="reset">Recenter</button><span class="hint">Drag to pan · Scroll to zoom</span></div></section><aside><h2>Tabletop setup</h2><label for="count">Preview player count</label><select id="count">${Array.from({length:RULES.maxPlayers-RULES.minPlayers+1},(_,i)=>i+RULES.minPlayers).map(n=>`<option value="${n}" ${n===6?'selected':''}>${n} players</option>`).join('')}</select><div id="players"></div><hr><h2>Map legend</h2><p><span class="dot ordinary-dot"></span> Movement spot</p><p><span class="dot connection-dot"></span> Connection spot</p><p><span class="dot exit-dot"></span> Winning Exit</p><hr><h2>Selected spot</h2><p id="detail" aria-live="polite">Click a spot to inspect it.</p><p class="notice">Board inspection only. Movement and turns arrive in Phase 3.</p></aside></div><footer>Shared screen · Shared mouse · Local execution only</footer>`;
function get<T extends Element>(id:string):T{const e=document.getElementById(id);if(!e)throw new Error('Missing '+id);return e as unknown as T;}
const board=get<SVGSVGElement>('board'),count=get<HTMLSelectElement>('count'),detail=get<HTMLElement>('detail');
let selected:string|null=null;
function refresh(){const n=Number(count.value);renderBoard(board,n,selected);get<HTMLElement>('players').innerHTML=PLAYER_COLORS.slice(0,n).map((color,i)=>`<div class="player"><span class="player-chip" style="background:${color}">${i+1}</span> Player ${i+1}<small>Start ${i+1}</small></div>`).join('');}
refresh();
const camera=attachCamera(board,get('zoom'));
function inspect(target:EventTarget|null){if(!(target instanceof Element))return;const spot=target.closest<SVGGElement>('[data-node]');if(!spot)return;const node=EXIT_ROOM.nodes.find(n=>n.id===spot.dataset.node);if(!node)return;selected=node.id;const neighbors=EXIT_ROOM.links.filter(l=>l.includes(node.id)).length;const occupant=EXIT_ROOM.starts.slice(0,Number(count.value)).indexOf(node.id);detail.textContent=(node.kind==='exit'?'Winning Exit':node.kind==='connection'?node.edge+' connection':'Movement spot '+node.id)+' · '+neighbors+' linked spots'+(occupant>=0?' · Player '+(occupant+1):'');board.querySelectorAll('[data-node]').forEach(el=>el.classList.toggle('selected',el===spot));}
board.addEventListener('click',e=>{if(!camera.wasDrag())inspect(e.target);});
board.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect(e.target);}});
count.addEventListener('change',()=>{selected=null;detail.textContent='Click a spot to inspect it.';refresh();});
get('plus').addEventListener('click',camera.zoomIn);get('minus').addEventListener('click',camera.zoomOut);get('reset').addEventListener('click',camera.reset);
