import {describe,it,expect} from 'vitest';
import {newGame,move,endTurn,resolveTrap,useItem,resolveAttack,bladeStep,choosePossessionDestination,dropObject,legalMoves} from '../src/engine/game';
import {dropTargets,possessionPaths} from '../src/engine/effects';
import {TOKEN_POOL} from '../src/engine/tokens';
const token=(name:string)=>TOKEN_POOL.find(t=>t.name===name)!;
function setup(a:string[]=[],b:string[]=[],trap?:string){
 const s=newGame(['A','B']);const inventory=[a.map(token),b.map(token)];
 return {...s,players:s.players.map((p,i)=>({...p,inventory:inventory[i]!})),tokens:trap?[{spot:'s3',token:token(trap),revealed:false}]:[],supply:s.supply.filter(t=>!inventory.flat().some(q=>q.id===t.id)&&(!trap||t.id!==token(trap).id))};
}
describe('effects',()=>{
 it('snare skips the next turn',()=>{let s=move(setup([],[],'Snare'),'s3');expect(s.players[0]?.skip).toBe(true);s=endTurn(s);s=endTurn(move(s,'s4'));expect(s.skipped).toBe(true);expect(legalMoves(s)).toEqual([]);});
 it('possession highlights all legal destinations and moves in one selection',()=>{const s=move(setup([],[],'Possession'),'s3');expect(s.effect).toEqual({kind:'possession',player:0,attacker:1,remaining:4});expect(()=>endTurn(s)).toThrow();expect(possessionPaths(s).get('e')).toEqual(['win','s4','e']);expect(possessionPaths(s).has('s2')).toBe(false);expect(possessionPaths(s).has('s3')).toBe(false);expect(()=>choosePossessionDestination(s,'s2')).toThrow();const p=choosePossessionDestination(s,'e');expect(p.players[0]?.spot).toBe('e');expect(p.effect).toBeNull();expect(p.pending).toBeNull();expect(p.moved).toBe(true);expect(endTurn(p).active).toBe(1);});
 it('possession resolves intermediate tokens and interrupts on traps',()=>{const s=move(setup([],[],'Possession'),'s3');const p=choosePossessionDestination({...s,tokens:[{spot:'win',token:token('Snare'),revealed:false}]},'e');expect(p.players[0]?.spot).toBe('win');expect(p.players[0]?.skip).toBe(true);expect(p.effect).toBeNull();});
 it('charm prevents possession',()=>{const s=resolveTrap(move(setup(['Protective Charm'],[],'Possession'),'s3'),true);expect(s.effect).toBeNull();expect(s.players[0]?.spot).toBe('s3');});
 it('charm cancels a trap and is consumed',()=>{let s=move(setup(['Protective Charm'],[],'Snare'),'s3');expect(s.effect?.kind).toBe('trap');s=resolveTrap(s,true);expect(s.players[0]?.skip).toBe(false);expect(s.players[0]?.inventory).toHaveLength(0);});
 it('cave-in returns the mover',()=>{const s=move(setup([],[],'Cave-In'),'s3');expect(s.players[0]?.spot).toBe('s1');expect(s.moved).toBe(true);});
 it('curse drops a recoverable relic at a legal distance',()=>{let s=move(setup(['Relic'],[],'Relic Curse'),'s3');expect(s.effect?.kind).toBe('drop');const target=dropTargets(s,0)[0]!;s=dropObject(s,token('Relic').id,target);expect(s.players[0]?.inventory).toHaveLength(0);expect(s.tokens.find(t=>t.spot===target)?.revealed).toBe(true);});
 it('grasping hands drops equipment',()=>{let s=move(setup(['Lantern'],[],'Grasping Hands'),'s3');s=dropObject(s,token('Lantern').id,dropTargets(s,0)[0]!);expect(s.players[0]?.inventory).toHaveLength(0);});
 it('lantern publicly reveals without collecting',()=>{const s=useItem(setup(['Lantern'],[],'Snare'),token('Lantern').id,'s3');expect(s.tokens[0]?.revealed).toBe(true);expect(s.players[0]?.inventory).toHaveLength(0);});
 it('hook transfers a relic',()=>{const s=useItem(setup(["Thief's Hook"],['Relic']),token("Thief's Hook").id,1,token('Relic').id);expect(s.players[0]?.inventory).toEqual([token('Relic')]);expect(s.players[1]?.inventory).toHaveLength(0);});
 it('smoke cancels an attack',()=>{let s=useItem(setup(['Rusty Blade'],['Smoke Bomb']),token('Rusty Blade').id,1);s=resolveAttack(s,true);expect(s.effect).toBeNull();expect(s.players[1]?.inventory).toHaveLength(0);});
 it('blade moves a rival without expansion or spending ordinary movement',()=>{let s=useItem(setup(['Rusty Blade']),token('Rusty Blade').id,1);s=bladeStep(s,'n');expect(s.players[1]?.spot).toBe('n');expect(s.pending).toBeNull();expect(s.moved).toBe(false);});
});
