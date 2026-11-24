import { EXIT_ROOM, ROOM_SIZE, type RoomTemplate, type RoomNode } from '../data/rooms';
type Edge=NonNullable<RoomNode['edge']>;
const edges:Edge[]=['north','east','south','west'];
const dirs=[[0,-1],[1,0],[0,1],[-1,0]] as const;
const port=(e:Edge):RoomNode=>({id:e,x:e==='west'?0:e==='east'?300:150,y:e==='north'?0:e==='south'?300:150,kind:'connection',edge:e});
function template(id:string,name:string,ports:Edge[],dense:boolean):RoomTemplate{
 const nodes:RoomNode[]=[...ports.map(port),{id:'center',x:150,y:150,kind:'ordinary'}];
 const links:[string,string][]=[];
 for(const e of ports){const p=port(e);if(dense){nodes.push({id:e+'-mid',x:(p.x+150)/2,y:(p.y+150)/2,kind:'ordinary'});links.push([e,e+'-mid'],[e+'-mid','center']);}else links.push([e,'center']);}
 if(ports.length===1){nodes.push({id:'end',x:225,y:225,kind:'ordinary'});links.push(['center','end']);}
 return {id,name,nodes,links,starts:[]};
}
export const ROOM_DECK:readonly RoomTemplate[]=[
 ...Array.from({length:10},(_,i)=>template('corridor-'+i,'Corridor',['north','south'],i>=5)),
 ...Array.from({length:8},(_,i)=>template('turn-'+i,'Turn',['north','east'],i>=4)),
 ...Array.from({length:8},(_,i)=>template('area-'+i,'Open area',i<4?['north','east','south']:edges,i%2===0)),
 ...Array.from({length:4},(_,i)=>template('dead-'+i,'Dead end',['north'],i>=2))
];
export type PlacedRoom={id:string;template:RoomTemplate;x:number;y:number;rotation:number};
export type BoardNode=RoomNode & {roomId:string};
export type Board={rooms:readonly PlacedRoom[];nodes:readonly BoardNode[];links:readonly (readonly [string,string])[]};
export function shuffle<T>(items:readonly T[],random=Math.random):T[]{const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}return a;}
export function makeBoard(rooms:readonly PlacedRoom[]):Board{
 const nodes:BoardNode[]=[],links:[string,string][]=[];
 for(const r of rooms){const id=(n:string)=>r.id==='exit'?n:r.id+':'+n;for(const n of r.template.nodes){let x=n.x,y=n.y;for(let i=0;i<r.rotation;i++)[x,y]=[ROOM_SIZE-y,x];nodes.push({...n,id:id(n.id),roomId:r.id,x:x+r.x*ROOM_SIZE,y:y+r.y*ROOM_SIZE,edge:n.edge?edges[(edges.indexOf(n.edge)+r.rotation)%4]:undefined});}for(const [a,b] of r.template.links)links.push([id(a),id(b)]);}
 for(let i=0;i<nodes.length;i++){const a=nodes[i]!;if(!a.edge)continue;for(let j=i+1;j<nodes.length;j++){const b=nodes[j]!;if(b.edge&&a.roomId!==b.roomId&&a.x===b.x&&a.y===b.y&&(edges.indexOf(a.edge)+2)%4===edges.indexOf(b.edge))links.push([a.id,b.id]);}}
 return {rooms,nodes,links};
}
export function initialBoard():Board{return makeBoard([{id:'exit',template:EXIT_ROOM,x:0,y:0,rotation:0}]);}
export function openCell(board:Board,spot:string):{x:number;y:number;edge:Edge}|null{
 const n=board.nodes.find(n=>n.id===spot);if(!n?.edge)return null;const r=board.rooms.find(r=>r.id===n.roomId)!;const [dx,dy]=dirs[edges.indexOf(n.edge)]!;const x=r.x+dx,y=r.y+dy;if(board.rooms.some(r=>r.x===x&&r.y===y))return null;return {x,y,edge:n.edge};
}
export function rotations(board:Board,spot:string,card:RoomTemplate):number[]{
 const cell=openCell(board,spot);if(!cell)return [];const opposite=(edges.indexOf(cell.edge)+2)%4;return [0,1,2,3].filter(r=>card.nodes.some(n=>n.edge&&(edges.indexOf(n.edge)+r)%4===opposite));
}
export function addRoom(board:Board,spot:string,card:RoomTemplate,rotation:number):Board{
 const cell=openCell(board,spot);if(!cell||!rotations(board,spot,card).includes(rotation))throw new Error('Illegal room placement');
 return makeBoard([...board.rooms,{id:card.id,template:card,x:cell.x,y:cell.y,rotation}]);
}
export function expansionEnded(board:Board,deck:readonly RoomTemplate[]):boolean{return !deck.length||!board.nodes.some(n=>openCell(board,n.id));}
