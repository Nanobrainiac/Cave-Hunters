import {describe,it,expect} from 'vitest';
import {TOKEN_POOL,rollTokenDie,eligibleSpots} from '../src/engine/tokens';
import {newGame,move,place,endTurn,legalMoves} from '../src/engine/game';
import {rotations} from '../src/engine/exploration';
describe('tokens',()=>{
 it('has 54 unique tokens and a 50/50 chance to spawn one or two',()=>{
  expect(new Set(TOKEN_POOL.map(t=>t.id)).size).toBe(54);
  expect(TOKEN_POOL.filter(t=>t.kind==='trap')).toHaveLength(30);
  expect(TOKEN_POOL.filter(t=>t.kind==='item')).toHaveLength(20);
  expect(TOKEN_POOL.filter(t=>t.kind==='relic')).toHaveLength(4);
  expect([0,.49,.5,.99].map(v=>rollTokenDie(()=>v))).toEqual([1,1,2,2]);
 });
 it('spawns hidden tokens automatically across empty board spots after placement',()=>{
  const s=move(newGame(['A','B'],0,()=>0),'n');
  const r=rotations(s.board,'n',s.pending!)[0]!;
  const p=place(s,r,()=>.99);
  expect(p.tokens).toHaveLength(2);
  expect(p.roll).toBe(2);
  expect(p.supply).toHaveLength(52);
  expect(p.tokens.every(t=>!t.revealed&&p.board.nodes.some(n=>n.id===t.spot))).toBe(true);
  expect(new Set(p.tokens.map(t=>t.spot)).size).toBe(2);
  expect(p.tokens.every(t=>!p.players.some(q=>q.spot===t.spot))).toBe(true);
  expect(place(s,r,()=>.99).tokens).toEqual(p.tokens);
  expect(endTurn(p).active).toBe(1);
 });
 it('can spawn on the original Exit rather than only the new room',()=>{
  const s=move(newGame(['A','B'],0,()=>0),'n');
  const r=rotations(s.board,'n',s.pending!)[0]!;
  const p=place(s,r,()=>0);
  expect(p.tokens).toHaveLength(1);
  expect(p.tokens[0]?.spot).toBe(eligibleSpots(p.board,p.players.map(q=>q.spot),[])[0]);
  expect(p.board.nodes.find(n=>n.id===p.tokens[0]?.spot)?.roomId).toBe('exit');
 });
 it('caps automatic spawning when fewer tokens remain',()=>{
  const s=move(newGame(['A','B'],0,()=>0),'n');
  const r=rotations(s.board,'n',s.pending!)[0]!;
  const p=place({...s,supply:s.supply.slice(0,1)},r,()=>.99);
  expect(p.tokens).toHaveLength(1);
  expect(p.supply).toHaveLength(0);
  expect(p.roll).toBe(1);
 });
 it('collects a relic before exploration',()=>{
  const s=newGame(['A','B']);const relic=s.supply.find(t=>t.kind==='relic')!;
  const p=move({...s,supply:s.supply.filter(t=>t.id!==relic.id),tokens:[{spot:'s3',token:relic,revealed:false}]},'s3');
  expect(p.players[0]?.inventory).toEqual([relic]);expect(p.tokens).toHaveLength(0);
 });
 it('spawns one automatically at each late-phase turn start and skips empty supply or full board',()=>{
  const s={...move(newGame(['A','B']),'s3'),expansionComplete:true};
  const p=endTurn(s,()=>0);
  expect(p.roll).toBe(1);
  expect(p.tokens).toHaveLength(1);
  expect(legalMoves(p).length).toBeGreaterThan(0);
  expect(endTurn({...s,supply:[]},()=>0).tokens).toHaveLength(0);
  const empty=eligibleSpots(s.board,s.players.map(q=>q.spot),[]);
  const boardTokens=empty.map((spot,i)=>({spot,token:s.supply[i]!,revealed:false}));
  const full=endTurn({...s,tokens:boardTokens,supply:s.supply.slice(empty.length)},()=>.5);
  expect(full.tokens).toHaveLength(boardTokens.length);
  expect(full.roll).toBe(0);
 });
});
