import { newSupply, rollTokenDie, eligibleSpots, type Token, type BoardToken } from './tokens';
import { RULES } from '../data/config';
import { type RoomTemplate } from '../data/rooms';
import { initialBoard, ROOM_DECK, shuffle, rotations, addRoom, openCell, expansionEnded, type Board } from './exploration';
export type Player = { id:number; name:string; spot:string; inventory:readonly Token[] };
export type GameState = { players:readonly Player[]; active:number; turn:number; round:number; moved:boolean; first:number; board:Board; deck:readonly RoomTemplate[]; pending:RoomTemplate|null; discarded:number; expansionComplete:boolean; supply:readonly Token[]; tokens:readonly BoardToken[]; spent:readonly Token[]; seedCount:number; roll:number|null; encounter:Token|null };
export function newGame(names:readonly string[],first=0,random=Math.random):GameState {
 if(names.length<RULES.minPlayers||names.length>RULES.maxPlayers||!Number.isInteger(first)||first<0||first>=names.length)throw new Error('Invalid setup');
 const board=initialBoard();
 return {players:names.map((name,i)=>({id:i,name:name.trim()||'Player '+(i+1),spot:board.rooms[0]!.template.starts[i]!,inventory:[]})),active:first,first,turn:1,round:1,moved:false,board,deck:shuffle(ROOM_DECK,random),pending:null,discarded:0,expansionComplete:false,supply:newSupply(random),tokens:[],spent:[],seedCount:0,roll:null,encounter:null};
}
export function legalMoves(state:GameState):string[]{
 if(state.moved||state.pending||state.seedCount)return [];
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
 const hit=state.tokens.find(t=>t.spot===target)?.token??null;
 const next={...state,moved:true,encounter:hit,tokens:state.tokens.filter(t=>t.spot!==target),spent:hit?.kind==='trap'?[...state.spent,hit]:state.spent,players:state.players.map((p,i)=>i===state.active?{...p,spot:target,inventory:hit&&hit.kind!=='trap'?[...p.inventory,hit]:p.inventory}:p)};
 return discover(next,target);
}
export function retryAvailable(state:GameState):boolean{
 return !state.moved&&!state.pending&&!state.seedCount&&!state.expansionComplete&&!!state.deck.length&&!!openCell(state.board,state.players[state.active]!.spot);
}
export function retry(state:GameState):GameState{
 if(!retryAvailable(state))throw new Error('Cannot retry');
 return discover({...state,moved:true},state.players[state.active]!.spot);
}
export function place(state:GameState,rotation:number,random=Math.random):GameState{
 if(!state.pending)throw new Error('No pending room');
 const board=addRoom(state.board,state.players[state.active]!.spot,state.pending,rotation);
 const roll=rollTokenDie(random); return scheduleSeeds({...state,board,pending:null,roll,expansionComplete:expansionEnded(board,state.deck)},roll);
}
export function endTurn(state:GameState):GameState {
 if(state.pending||state.seedCount)throw new Error('Finish placement first');
 if(!state.moved&&legalMoves(state).length)throw new Error('Move required');
 const active=(state.active+1)%state.players.length;
 const next={...state,active,turn:state.turn+1,round:state.round+(active===state.first?1:0),moved:false,roll:null,encounter:null}; return scheduleSeeds(next,next.expansionComplete?1:0);
}

export function tokenTargets(s:GameState):string[]{return s.seedCount?eligibleSpots(s.board,s.players.map(p=>p.spot),s.tokens):[];}
function scheduleSeeds(s:GameState,count:number):GameState{return {...s,seedCount:Math.min(count,s.supply.length,eligibleSpots(s.board,s.players.map(p=>p.spot),s.tokens).length)};}
export function seedToken(s:GameState,spot:string):GameState{if(!tokenTargets(s).includes(spot))throw new Error('Illegal token placement');const [token,...supply]=s.supply;if(!token)throw new Error('Empty supply');return scheduleSeeds({...s,supply,tokens:[...s.tokens,{spot,token,revealed:false}]},s.seedCount-1);}
