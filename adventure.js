import {Game} from './engine.js';

export const GEM_COLORS={I:'I',J:'I',L:'L',O:'L',S:'T',T:'T',Z:'T'};
export const CHAPTERS=['微光入口','月影花房','星尘工坊'];
export const copyBoard=board=>board.map(row=>[...row]);

// Orthogonal groups only: a single four-cell piece cannot pop by itself.
export function findMatches(board,threshold=6){
 const seen=new Set(),matches=new Map();
 for(let y=0;y<20;y++)for(let x=0;x<10;x++){
  const color=board[y][x],id=y*10+x;if(!color||seen.has(id))continue;
  const group=[],pending=[[x,y]];seen.add(id);
  while(pending.length){const [cx,cy]=pending.pop();group.push([cx,cy]);for(const [nx,ny]of [[cx-1,cy],[cx+1,cy],[cx,cy-1],[cx,cy+1]]){const n=ny*10+nx;if(nx>=0&&nx<10&&ny>=0&&ny<20&&!seen.has(n)&&board[ny][nx]===color){seen.add(n);pending.push([nx,ny]);}}}
  if(group.length>=threshold)for(const [gx,gy]of group)matches.set(gy*10+gx,{x:gx,y:gy,color});
 }
 // Full rows are still useful, and can start a gravity cascade.
 let lines=0;board.forEach((row,y)=>{if(row.every(Boolean)){lines++;row.forEach((color,x)=>matches.set(y*10+x,{x,y,color}));}});
 return {cells:[...matches.values()],lines};
}
export function collapse(board){
 for(let x=0;x<10;x++){const column=board.map(row=>row[x]).filter(Boolean);for(let y=19;y>=0;y--)board[y][x]=column.pop()||null;}
 return board;
}
export function resolveCascades(board,initial=[]){
 const waves=[];let forced=initial;
 for(let chain=1;chain<=50;chain++){
  const match=findMatches(board),cells=new Map(match.cells.map(c=>[c.y*10+c.x,c]));
  for(const c of forced)if(board[c.y]?.[c.x])cells.set(c.y*10+c.x,{...c,color:board[c.y][c.x]});
  forced=[];if(!cells.size)break;
  const before=copyBoard(board),removed=[...cells.values()];
  removed.forEach(({x,y})=>board[y][x]=null);collapse(board);
  waves.push({before,after:copyBoard(board),cells:removed,chain,lines:match.lines,points:removed.length*25*chain+match.lines*100*chain});
 }
 return waves;
}

export class Adventure extends Game {
 constructor(random=Math.random){super('adventure',random);this.chapter=1;this.cleared=0;this.totalCleared=0;this.maxChain=0;this.blasts=1;this.relics=0;this.chapterDone=false;this.target=28;this.seed();}
 spawn(type){super.spawn(type);if(this.mode==='adventure')this.piece.color=GEM_COLORS[this.piece.type];}
 seed(){
  // Three ready-to-connect bands teach the color rule immediately, without a scripted win.
  this.board=Array.from({length:20},()=>Array(10).fill(null));
  const colors=['I','L','T'];for(let y=17;y<20;y++)for(let x=0;x<9;x++)this.board[y][x]=colors[(Math.floor(x/3)+(19-y)+(this.chapter-1))%3];
 }
 settle(initial=[]){
  const waves=resolveCascades(this.board,initial);
  const removed=waves.reduce((sum,w)=>sum+w.cells.length,0),points=waves.reduce((sum,w)=>sum+w.points,0);
  this.cleared+=removed;this.totalCleared+=removed;this.score+=points;this.lines+=waves.reduce((sum,w)=>sum+w.lines,0);this.maxChain=Math.max(this.maxChain,waves.length);
  this.chapterDone=this.cleared>=this.target;
  return {waves,removed,points,count:0,rows:[]};
 }
 lock(){
  if(this.mode!=='adventure')return super.lock();
  if(this.over||this.chapterDone)return null;let topped=false;
  this.piece.matrix.forEach((row,y)=>row.forEach((v,x)=>{if(v){if(this.piece.y+y<0)topped=true;else this.board[this.piece.y+y][this.piece.x+x]=this.piece.color;}}));
  if(topped){this.over=true;return {waves:[],removed:0,points:0};}
  const result=this.settle();if(!this.chapterDone)this.spawn();return result;
 }
 blast(){
  if(this.mode!=='adventure'||this.over||this.chapterDone||this.blasts<1)return null;
  // Aim using the active piece: blast a three-column shaft below its center.
  const occupied=[];this.piece.matrix.forEach((r,y)=>r.forEach((v,x)=>{if(v)occupied.push(this.piece.x+x);}));
  const center=Math.round(occupied.reduce((a,b)=>a+b,0)/occupied.length),cells=[];
  for(let y=0;y<20;y++)for(let x=Math.max(0,center-1);x<=Math.min(9,center+1);x++)if(this.board[y][x])cells.push({x,y});
  if(!cells.length)return null;this.blasts--;const result=this.settle(cells);
  // Collapsing gems must never trap an already-falling piece inside the stack.
  while(!this.fits(this.piece)&&this.piece.y>-4)this.piece.y--;
  return result;
 }
 nextChapter(found,total){
  if(this.mode!=='adventure'||!this.chapterDone||this.over)return false;
  this.relics+=found;this.score+=found*150+(found===total?500:0);this.blasts=Math.min(5,this.blasts+(found===total?2:found>0?1:0));
  if(this.chapter===CHAPTERS.length){
   // Keep this journey's score and relics, but switch all future locks to classic rules.
   this.mode='classic-journey';this.chapterDone=false;this.blasts=0;
   this.board=Array.from({length:20},()=>Array(10).fill(null));
   this.lines=0;this.level=1;this.combo=-1;this.b2b=false;this.held=null;this.spawn();return true;
  }
  this.chapter++;this.level=this.chapter;this.cleared=0;this.target=28+(this.chapter-1)*8;this.chapterDone=false;this.seed();this.held=null;this.spawn();return true;
 }
}
