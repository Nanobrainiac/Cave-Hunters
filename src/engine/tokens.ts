import { RULES } from '../data/config';
import { shuffle, type Board } from './exploration';
export const TRAPS=['Snare','Grasping Hands','Relic Curse','Cave-In','Possession'] as const;
export const ITEMS=['Lantern','Protective Charm','Rusty Blade',"Thief's Hook",'Smoke Bomb'] as const;
export type Token={id:string;kind:'trap'|'item'|'relic';name:string};
export type BoardToken={spot:string;token:Token;revealed:boolean};
export const TOKEN_POOL:readonly Token[]=[
 ...TRAPS.flatMap((name,i)=>Array.from({length:6},(_,j):Token=>({id:'t'+i+'-'+j,kind:'trap',name}))),
 ...ITEMS.flatMap((name,i)=>Array.from({length:4},(_,j):Token=>({id:'i'+i+'-'+j,kind:'item',name}))),
 ...Array.from({length:4},(_,i):Token=>({id:'r'+i,kind:'relic',name:'Relic'}))
];
export function newSupply(random=Math.random){return shuffle(TOKEN_POOL,random);}
export function rollTokenDie(random=Math.random){return RULES.die[Math.floor(random()*RULES.die.length)]!;}
export function eligibleSpots(board:Board,positions:readonly string[],tokens:readonly BoardToken[]):string[]{
 const occupied=new Set([...positions,...tokens.map(t=>t.spot)]);
 return board.nodes.filter(n=>!occupied.has(n.id)).map(n=>n.id);
}
