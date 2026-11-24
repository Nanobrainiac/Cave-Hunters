import { RULES } from '../data/config';
import { EXIT_ROOM } from '../data/rooms';
import { makeBoard,ROOM_DECK,rotations,expansionEnded,type PlacedRoom } from './exploration';
import { TOKEN_POOL,type Token } from './tokens';
import { type GameState,type Player } from './game';
import { type Effect,dropTargets,freeNeighbors,possessionPaths } from './effects';

export const SAVE_KEY='cave-hunters.save.v1';
export type SavedMatch={state:GameState;log:string[]};
const roomMap=new Map([EXIT_ROOM,...ROOM_DECK].map(r=>[r.id,r]));
const tokenMap=new Map(TOKEN_POOL.map(t=>[t.id,t]));
const fail=():never=>{throw Error('Invalid or incompatible Cave Hunters save');};
function obj(v:unknown):Record<string,unknown>{if(!v||typeof v!=='object'||Array.isArray(v))return fail();return v as Record<string,unknown>;}
function arr(v:unknown):unknown[]{if(!Array.isArray(v))return fail();return v;}
function str(v:unknown):string{if(typeof v!=='string')return fail();return v;}
function bool(v:unknown):boolean{if(typeof v!=='boolean')return fail();return v;}
function integer(v:unknown,min:number,max=Number.MAX_SAFE_INTEGER):number{if(typeof v!=='number'||!Number.isSafeInteger(v)||v<min||v>max)return fail();return v;}
function token(v:unknown):Token{const t=obj(v),canonical=tokenMap.get(str(t.id));if(!canonical||canonical.kind!==t.kind||canonical.name!==t.name)return fail();return canonical;}
function template(v:unknown){const t=roomMap.get(str(obj(v).id));if(!t||t.id==='exit')return fail();return t;}

export function encodeSave(state:GameState,log:readonly string[]):string{
 return JSON.stringify({version:1,state:{...state,notices:[],encounter:null},log:log.slice(-200)});
}
export function decodeSave(raw:string):SavedMatch{
 const envelope=obj(JSON.parse(raw));if(envelope.version!==1)return fail();
 const s=obj(envelope.state),boardData=obj(s.board);
 const rooms:PlacedRoom[]=arr(boardData.rooms).map((v,i)=>{
  const r=obj(v),id=str(r.id),t=i===0?EXIT_ROOM:template(r.template);
  if(id!==t.id||str(obj(r.template).id)!==id)return fail();
  const x=integer(r.x,-30,30),y=integer(r.y,-30,30),rotation=integer(r.rotation,0,3);
  if(i===0&&(x!==0||y!==0||rotation!==0))return fail();
  return {id,template:t,x,y,rotation};
 });
 if(!rooms.length||rooms.length>31||new Set(rooms.map(r=>r.id)).size!==rooms.length||new Set(rooms.map(r=>r.x+','+r.y)).size!==rooms.length)return fail();
 const board=makeBoard(rooms),nodes=new Set(board.nodes.map(n=>n.id));
 const reachable=new Set(['win']);let changed=true;
 while(changed){const before=reachable.size;for(const [a,b] of board.links){if(reachable.has(a)||reachable.has(b)){reachable.add(a);reachable.add(b);}}changed=reachable.size!==before;}
 if(reachable.size!==nodes.size)return fail();
 const spot=(v:unknown)=>{const id=str(v);if(!nodes.has(id))return fail();return id;};
 const players:Player[]=arr(s.players).map((v,i)=>{
  const p=obj(v),name=str(p.name),inventory=arr(p.inventory).map(token);
  if(p.id!==i||!name.trim()||name.length>32||inventory.some(t=>t.kind==='trap'))return fail();
  return {id:i,name,spot:spot(p.spot),inventory,skip:bool(p.skip)};
 });
 if(players.length<RULES.minPlayers||players.length>RULES.maxPlayers||new Set(players.map(p=>p.spot)).size!==players.length)return fail();
 const player=(v:unknown)=>integer(v,0,players.length-1);
 const active=player(s.active),first=player(s.first),deck=arr(s.deck).map(template),pending=s.pending===null?null:template(s.pending);
 const discarded=integer(s.discarded,0,30);
 const cards=[...rooms.slice(1).map(r=>r.id),...deck.map(r=>r.id),...(pending?[pending.id]:[])];
 if(new Set(cards).size!==cards.length||cards.length+discarded!==ROOM_DECK.length)return fail();
 const supply=arr(s.supply).map(token),spent=arr(s.spent).map(token);
 const tokens=arr(s.tokens).map(v=>{const t=obj(v);return {spot:spot(t.spot),token:token(t.token),revealed:bool(t.revealed)};});
 if(new Set(tokens.map(t=>t.spot)).size!==tokens.length||tokens.some(t=>players.some(p=>p.spot===t.spot))||spent.some(t=>t.kind==='relic'))return fail();
 const all=[...supply,...spent,...tokens.map(t=>t.token),...players.flatMap(p=>p.inventory)];
 if(all.length!==TOKEN_POOL.length||new Set(all.map(t=>t.id)).size!==all.length)return fail();
 let effect:Effect|null=null;
 if(s.effect!==null){
  const e=obj(s.effect),p=player(e.player);
  switch(e.kind){
   case 'trap':{const t=token(e.token);if(t.kind!=='trap'||!spent.some(q=>q.id===t.id)||!players[p]!.inventory.some(q=>q.name==='Protective Charm'))return fail();effect={kind:'trap',player:p,token:t,previous:spot(e.previous),normal:bool(e.normal)};break;}
   case 'drop':if(e.itemKind!=='item'&&e.itemKind!=='relic')return fail();effect={kind:'drop',player:p,itemKind:e.itemKind,normal:bool(e.normal)};break;
   case 'attack':{const item=token(e.item),attacker=player(e.attacker);if(attacker!==active||p===attacker||!spent.some(t=>t.id===item.id)||!players[p]!.inventory.some(t=>t.name==='Smoke Bomb')||!['Rusty Blade',"Thief's Hook"].includes(item.name))return fail();const stolen=e.stolen===undefined?undefined:str(e.stolen);if(item.name==="Thief's Hook"&&!players[p]!.inventory.some(t=>t.id===stolen))return fail();effect={kind:'attack',player:p,attacker,item,stolen};break;}
   case 'blade':case 'possession':{const attacker=player(e.attacker),remaining=integer(e.remaining,1,4);if(p===attacker||(e.kind==='blade'&&attacker!==active)||(e.kind==='possession'&&(attacker!==(p+1)%players.length||remaining!==4)))return fail();effect={kind:e.kind,player:p,attacker,remaining};break;}
   default:return fail();
  }
 }
 const moved=bool(s.moved),skipped=bool(s.skipped),expansionComplete=bool(s.expansionComplete),winner=s.winner===null?null:player(s.winner);
 if(pending&&(!moved||skipped||effect||winner!==null||expansionComplete||!rotations(board,players[active]!.spot,pending).length))return fail();
 if(!pending&&expansionComplete!==expansionEnded(board,deck))return fail();
 const qualifies=players.find(p=>p.spot==='win'&&p.inventory.filter(t=>t.kind==='relic').length>=RULES.relicsToWin);
 if(winner!==null&&(effect||pending||qualifies?.id!==winner)||winner===null&&!effect&&qualifies)return fail();
 const turn=integer(s.turn,1),round=integer(s.round,1);
 if(active!==(first+turn-1)%players.length||round!==Math.floor((turn-1)/players.length)+1)return fail();
 const state:GameState={players,active,first,turn,round,moved,board,deck,pending,discarded,expansionComplete,supply,tokens,spent,roll:s.roll===null?null:integer(s.roll,0,2),encounter:null,effect,notices:[],skipped,winner};
 if(effect?.kind==='drop'&&(!players[effect.player]!.inventory.some(t=>t.kind===effect.itemKind)||!dropTargets(state,effect.player).length))return fail();
 if(effect?.kind==='blade'&&!freeNeighbors(state,effect.player).length)return fail();
 if(effect?.kind==='possession'&&!possessionPaths(state).size)return fail();
 const log=arr(envelope.log).map(str).slice(-200);
 return {state,log};
}
