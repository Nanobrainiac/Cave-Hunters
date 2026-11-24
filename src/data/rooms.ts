export type Point = { x: number; y: number };
export type RoomNode = Point & { id: string; kind: 'ordinary' | 'connection' | 'exit'; edge?: 'north' | 'east' | 'south' | 'west' };
export type RoomTemplate = { id: string; name: string; nodes: readonly RoomNode[]; links: readonly (readonly [string,string])[]; starts: readonly string[] };
export const ROOM_SIZE = 300;
// Prototype geometry: six starts on a ring, central exit, four edge ports.
// Boundary coordinates intentionally use 0 or ROOM_SIZE for future tile alignment.
export const EXIT_ROOM: RoomTemplate = {
 id:'exit', name:'Exit',
 nodes:[
  {id:'win',x:150,y:150,kind:'exit'},
  {id:'s1',x:85,y:85,kind:'ordinary'}, {id:'s2',x:215,y:85,kind:'ordinary'},
  {id:'s3',x:85,y:150,kind:'ordinary'}, {id:'s4',x:215,y:150,kind:'ordinary'},
  {id:'s5',x:85,y:215,kind:'ordinary'}, {id:'s6',x:215,y:215,kind:'ordinary'},
  {id:'n',x:150,y:0,kind:'connection',edge:'north'},
  {id:'e',x:300,y:150,kind:'connection',edge:'east'},
  {id:'s',x:150,y:300,kind:'connection',edge:'south'},
  {id:'w',x:0,y:150,kind:'connection',edge:'west'},
 ],
 links:[['s1','s2'],['s2','s4'],['s4','s6'],['s6','s5'],['s5','s3'],['s3','s1'],['s3','win'],['win','s4'],['n','s1'],['n','s2'],['e','s4'],['s','s5'],['s','s6'],['w','s3']],
 starts:['s1','s2','s3','s4','s5','s6'],
};
export const PLAYER_COLORS = ['#62cbb0','#f18a79','#91b8ff','#f4cb72','#c5a0f5','#f59cc6'] as const;
