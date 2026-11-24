import {describe,it,expect} from 'vitest';
import {TOKEN_POOL,rollTokenDie} from '../src/engine/tokens';
import {newGame,move,place,seedToken,tokenTargets,endTurn,legalMoves} from '../src/engine/game';
import {rotations} from '../src/engine/exploration';
describe('tokens',()=>{
 it('has 54 unique tokens and correct die',()=>{expect(new Set(TOKEN_POOL.map(t=>t.id)).size).toBe(54);expect(TOKEN_POOL.filter(t=>t.kind==='trap')).toHaveLength(30);expect(TOKEN_POOL.filter(t=>t.kind==='item')).toHaveLength(20);expect(TOKEN_POOL.filter(t=>t.kind==='relic')).toHaveLength(4);expect([0,.2,.4,.6,.8,.99].map(v=>rollTokenDie(()=>v))).toEqual([0,0,1,1,2,2]);});
 it('requires blind placement after a room and rejects occupied or stacked spots',()=>{const s=move(newGame(['A','B'],0,()=>0),'n');let p=place(s,rotations(s.board,'n',s.pending!)[0]!,()=>.99);expect(p.seedCount).toBe(2);expect(()=>endTurn(p)).toThrow();expect(()=>seedToken(p,'n')).toThrow();p=seedToken(p,'win');expect(p.tokens[0]?.revealed).toBe(false);expect(()=>seedToken(p,'win')).toThrow();p=seedToken(p,tokenTargets(p)[0]!);expect(p.supply).toHaveLength(52);expect(p.seedCount).toBe(0);expect(endTurn(p).active).toBe(1);});
 it('collects a relic before exploration',()=>{const s=newGame(['A','B']);const relic=s.supply.find(t=>t.kind==='relic')!;const p=move({...s,supply:s.supply.filter(t=>t.id!==relic.id),tokens:[{spot:'s3',token:relic,revealed:false}]},'s3');expect(p.players[0]?.inventory).toEqual([relic]);expect(p.tokens).toHaveLength(0);});
 it('requires late placement before movement and skips empty supply',()=>{const s={...move(newGame(['A','B']),'s3'),expansionComplete:true};const p=endTurn(s);expect(p.seedCount).toBe(1);expect(legalMoves(p)).toEqual([]);expect(seedToken(p,tokenTargets(p)[0]!).seedCount).toBe(0);expect(endTurn({...s,supply:[]}).seedCount).toBe(0);});
});
