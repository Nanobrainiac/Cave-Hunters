import {describe,it,expect} from 'vitest';
import {ROOM_DECK,initialBoard,rotations,addRoom,openCell,expansionEnded} from '../src/engine/exploration';
import {newGame,move,place,endTurn,legalMoves} from '../src/engine/game';
describe('exploration',()=>{
 it('uses exactly the approved room counts',()=>{expect(ROOM_DECK).toHaveLength(30);for(const [name,count] of [['Corridor',10],['Turn',8],['Open area',8],['Dead end',4]] as const)expect(ROOM_DECK.filter(c=>c.name===name)).toHaveLength(count);});
 it('draws on arrival and requires placement without extra movement',()=>{const s=move(newGame(['A','B'],0,()=>0),'n');expect(s.pending).not.toBeNull();expect(s.deck).toHaveLength(29);expect(()=>endTurn(s)).toThrow();const r=rotations(s.board,'n',s.pending!)[0]!;const p=place(s,r,()=>0);expect(p.board.rooms).toHaveLength(2);expect(p.players[0]?.spot).toBe('n');expect(legalMoves(p)).toEqual([]);expect(p.board.links.some(l=>l.includes('n')&&l.some(id=>id.includes(':')))).toBe(true);expect(endTurn(p).active).toBe(1);});
 it('rejects illegal rotation and occupied grid cells',()=>{const b=initialBoard(),card=ROOM_DECK.find(c=>c.name==='Dead end')!;expect(rotations(b,'n',card)).toEqual([2]);expect(()=>addRoom(b,'n',card,0)).toThrow();const next=addRoom(b,'n',card,2);expect(openCell(next,'n')).toBeNull();expect(()=>addRoom(next,'n',card,2)).toThrow();});
 it('detects exhausted deck',()=>expect(expansionEnded(initialBoard(),[])).toBe(true));
});
