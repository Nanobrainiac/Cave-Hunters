import {describe,it,expect} from 'vitest';
import {newGame,move,endTurn,legalMoves,usableItems,place,resolveTrap,dropObject,choosePossessionDestination,useItem,bladeStep,type GameState} from '../src/engine/game';
import {TOKEN_POOL} from '../src/engine/tokens';
import {rotations} from '../src/engine/exploration';
import {dropTargets} from '../src/engine/effects';
import {encodeSave,decodeSave} from '../src/engine/save';
const relics=TOKEN_POOL.filter(t=>t.kind==='relic');
const named=(name:string)=>TOKEN_POOL.find(t=>t.name===name)!;
function atExit(count=2,encounter?:string,charm=false):GameState{
 const s=newGame(['A','B'],0,()=>.25);
 const inventory=[...relics.slice(0,count),...(charm?[named('Protective Charm')]:[])];
 const token=encounter==='Relic'?relics[count]:encounter?named(encounter):undefined;
 return {...s,players:s.players.map((p,i)=>i===0?{...p,spot:'s3',inventory}:p),tokens:token?[{spot:'win',token,revealed:false}]:[],supply:s.supply.filter(t=>!inventory.some(q=>q.id===t.id)&&t.id!==token?.id)};
}
describe('Phase 7 victory',()=>{
 it('requires two relics on the original Exit and locks the finished game',()=>{
  expect(move(atExit(1),'win').winner).toBeNull();
  const s=move(atExit(),'win');expect(s.winner).toBe(0);expect(legalMoves(s)).toEqual([]);expect(usableItems(s)).toEqual([]);
  expect(()=>endTurn(s)).toThrow();expect(()=>move(s,'s4')).toThrow();
 });
 it('counts a relic collected on the Exit',()=>expect(move(atExit(1,'Relic'),'win').winner).toBe(0));
 it('waits for a defensive decision and checks victory after cancellation',()=>{
  const s=move(atExit(2,'Relic Curse',true),'win');expect(s.winner).toBeNull();expect(s.effect?.kind).toBe('trap');
  expect(resolveTrap(s,true).winner).toBe(0);
  const p=resolveTrap(s,false);expect(p.effect?.kind).toBe('drop');expect(p.winner).toBeNull();
  expect(dropObject(p,relics[0]!.id,dropTargets(p,0)[0]!).winner).toBeNull();
 });
 it('does not win when Cave-In removes the player from Exit',()=>{const s=move(atExit(2,'Cave-In'),'win');expect(s.players[0]?.spot).toBe('s3');expect(s.winner).toBeNull();});
 it('stops forced movement on the winning spot',()=>{
  const s={...atExit(),effect:{kind:'possession' as const,player:0,attacker:1,remaining:4}};
  const p=choosePossessionDestination(s,'e');expect(p.winner).toBe(0);expect(p.players[0]?.spot).toBe('win');
 });
 it('allows a rival to win during forced movement out of turn',()=>{
  const s=atExit();
  const blade=named('Rusty Blade');
  const p={...s,active:1,players:s.players.map((q,i)=>i===1?{...q,inventory:[blade]}:q),supply:s.supply.filter(t=>t.id!==blade.id)};
  const next=bladeStep(useItem(p,blade.id,0),'win');expect(next.winner).toBe(0);
 });
 it('wins by obtaining a second relic through theft while at Exit',()=>{
  const s=move(atExit(1),'win'),hook=named("Thief's Hook"),stolen=relics[1]!;
  const p={...s,players:s.players.map((q,i)=>({...q,inventory:i===0?[...q.inventory,hook]:[stolen]})),supply:s.supply.filter(t=>t.id!==hook.id&&t.id!==stolen.id)};
  expect(useItem(p,hook.id,1,stolen.id).winner).toBe(0);
 });
});
describe('Phase 7 saves and late game',()=>{
 it('round trips a fresh game and a completed placement',()=>{
  const start=newGame(['A','B'],1,()=>.2);
  expect(decodeSave(encodeSave(start,['Started'])).state).toEqual(start);
  const pending=move(start,'n');
  expect(decodeSave(encodeSave(pending,[])).state).toEqual(pending);
  const placed=place(pending,rotations(pending.board,'n',pending.pending!)[0]!,()=>.99);
  expect(decodeSave(encodeSave(placed,['Placed'])).state).toEqual(placed);
 });
 it('resumes an unresolved trap without duplicating tokens',()=>{
  const s=move(atExit(2,'Relic Curse',true),'win');
  const loaded=decodeSave(encodeSave(s,['Trap']));expect(loaded.state.effect).toEqual(s.effect);
  expect(resolveTrap(loaded.state,true).winner).toBe(0);
 });
 it('resumes a completed victory',()=>{
  const s=move(atExit(),'win');expect(decodeSave(encodeSave(s,[])).state.winner).toBe(0);
 });
 it('rejects incompatible, invalid and duplicate token saves',()=>{
  expect(()=>decodeSave('not json')).toThrow();
  expect(()=>decodeSave('{"version":2}')).toThrow();
  const s=newGame(['A','B']);
  expect(()=>decodeSave(encodeSave({...s,supply:[...s.supply,s.supply[0]!]},[]))).toThrow();
  expect(()=>decodeSave(encodeSave({...s,active:9},[]))).toThrow();
 });
 it('spawns on late turns without blocking movement and stops spawning with empty supply',()=>{
  const s={...move(newGame(['A','B']),'s3'),expansionComplete:true};
  const p=endTurn(s,()=>0);expect(p.tokens).toHaveLength(1);expect(legalMoves(p).length).toBeGreaterThan(0);
  expect(endTurn({...s,supply:[]},()=>0).tokens).toHaveLength(0);
 });
});
