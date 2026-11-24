import { RULES } from '../data/config';
import { type RoomTemplate } from '../data/rooms';
import { initialBoard, ROOM_DECK, shuffle, rotations, addRoom, openCell, expansionEnded, type Board } from './exploration';
export type Player = { id:number; name:string; spot:string };
export type GameState = { players:readonly Player[]; active:number; turn:number; round:number; moved:boolean; first:number; board:Board; deck:readonly RoomTemplate[]; pending:RoomTemplate|null; discarded:number; expansionComplete:boolean };
export function newGame(names:readonly string[],first=0,random=Math.random):GameState {
 if(names.length<RULES.minPlayers||names.length>RULES.maxPlayers||!Number.isInteger(first)||first<0||first>=names.length)throw new Error('Invalid setup');
 const board=initialBoard();
 return {players:names.map((name,i)=>({id:i,name:name.trim()||'Player '+(i+1),spot:board.rooms[0]!.template.starts[i]!})),active:first,first,turn:1,round:1,moved:false,board,deck:shuffle(ROOM_DECK,random),pending:null,discarded:0,expansionComplete:false};
}
export function legalMoves(state:GameState):string[]{
 if(state.moved||state.pending)return [];
 const p=state.players[state.active]!;
 const occupied=new Set(state.players.map(p=>p.spot));
 return state.board.links.flatMap(([a,b])=>a===p.spot?[b]:b===p.spot?[a]:[]).filter(id=>!occupied.has(id));
}
function discover(state:GameState,spot:string):GameState{
 if(state.expansionComplete||!openCell(state.board,spot)||!state.deck.length)return state;
 const [card,...deck]=state.deck; if(!card)return state;
 if(!rotations(state.board,spot,card).length){
  const next={...state,deck,discarded:state.discarded+1,expansionComplete:expansionEnded(state.board,deck)};
  return endTurn(next);
 }
 return {...state,deck,pending:card};
}
export function move(state:GameState,target:string):GameState {
 if(!legalMoves(state).includes(target))throw new Error('Illegal movement');
 return discover({...state,moved:true,players:state.players.map((p,i)=>i===state.active?{...p,spot:target}:p)},target);
}
export function retryAvailable(state:GameState):boolean{
 return !state.moved&&!state.pending&&!state.expansionComplete&&!!state.deck.length&&!!openCell(state.board,state.players[state.active]!.spot);
}
export function retry(state:GameState):GameState{
 if(!retryAvailable(state))throw new Error('Cannot retry');
 return discover({...state,moved:true},state.players[state.active]!.spot);
}
export function place(state:GameState,rotation:number):GameState{
 if(!state.pending)throw new Error('No pending room');
 const board=addRoom(state.board,state.players[state.active]!.spot,state.pending,rotation);
 return {...state,board,pending:null,expansionComplete:expansionEnded(board,state.deck)};
}
export function endTurn(state:GameState):GameState {
 if(state.pending)throw new Error('Place room first');
 if(!state.moved&&legalMoves(state).length)throw new Error('Move required');
 const active=(state.active+1)%state.players.length;
 return {...state,active,turn:state.turn+1,round:state.round+(active===state.first?1:0),moved:false};
}
