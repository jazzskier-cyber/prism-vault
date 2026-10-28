import {createRankings} from './rankings.js';
import {Game,SHAPES,COLORS} from './engine.js';
import {Adventure,GEM_COLORS} from './adventure.js';
import {createTreasure} from './treasure.js';
import {t,applyText} from './i18n.js';
applyText();document.title=t('doc.title');document.querySelector('meta[name=description]').content=t('doc.description');
const $=id=>document.getElementById(id),ctx=$('board').getContext('2d'),fx=$('effects').getContext('2d');
let mode='adventure',game=new Adventure(),state='ready',resumeState='playing',elapsed=0,last=performance.now(),gravity=0,lockTime=0,lockResets=0;
let particles=[],keys=new Map(),waves=[],waveIndex=0,waveTime=0,toastTime=0,sound=false,audio,best=0,restartPending=false;
const adventure=()=>game.mode==='adventure';
const bestKey=()=>mode==='adventure'?'prism-vault-adventure-best':'neon-stack-best';
const fmt=n=>String(n).padStart(6,'0');
function loadBest(){$('best-label').textContent=t(mode==='adventure'?'best.label':'best.labelClassic');try{best=Number(localStorage.getItem(bestKey()))||0;}catch{best=0;}$('best').textContent=fmt(best);}
function tone(freq,duration=.12,type='sine'){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);o.connect(g);g.connect(audio.destination);o.start();o.stop(audio.currentTime+duration);}catch{}}
function block(c,x,y,size,color,ghost=false){const p=size*.065;c.save();if(ghost){c.strokeStyle=color+'80';c.lineWidth=2;c.fillStyle=color+'12';c.fillRect(x+p,y+p,size-2*p,size-2*p);c.strokeRect(x+p,y+p,size-2*p,size-2*p);}else{const g=c.createLinearGradient(x,y,x+size,y+size);g.addColorStop(0,color);g.addColorStop(1,color+'a0');c.fillStyle=g;c.beginPath();c.roundRect(x+p,y+p,size-2*p,size-2*p,size*.1);c.fill();c.strokeStyle='#ffffff50';c.beginPath();c.moveTo(x+size*.2,y+size*.2);c.lineTo(x+size*.8,y+size*.2);c.stroke();c.fillStyle='#ffffff24';c.beginPath();c.moveTo(x+size*.5,y+size*.28);c.lineTo(x+size*.72,y+size*.5);c.lineTo(x+size*.5,y+size*.72);c.lineTo(x+size*.28,y+size*.5);c.fill();}c.restore();}
function drawPiece(p,ghost=false){p.matrix.forEach((r,y)=>r.forEach((v,x)=>{if(v&&p.y+y>=0)block(ctx,(p.x+x)*60,(p.y+y)*60,60,COLORS[p.color||p.type],ghost);}));}
function preview(canvas,types){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);types.forEach((type,i)=>{if(!type)return;const cells=[];SHAPES[type].forEach((r,y)=>r.forEach((v,x)=>{if(v)cells.push([x,y]);}));const xs=cells.map(p=>p[0]),ys=cells.map(p=>p[1]),minx=Math.min(...xs),miny=Math.min(...ys),size=24,slot=canvas.height/types.length;for(const [x,y]of cells)block(c,(canvas.width-(Math.max(...xs)-minx+1)*size)/2+(x-minx)*size,i*slot+(slot-(Math.max(...ys)-miny+1)*size)/2+(y-miny)*size,size,COLORS[adventure()?GEM_COLORS[type]:type]);});}
function render(){
 ctx.clearRect(0,0,600,1200);ctx.strokeStyle='#ffffff06';ctx.lineWidth=1;for(let x=0;x<=10;x++){ctx.beginPath();ctx.moveTo(x*60,0);ctx.lineTo(x*60,1200);ctx.stroke();}for(let y=0;y<=20;y++){ctx.beginPath();ctx.moveTo(0,y*60);ctx.lineTo(600,y*60);ctx.stroke();}
 const settling=state==='settling'||(state==='paused'&&resumeState==='settling');
 const wave=settling?waves[waveIndex]:null,board=wave?(waveTime<190?wave.before:wave.after):game.board;
 board.forEach((r,y)=>r.forEach((v,x)=>{if(v)block(ctx,x*60,y*60,60,COLORS[v]);}));
 if(wave&&waveTime<190){ctx.fillStyle=`rgba(255,255,255,${.28+.25*Math.sin(waveTime/35)})`;for(const c of wave.cells)ctx.fillRect(c.x*60+4,c.y*60+4,52,52);}
 if(!settling&&!game.over&&!game.chapterDone){drawPiece(game.ghost(),true);drawPiece(game.piece);}
 preview($('hold'),[game.held]);preview($('next'),game.queue.slice(0,5));$('hold').style.opacity=game.usedHold?'.35':'1';
 $('score').textContent=fmt(game.score);$('level').textContent=String(adventure()?game.chapter:game.level).padStart(2,'0');$('lines').textContent=String(adventure()?game.cleared:game.lines).padStart(2,'0');$('count-label').textContent=t(adventure()?'stats.cleared':'stats.lines');$('score-label').textContent=t(game.mode==='endless'?'stats.scoreClassic':'stats.score');
 $('progress').style.width=(adventure()?Math.min(100,game.cleared/game.target*100):game.lines%10*10)+'%';$('progress-label').textContent=adventure()?t('progress.adventure',{n:game.cleared,total:game.target}):t('progress.classic',{n:10-game.lines%10});
 $('mode-label').textContent=adventure()?t('mode.label',{n:String(game.chapter).padStart(2,'0'),name:t(`chapter.${game.chapter}`)}):t(game.mode==='classic-journey'?'mode.journey':'mode.classic');
 $('blast').hidden=!adventure();$('blast').disabled=state!=='playing'||!game.blasts;$('blast-count').textContent=t('blast.count',{n:game.blasts||0});
}
function toast(title,sub=''){const t=$('toast');t.replaceChildren(document.createTextNode(title));if(sub){const small=document.createElement('small');small.textContent=sub;t.append(small);}t.classList.add('show');toastTime=1800;}
function burst(cells){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;for(const {x,y,color}of cells)for(let i=0;i<6;i++)particles.push({x:x*60+30,y:y*60+30,vx:(Math.random()-.5)*420,vy:(Math.random()-.6)*450,life:.6+Math.random()*.4,color:COLORS[color]});}
function overlay(kind){
 $('overlay').classList.remove('hidden');document.querySelector('.mode-picker').style.display=kind==='end'?'flex':'none';
 const ending=kind==='pause'?'pause':game.won?'won':'lost';
 $('overlay-label').textContent=t(`over.${ending}Kicker`);$('overlay-title').innerHTML=t(`over.${ending}Title`);
 $('overlay-copy').innerHTML=kind==='pause'?t('over.pauseCopy'):t('over.score',{score:game.score.toLocaleString()})+(mode==='adventure'?t('over.adventureStats',{chain:game.maxChain,relics:game.relics})+(adventure()?'':t('over.journeyLines',{n:game.lines})):t('over.classicLines',{n:game.lines}));
 $('play').textContent=t(kind==='pause'?'over.resume':'over.again');$('overlay-footer').textContent=t(kind==='pause'?'over.pauseFooter':'over.endFooter');
}
function start(){
 mode=document.querySelector('[data-mode].selected').dataset.mode;game=mode==='adventure'?new Adventure():new Game();state='playing';resumeState='playing';restartPending=false;elapsed=gravity=lockTime=lockResets=0;particles=[];waves=[];keys.clear();loadBest();rankings.begin(mode);$('tip-copy').textContent=t(adventure()?'tip.adventure':'tip.classic');$('overlay').classList.add('hidden');$('toast').classList.remove('show');pauseLabel('pause');$('status').textContent=t(adventure()?'status.adventure':'status.classic');tone(440);render();
}
function pauseLabel(which){$('pause').innerHTML=`${which==='pause'?'Ⅱ':'▶'} <span>${t(`top.${which}`)}</span>`;}
function togglePause(){
 if(['ready','end','hunt'].includes(state))return;
 if(state==='paused'){state=resumeState;restartPending=false;$('overlay').classList.add('hidden');pauseLabel('pause');}
 else{resumeState=state;state='paused';keys.clear();overlay('pause');pauseLabel('resume');}render();
}
function finish(){state='end';keys.clear();rankings.finish(game.mode,game.score);if(game.score>best){best=game.score;$('best').textContent=fmt(best);try{localStorage.setItem(bestKey(),String(best));}catch{}}overlay('end');tone(game.won?880:160,.4);render();}
function afterResolve(){
 if(game.over){finish();return;}
 if(adventure()&&game.chapterDone){state='hunt';keys.clear();$('toast').classList.remove('show');treasure.open(game.chapter);render();return;}
 state='playing';render();
}
function waveFeedback(){const w=waves[waveIndex];toast(w.chain>1?t('fx.chain',{n:w.chain}):t('fx.blast'),t('fx.blastSub',{n:w.cells.length,points:w.points.toLocaleString()}));tone(Math.min(1400,440*Math.pow(1.25,w.chain)),.25,'triangle');$('status').textContent=t('status.chain',{n:w.chain});}
function locked(result){
 gravity=lockTime=lockResets=0;if(!result)return;keys.clear();
 if(adventure()){
  if(result.waves.length){waves=result.waves;waveIndex=0;waveTime=0;state='settling';waveFeedback();}else{tone(160,.06);afterResolve();}
 }else{
  if(result.count){toast(result.count===4?t('fx.tetris'):t('fx.lines',{n:result.count}),t('fx.points',{points:result.points.toLocaleString()}));burst(result.rows.flatMap(y=>Array.from({length:10},(_,x)=>({x,y,color:'T'}))));tone(660,.2);}else tone(160,.06);afterResolve();
 }render();
}
function action(a){
 if(state!=='playing')return;const grounded=!game.fits({...game.piece,y:game.piece.y+1});let moved=false;
 if(a==='left')moved=game.move(-1,0);if(a==='right')moved=game.move(1,0);if(a==='down'){moved=game.move(0,1);if(moved)game.score++;}
 if(a==='rotate'||a==='ccw'){moved=game.rotate(a==='ccw'?-1:1);if(moved)tone(330,.05);}
 if(a==='hold'&&game.hold()){gravity=lockTime=lockResets=0;tone(550);if(game.over)finish();}
 if(a==='drop')locked(game.drop());
 if(a==='blast'&&adventure()){const result=game.blast();if(result)locked(result);else toast(t(game.blasts?'blast.empty':'blast.none'),t(game.blasts?'blast.emptySub':'blast.noneSub'));}
 if(moved&&grounded&&lockResets<15){lockTime=0;lockResets++;}render();
}
const bindings={ArrowLeft:'left',ArrowRight:'right',ArrowDown:'down',ArrowUp:'rotate',KeyX:'rotate',KeyZ:'ccw',Space:'drop',KeyC:'hold',ShiftLeft:'hold',ShiftRight:'hold',KeyB:'blast'};
function play(){if(restartPending)start();else if(state==='paused')togglePause();else start();$('play').blur();}
$('play').onclick=play;$('pause').onclick=()=>{togglePause();$('pause').blur();};$('blast').onclick=()=>{action('blast');$('blast').blur();};
$('restart').onclick=()=>{if(state==='ready'||state==='end'){start();return;}if(state==='hunt')return;if(state!=='paused')togglePause();restartPending=true;$('overlay-title').innerHTML=t('restart.confirmTitle');$('overlay-copy').textContent=t('restart.confirmCopy');$('play').textContent=t('restart.confirmPlay');$('restart').blur();};
$('sound').onclick=()=>{sound=!sound;$('sound-label').textContent=t(sound?'sound.on':'sound.off');$('sound').setAttribute('aria-pressed',String(sound));tone(660);$('sound').blur();};
for(const b of document.querySelectorAll('[data-mode]'))b.onclick=()=>{mode=b.dataset.mode;document.querySelectorAll('[data-mode]').forEach(x=>x.classList.toggle('selected',x===b));loadBest();};
for(const b of document.querySelectorAll('[data-action]')){b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);const a=b.dataset.action;action(a);if(state==='playing'&&['left','right','down'].includes(a))keys.set('touch'+e.pointerId,{a,next:performance.now()+150});});for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,e=>keys.delete('touch'+e.pointerId));}
 document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if(e.target instanceof HTMLButtonElement&&['Space','Enter'].includes(e.code))return;if(bindings[e.code]||['Enter','Escape','KeyP'].includes(e.code))e.preventDefault();if(e.repeat)return;if(e.code==='Enter'){if(['ready','end','paused'].includes(state))play();return;}if(['Escape','KeyP'].includes(e.code)){togglePause();return;}const a=bindings[e.code];if(a){action(a);if(state==='playing'&&['left','right','down'].includes(a))keys.set(e.code,{a,next:performance.now()+(a==='down'?40:150)});}});
document.addEventListener('keyup',e=>keys.delete(e.code));
const autoPause=()=>{keys.clear();if(state==='playing'||state==='settling')togglePause();};window.addEventListener('blur',autoPause);document.addEventListener('visibilitychange',()=>{if(document.hidden)autoPause();});
let touch=null;$('board').style.touchAction='none';$('board').addEventListener('pointerdown',e=>{touch={x:e.clientX,y:e.clientY};});$('board').addEventListener('pointerup',e=>{if(!touch)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;if(dy>50)action('drop');else if(Math.abs(dx)>25)action(dx>0?'right':'left');else action('rotate');touch=null;});$('board').addEventListener('pointercancel',()=>touch=null);
const rankings=createRankings({pause:autoPause});
const treasure=createTreasure({onFind:()=>tone(750,.18,'triangle'),onComplete:(found,total)=>{game.nextChapter(found,total);gravity=lockTime=lockResets=0;keys.clear();if(game.over)finish();else{state='playing';if(adventure())toast(t('toast.chapter',{n:game.chapter,name:t(`chapter.${game.chapter}`)}),t('toast.blasts',{n:game.blasts}));else{toast(t('toast.journey'),t('toast.journeySub'));$('status').textContent=t('status.journey');$('tip-copy').textContent=t('tip.journey');}render();}}});
function frame(now){
 const dt=Math.min(now-last,80);last=now;
 if(state==='playing'){
  elapsed+=dt;for(const k of keys.values())if(now>=k.next){action(k.a);k.next=now+(k.a==='down'?35:45);}
  if(state==='playing'){gravity+=dt;const interval=adventure()?Math.max(300,1050-(game.chapter-1)*120):Math.max(65,900*Math.pow(.79,game.level-1));if(gravity>=interval){game.move(0,1);gravity=0;render();}if(!game.fits({...game.piece,y:game.piece.y+1})){lockTime+=dt;if(lockTime>=500)locked(game.lock());}else lockTime=0;}
 }else if(state==='settling'){
  const previous=waveTime;waveTime+=dt;if(previous<190&&waveTime>=190)burst(waves[waveIndex].cells);
  if(waveTime>=530){waveTime=0;waveIndex++;if(waveIndex>=waves.length){waves=[];afterResolve();}else waveFeedback();}render();
 }
 $('timer').textContent=`${String(Math.floor(elapsed/60000)).padStart(2,'0')}:${String(Math.floor(elapsed/1000)%60).padStart(2,'0')}`;
 fx.clearRect(0,0,600,1200);if(state!=='paused'){particles=particles.filter(p=>p.life>0);for(const p of particles){p.life-=dt/1000;p.x+=p.vx*dt/1000;p.y+=p.vy*dt/1000;p.vy+=600*dt/1000;fx.globalAlpha=Math.max(0,p.life);fx.fillStyle=p.color;fx.fillRect(p.x,p.y,7,7);}fx.globalAlpha=1;toastTime-=dt;if(toastTime<=0)$('toast').classList.remove('show');}
 requestAnimationFrame(frame);
}
loadBest();render();requestAnimationFrame(frame);
