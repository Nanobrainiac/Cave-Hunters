import { describe,it,expect } from 'vitest';
import { newGame,legalMoves,move,endTurn } from '../src/engine/game';
describe('local turns',()=>{
 it('sets up 2–6 distinct players',()=>{for(let n=2;n<=6;n++){const s=newGame(Array.from({length:n},(_,i)=>'P'+i));expect(new Set(s.players.map(p=>p.spot)).size).toBe(n);}expect(()=>newGame(['A'])).toThrow();});
 it('blocks occupied and non-adjacent nodes and second moves',()=>{const s=newGame(['A','B']);expect(legalMoves(s)).toEqual(['s3','n']);expect(()=>move(s,'s2')).toThrow();expect(()=>move(s,'win')).toThrow();const m=move(s,'n');expect(m.players[0]?.spot).toBe('n');expect(s.players[0]?.spot).toBe('s1');expect(()=>move(m,'s1')).toThrow();});
 it('requires movement when possible and rotates from selected first player',()=>{let s=newGame(['A','B'],1);expect(()=>endTurn(s)).toThrow();s=endTurn(move(s,'s4'));expect([s.active,s.turn,s.round]).toEqual([0,2,1]);s=endTurn(move(s,'s3'));expect([s.active,s.turn,s.round]).toEqual([1,3,2]);});
 it('allows a blocked player to pass',()=>{const base=newGame(['A','B','C','D']);const s={...base,players:base.players.map((p,i)=>i===3?{...p,spot:'n'}:p)};expect(legalMoves(s)).toEqual([]);expect(endTurn(s).active).toBe(1);});
});
