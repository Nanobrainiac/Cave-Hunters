import type {GameState,Player} from './game';
import {eligibleSpots,type Token} from './tokens';
export type Effect={kind:'trap';player:number;token:Token;previous:string;normal:boolean}|{kind:'drop';player:number;itemKind:'item'|'relic';normal:boolean}|{kind:'attack';player:number;attacker:number;item:Token;stolen?:string}|{kind:'blade'|'possession';player:number;attacker:number;remaining:number};
export type Notice={player:number;token:Token;result:string};
export function neighbors(s:GameState,spot:string):string[]{return s.board.links.flatMap(([a,b])=>a===spot?[b]:b===spot?[a]:[]);}
export function freeNeighbors(s:GameState,player:number):string[]{return neighbors(s,s.players[player]!.spot).filter(id=>!s.players.some(p=>p.spot===id));}
export function updatePlayer(s:GameState,id:number,fn:(p:Player)=>Player):GameState{return {...s,players:s.players.map(p=>p.id===id?fn(p):p)};}
export function consume(s:GameState,id:number,item:Token):GameState{return {...updatePlayer(s,id,p=>({...p,inventory:p.inventory.filter(t=>t.id!==item.id)})),spent:[...s.spent,item]};}
export function dropTargets(s:GameState,player:number):string[]{
 const start=s.players[player]!.spot,dist=new Map<string,number>([[start,0]]),queue=[start];
 for(let i=0;i<queue.length;i++){const a=queue[i]!,d=dist.get(a)!;if(d>=4)continue;for(const b of neighbors(s,a)){if(dist.has(b)||s.players.some(p=>p.spot===b))continue;dist.set(b,d+1);queue.push(b);}}
 const free=eligibleSpots(s.board,s.players.map(p=>p.spot),s.tokens);
 for(let d=4;d>=1;d--){const options=free.filter(id=>dist.get(id)===d);if(options.length)return options;}return [];
}
export function sameRoom(s:GameState,a:number,b:number):boolean{return s.board.nodes.find(n=>n.id===s.players[a]!.spot)?.roomId===s.board.nodes.find(n=>n.id===s.players[b]!.spot)?.roomId;}
export function lanternTargets(s:GameState):string[]{const p=s.players[s.active]!,room=s.board.nodes.find(n=>n.id===p.spot)?.roomId;return s.tokens.filter(t=>!t.revealed&&(neighbors(s,p.spot).includes(t.spot)||s.board.nodes.find(n=>n.id===t.spot)?.roomId===room)).map(t=>t.spot);}
export function rivals(s:GameState,item:Token):number[]{return s.players.filter(p=>p.id!==s.active&&sameRoom(s,s.active,p.id)&&(item.name==='Rusty Blade'?freeNeighbors(s,p.id).length>0:p.inventory.length>0)).map(p=>p.id);}
