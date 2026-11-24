import { RULES } from '../data/config';
import { EXIT_ROOM, type RoomTemplate } from '../data/rooms';
export type Player = { id:number; name:string; spot:string };
export type GameState = { players:readonly Player[]; active:number; turn:number; round:number; moved:boolean; first:number };
export function newGame(names:readonly string[],first=0):GameState {
 if(names.length<RULES.minPlayers||names.length>RULES.maxPlayers||!Number.isInteger(first)||first<0||first>=names.length)throw new Error('Invalid setup');
 return {players:names.map((name,i)=>({id:i,name:name.trim()||'Player '+(i+1),spot:EXIT_ROOM.starts[i]!})),active:first,first,turn:1,round:1,moved:false};
}
export function legalMoves(state:GameState,room:RoomTemplate=EXIT_ROOM):string[]{
 if(state.moved)return [];
 const p=state.players[state.active]!;
 const occupied=new Set(state.players.map(p=>p.spot));
 return room.links.flatMap(([a,b])=>a===p.spot?[b]:b===p.spot?[a]:[]).filter(id=>!occupied.has(id));
}
export function move(state:GameState,target:string,room:RoomTemplate=EXIT_ROOM):GameState {
 if(!legalMoves(state,room).includes(target))throw new Error('Illegal movement');
 return {...state,moved:true,players:state.players.map((p,i)=>i===state.active?{...p,spot:target}:p)};
}
export function endTurn(state:GameState,room:RoomTemplate=EXIT_ROOM):GameState {
 if(!state.moved&&legalMoves(state,room).length)throw new Error('Move required');
 const active=(state.active+1)%state.players.length;
 return {...state,active,turn:state.turn+1,round:state.round+(active===state.first?1:0),moved:false};
}
