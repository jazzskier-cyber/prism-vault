import test from 'node:test';
import assert from 'node:assert/strict';
import {Adventure,findMatches,collapse,resolveCascades} from './adventure.js';
import {makeHunt} from './treasure.js';
const empty=()=>Array.from({length:20},()=>Array(10).fill(null));
test('one tetromino cannot clear itself; six orthogonal neighbors can',()=>{const b=empty();for(let x=0;x<4;x++)b[19][x]='I';assert.equal(findMatches(b).cells.length,0);b[18][0]=b[18][1]='I';assert.equal(findMatches(b).cells.length,6);});
test('diagonal contact does not join colors',()=>{const b=empty();for(let i=0;i<8;i++)b[19-i][i]='I';assert.equal(findMatches(b).cells.length,0);});
test('falling gems create a second, higher-scoring chain',()=>{const b=empty();for(let x=0;x<6;x++)b[19][x]='I';for(let x=0;x<3;x++)b[18][x]='L';for(let x=3;x<6;x++)b[17][x]='L';const waves=resolveCascades(b);assert.equal(waves.length,2);assert.equal(waves[0].points,150);assert.equal(waves[1].points,300);assert.equal(b.flat().filter(Boolean).length,0);assert.equal(waves[0].before[19][0],'I');assert.equal(waves[1].before[19][0],'L');});
test('full rows clear even with mixed colors, counting each cell once',()=>{const b=empty();b[19]=['I','I','I','I','I','I','T','L','T','L'];const [wave]=resolveCascades(b);assert.equal(wave.cells.length,10);assert.equal(wave.lines,1);assert.equal(wave.points,350);});
test('gravity preserves vertical order and fills holes',()=>{const b=empty();b[3][0]='I';b[10][0]='L';b[19][0]='T';collapse(b);assert.deepEqual(b.slice(17).map(r=>r[0]),['I','L','T']);assert.equal(b.slice(0,17).flat().filter(Boolean).length,0);});
test('chapter completion waits for treasure and awards once',()=>{const g=new Adventure();g.chapterDone=true;g.cleared=g.target;g.nextChapter(5,5);assert.equal(g.chapter,2);assert.equal(g.score,1250);assert.equal(g.blasts,3);assert.equal(g.relics,5);assert.equal(g.nextChapter(5,5),false);assert.equal(g.score,1250);assert.equal(findMatches(g.board).cells.length,0);});
test('partial and skipped searches give appropriate rewards',()=>{const g=new Adventure();g.chapterDone=true;g.nextChapter(2,5);assert.equal(g.score,300);assert.equal(g.blasts,2);g.chapterDone=true;g.nextChapter(0,7);assert.equal(g.score,300);assert.equal(g.blasts,2);});
test('exactly three treasure rooms then classic endless, retaining score and relics',()=>{
 const g=new Adventure();
 for(const total of [5,7,5]){g.chapterDone=true;assert.equal(g.nextChapter(total,total),true);}
 assert.equal(g.mode,'classic-journey');assert.equal(g.over,false);assert.equal(g.won,false);
 assert.equal(g.score,4050);assert.equal(g.relics,17);assert.equal(g.level,1);assert.equal(g.lines,0);
 assert.equal(g.board.flat().filter(Boolean).length,0);assert.equal(g.blasts,0);assert.equal(g.blast(),null);
 assert.equal(g.piece.color,undefined);assert.equal(g.nextChapter(5,5),false);assert.equal(g.score,4050);
 // Connected colors no longer explode, and locking never opens another treasure room.
 g.board[19].fill('T',0,6);g.spawn('O');g.piece.x=8;g.drop();
 assert.equal(g.board[19].filter(Boolean).length,8);assert.equal(g.chapterDone,false);
 // Ordinary full-row scoring still works after the transition.
 g.board=empty();g.board[19].fill('J');g.board[19][4]=g.board[19][5]=null;
 g.spawn('O');const result=g.drop();assert.equal(result.count,1);assert.equal(g.lines,1);
 assert.equal(g.chapterDone,false);assert.equal(g.mode,'classic-journey');
});
test('blast consumes a charge only when it hits something',()=>{const g=new Adventure();g.board=empty();assert.equal(g.blast(),null);assert.equal(g.blasts,1);g.board[19].fill('T');const r=g.blast();assert.ok(r.removed>=10);assert.equal(g.blasts,0);assert.equal(g.blast(),null);});
test('treasure types alternate and targets remain inside the scene',()=>{for(let chapter=1;chapter<=3;chapter++){const hunt=makeHunt(chapter);assert.equal(hunt.objects.length,chapter%2?5:7);assert.equal(new Set(hunt.objects.map(o=>o.kind)).size,chapter%2?5:1);for(const o of hunt.objects){assert.ok(o.x>=0&&o.x+o.size<800);assert.ok(o.y>=0&&o.y+o.size<500);}}});
test('cascade resolution terminates with no remaining matches',()=>{let seed=17;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};for(let i=0;i<100;i++){const b=empty();for(let y=8;y<20;y++)for(let x=0;x<10;x++)b[y][x]=[null,'I','L','T'][Math.floor(random()*4)];const before=b.flat().filter(Boolean).length;const waves=resolveCascades(b);assert.equal(findMatches(b).cells.length,0);assert.equal(before-b.flat().filter(Boolean).length,waves.reduce((s,w)=>s+w.cells.length,0));}});
