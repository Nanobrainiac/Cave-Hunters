import { describe, expect, it } from 'vitest';
import { EXIT_ROOM, ROOM_SIZE } from '../src/data/rooms';
describe('prototype Exit room',()=>{
 it('has six distinct starts and one separate winning spot',()=>{expect(new Set(EXIT_ROOM.starts).size).toBe(6);const wins=EXIT_ROOM.nodes.filter(n=>n.kind==='exit');expect(wins).toHaveLength(1);expect(EXIT_ROOM.starts).not.toContain(wins[0]?.id);for(const id of EXIT_ROOM.starts)expect(EXIT_ROOM.nodes.some(n=>n.id===id&&n.kind==='ordinary')).toBe(true);});
 it('has a connected graph with valid links',()=>{const ids=new Set(EXIT_ROOM.nodes.map(n=>n.id));expect(ids.size).toBe(EXIT_ROOM.nodes.length);for(const [a,b] of EXIT_ROOM.links){expect(ids.has(a)&&ids.has(b)&&a!==b).toBe(true);}const visited=new Set<string>(['win']);let changed=true;while(changed){const before=visited.size;for(const [a,b] of EXIT_ROOM.links){if(visited.has(a))visited.add(b);if(visited.has(b))visited.add(a);}changed=visited.size!==before;}expect(visited.size).toBe(ids.size);});
 it('has four aligned edge ports',()=>{const ports=EXIT_ROOM.nodes.filter(n=>n.kind==='connection');expect(ports.map(n=>n.edge).sort()).toEqual(['east','north','south','west']);for(const p of ports){const expected={north:[150,0],east:[ROOM_SIZE,150],south:[150,ROOM_SIZE],west:[0,150]}[p.edge!];expect([p.x,p.y]).toEqual(expected);}});
});
