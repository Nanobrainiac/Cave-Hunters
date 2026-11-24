import { type Effect,type Notice,freeNeighbors,updatePlayer,consume,dropTargets,lanternTargets,rivals } from './effects';
import { newSupply, rollTokenDie, eligibleSpots, type Token, type BoardToken } from './tokens';
import { RULES } from '../data/config';
import { type RoomTemplate } from '../data/rooms';
import { initialBoard, ROOM_DECK, shuffle, rotations, addRoom, openCell, expansionEnded, type Board } from './exploration';
export type Player = { id:number; name:string; spot:string; inventory:readonly Token[]; skip:boolean; possessed:boolean };
export type GameState = { players:readonly Player[]; active:number; turn:number; round:number; moved:boolean; first:number; board:Board; deck:readonly RoomTemplate[]; pending:RoomTemplate|null; discarded:number; expansionComplete:boolean; supply:readonly Token[]; tokens:readonly BoardToken[]; spent:readonly Token[]; seedCount:number; roll:number|null; encounter:Token|null; effect:Effect|null; notices:readonly Notice[]; skipped:boolean; controller:number };
export function newGame(names:readonly string[],first=0,random=Math.random):GameState {
 if(names.length<RULES.minPlayers||names.length>RULES.maxPlayers||!Number.isInteger(first)||first<0||first>=names.length)throw new Error('Invalid setup');
 const board=initialBoard();
 return {players:names.map((name,i)=>({id:i,name:name.trim()||'Player '+(i+1),spot:board.rooms[0]!.template.starts[i]!,inventory:[],skip:false,possessed:false})),active:first,first,turn:1,round:1,moved:false,board,deck:shuffle(ROOM_DECK,random),pending:null,discarded:0,expansionComplete:false,supply:newSupply(random),tokens:[],spent:[],seedCount:0,roll:null,encounter:null,effect:null,notices:[],skipped:false,controller:first};
}
export function legalMoves(state:GameState):string[]{
 if(state.moved||state.pending||state.seedCount||state.effect||state.skipped)return [];
 const p=state.players[state.active]!;
 const occupied=new Set(state.players.map(p=>p.spot));
 return state.board.links.flatMap(([a,b])=>a===p.spot?[b]:b===p.spot?[a]:[]).filter(id=>!occupied.has(id));
}
function discover(state:GameState,spot:string):GameState{
 if(state.expansionComplete||!openCell(state.board,spot)||!state.deck.length)return state;
 const [card,...deck]=state.deck; if(!card)return state;
 if(!rotations(state.board,spot,card).length){
  const next={...state,deck,discarded:state.discarded+1,expansionComplete:expansionEnded(state.board,deck)};
  return {...endTurn(next),notices:next.notices};
 }
 return {...state,deck,pending:card};
}
export function move(state:GameState,target:string):GameState {
 if(!legalMoves(state).includes(target))throw new Error('Illegal movement');
 return step({...state,moved:true,notices:[],encounter:null},state.active,target,true);
}
export function retryAvailable(state:GameState):boolean{
 return !state.moved&&!state.pending&&!state.seedCount&&!state.effect&&!state.skipped&&!state.expansionComplete&&!!state.deck.length&&!!openCell(state.board,state.players[state.active]!.spot);
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
 if(state.pending||state.seedCount||state.effect)throw new Error('Finish placement first');
 if(!state.skipped&&!state.moved&&legalMoves(state).length)throw new Error('Move required');
 const active=(state.active+1)%state.players.length;
 const p=state.players[active]!,skipped=p.skip;
 const next=updatePlayer({...state,active,turn:state.turn+1,round:state.round+(active===state.first?1:0),moved:false,roll:null,encounter:null,notices:[],skipped,controller:!skipped&&p.possessed?(active+1)%state.players.length:active},active,q=>({...q,skip:false,possessed:skipped?q.possessed:false}));
 return scheduleSeeds(next,next.expansionComplete?1:0);
}

export function tokenTargets(s:GameState):string[]{return s.seedCount?eligibleSpots(s.board,s.players.map(p=>p.spot),s.tokens):[];}
function scheduleSeeds(s:GameState,count:number):GameState{return {...s,seedCount:Math.min(count,s.supply.length,eligibleSpots(s.board,s.players.map(p=>p.spot),s.tokens).length)};}
export function seedToken(s:GameState,spot:string):GameState{if(!tokenTargets(s).includes(spot))throw new Error('Illegal token placement');const [token,...supply]=s.supply;if(!token)throw new Error('Empty supply');return scheduleSeeds({...s,supply,tokens:[...s.tokens,{spot,token,revealed:false}]},s.seedCount-1);}

function notice(s:GameState,player:number,token:Token,result:string):GameState{return {...s,notices:[...s.notices,{player,token,result}],encounter:token};}
function finish(s:GameState,normal:boolean):GameState{return normal?discover({...s,effect:null},s.players[s.active]!.spot):{...s,effect:null};}
function step(s:GameState,player:number,target:string,normal:boolean):GameState{
 const previous=s.players[player]!.spot,hit=s.tokens.find(t=>t.spot===target)?.token;
 let next=updatePlayer({...s,tokens:s.tokens.filter(t=>t.spot!==target)},player,p=>({...p,spot:target,inventory:hit&&hit.kind!=='trap'?[...p.inventory,hit]:p.inventory}));
 if(!hit)return normal?finish(next,true):next;
 if(hit.kind!=='trap'){next=notice(next,player,hit,'Collected.');return normal?finish(next,true):next;}
 next={...next,spent:[...next.spent,hit],effect:{kind:'trap',player,token:hit,previous,normal}};
 return next.players[player]!.inventory.some(t=>t.name==='Protective Charm')?next:resolveTrap(next,false);
}
export function resolveTrap(s:GameState,defend:boolean):GameState{
 const e=s.effect;if(e?.kind!=='trap')throw Error('No trap reaction');
 const charm=s.players[e.player]!.inventory.find(t=>t.name==='Protective Charm');
 if(defend){if(!charm)throw Error('No charm');return finish(notice(consume(s,e.player,charm),e.player,e.token,'Canceled by Protective Charm.'),e.normal);}
 let next=notice({...s,effect:null},e.player,e.token,'Trap triggered.');
 switch(e.token.name){
 case 'Snare':next=updatePlayer(next,e.player,p=>({...p,skip:true}));break;
 case 'Possession':next=updatePlayer(next,e.player,p=>({...p,possessed:true}));break;
 case 'Cave-In':if(freeNeighbors(next,e.player).includes(e.previous))return step(next,e.player,e.previous,false);break;
 case 'Grasping Hands':case 'Relic Curse':{
 const itemKind=e.token.name==='Relic Curse'?'relic':'item';
 if(next.players[e.player]!.inventory.some(t=>t.kind===itemKind)&&dropTargets(next,e.player).length)return {...next,effect:{kind:'drop',player:e.player,itemKind,normal:e.normal}};
 break;}
 }
 return finish(next,e.normal);
}
export function dropObject(s:GameState,itemId:string,spot:string):GameState{
 const e=s.effect;if(e?.kind!=='drop'||!dropTargets(s,e.player).includes(spot))throw Error('Illegal drop');
 const item=s.players[e.player]!.inventory.find(t=>t.id===itemId&&t.kind===e.itemKind);if(!item)throw Error('Invalid object');
 const next=updatePlayer({...s,tokens:[...s.tokens,{spot,token:item,revealed:true}]},e.player,p=>({...p,inventory:p.inventory.filter(t=>t.id!==itemId)}));
 return finish(next,e.normal);
}
export function usableItems(s:GameState):Token[]{
 if(s.pending||s.seedCount||s.effect||s.skipped)return [];
 return s.players[s.active]!.inventory.filter(t=>t.name==='Lantern'?lanternTargets(s).length>0:t.name==='Rusty Blade'||t.name==="Thief's Hook"?rivals(s,t).length>0:false);
}
export function useItem(s:GameState,id:string,target:string|number,stolen?:string):GameState{
 const item=usableItems(s).find(t=>t.id===id);if(!item)throw Error('Item unavailable');
 let next=consume({...s,notices:[]},s.active,item);
 if(item.name==='Lantern'){if(typeof target!=='string'||!lanternTargets(s).includes(target))throw Error('Invalid lantern target');const hit=s.tokens.find(t=>t.spot===target)!;return notice({...next,tokens:next.tokens.map(t=>t.spot===target?{...t,revealed:true}:t)},s.active,hit.token,'Revealed by Lantern; remains on board.');}
 if(typeof target!=='number'||!rivals(s,item).includes(target))throw Error('Invalid rival');
 if(item.name==="Thief's Hook"&&!s.players[target]!.inventory.some(t=>t.id===stolen))throw Error('Invalid stolen object');
 next={...next,effect:{kind:'attack',player:target,attacker:s.active,item,stolen}};
 return next.players[target]!.inventory.some(t=>t.name==='Smoke Bomb')?next:resolveAttack(next,false);
}
export function resolveAttack(s:GameState,defend:boolean):GameState{
 const e=s.effect;if(e?.kind!=='attack')throw Error('No attack');
 const smoke=s.players[e.player]!.inventory.find(t=>t.name==='Smoke Bomb');
 if(defend){if(!smoke)throw Error('No smoke bomb');return notice({...consume(s,e.player,smoke),effect:null},e.player,e.item,'Attack canceled by Smoke Bomb.');}
 if(e.item.name==='Rusty Blade')return {...s,effect:{kind:'blade',player:e.player,attacker:e.attacker,remaining:4}};
 const stolen=s.players[e.player]!.inventory.find(t=>t.id===e.stolen);if(!stolen)throw Error('Missing stolen object');
 const next=updatePlayer(updatePlayer({...s,effect:null},e.player,p=>({...p,inventory:p.inventory.filter(t=>t.id!==stolen.id)})),e.attacker,p=>({...p,inventory:[...p.inventory,stolen]}));
 return notice(next,e.attacker,stolen,'Stolen from '+s.players[e.player]!.name+'.');
}
export function bladeStep(s:GameState,target:string):GameState{
 const e=s.effect;if(e?.kind!=='blade'||!freeNeighbors(s,e.player).includes(target))throw Error('Invalid forced movement');
 const next=step({...s,effect:null,notices:[]},e.player,target,false);
 if(next.effect||next.notices.some(n=>n.token.kind==='trap')||e.remaining<=1||!freeNeighbors(next,e.player).length)return next;
 return {...next,effect:{...e,remaining:e.remaining-1}};
}
export function finishBlade(s:GameState):GameState{if(s.effect?.kind!=='blade'||s.effect.remaining===4)throw Error('Move at least once');return {...s,effect:null};}
