import { EXIT_ROOM, ROOM_SIZE, PLAYER_COLORS } from '../data/rooms';
export function renderBoard(svg: SVGSVGElement, positions: readonly string[], active: number, legal: readonly string[]): void {
 const room = EXIT_ROOM;
 const byId = new Map(room.nodes.map(n=>[n.id,n]));
 const links = room.links.map(([a,b])=>{
  const p=byId.get(a),q=byId.get(b); if(!p||!q) throw new Error('Invalid room link');
  return `<line x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}" class="path"/>`;
 }).join('');
 const nodes = room.nodes.map(n=>`<g class="spot ${n.kind} ${legal.includes(n.id)?'legal':''}" data-node="${n.id}" role="button" tabindex="0" aria-label="${n.id==='win'?'Winning Exit':n.kind==='connection'?n.edge+' connection':'Movement spot '+n.id}"><circle cx="${n.x}" cy="${n.y}" r="17" class="hit"/><circle cx="${n.x}" cy="${n.y}" r="${n.kind==='exit'?13:8}" class="node"/>${n.kind==='exit'?`<text x="${n.x}" y="${n.y+4}" text-anchor="middle" class="exit-icon">E</text>`:''}</g>`).join('');
 const players=positions.map((id,i)=>{
  const p=byId.get(id); if(!p) throw new Error('Invalid start');
  return `<g class="piece" pointer-events="none">${i===active?`<circle cx="${p.x}" cy="${p.y}" r="19" fill="none" stroke="${PLAYER_COLORS[i]}" stroke-width="2.5"/>`:``}<circle cx="${p.x}" cy="${p.y}" r="14" fill="${PLAYER_COLORS[i]}" stroke="#10191c" stroke-width="2"/><text x="${p.x}" y="${p.y+4}" text-anchor="middle">${i+1}</text></g>`;
 }).join('');
 svg.innerHTML=`<defs><pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M30 0H0V30" fill="none" stroke="#26383d" stroke-width=".65"/></pattern></defs><rect x="-100000" y="-100000" width="200000" height="200000" fill="url(#grid)"/><rect width="${ROOM_SIZE}" height="${ROOM_SIZE}" rx="8" class="room"/><rect x="8" y="8" width="284" height="284" rx="5" class="room-inset"/><text x="150" y="35" text-anchor="middle" class="room-label">EXIT ROOM</text>${links}${nodes}${players}`;
}
