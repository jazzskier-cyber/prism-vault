import {Leaderboard} from './leaderboard.js';
import {leaderboardConfig} from './leaderboard-config.js';
import {t} from './i18n.js';

export function createRankings({pause}) {
 const $=id=>document.getElementById(id),board=new Leaderboard(leaderboardConfig);
 const embedded=window.parent!==window;
 let run=null,score=null,attempt=0,loading=0;
 const available=()=>embedded&&board.available('endless');
 async function send(){
  const current=run,value=score,version=attempt;
  if(!current)return;
  $('retry-score').hidden=true;$('score-status').textContent=t('score.submitting');
  try{const receipt=await board.submit(current,value);if(version!==attempt)return;$('score-status').textContent=receipt.rank?t('score.acceptedRank',{rank:receipt.rank}):t('score.accepted');}
  catch(error){if(version!==attempt)return;$('score-status').textContent=t('score.failed',{error:error.message});$('retry-score').hidden=false;}
 }
 $('retry-score').onclick=send;
 $('rankings').onclick=async()=>{
  pause();const version=++loading;$('ranking-dialog').showModal();$('ranking-list').replaceChildren();$('ranking-me').textContent='';$('online-board').hidden=true;
  if(!available()){$('ranking-status').textContent=t(board.available('endless')?'rank.standalone':'rank.offline');return;}
  $('ranking-status').textContent=t('rank.loading');
  try{
   const data=await board.standings('endless');if(version!==loading)return;
   $('ranking-status').textContent=data.entries.length?'':t('rank.empty');
   for(const entry of data.entries){const row=document.createElement('li'),name=document.createElement('span'),points=document.createElement('strong');name.textContent=`#${entry.rank} · ${entry.displayName||entry.player?.displayName||t('rank.player')}`;points.textContent=Number(entry.score).toLocaleString();row.append(name,points);$('ranking-list').append(row);}
   $('ranking-me').textContent=data.me?t('rank.me',{score:Number(data.me.score).toLocaleString(),rank:data.me.rank}):t('rank.join');
   $('online-board').href=board.url('endless');$('online-board').hidden=false;
  }catch(error){if(version===loading)$('ranking-status').textContent=t('rank.error',{error:error.message});}
 };
 $('close-rankings').onclick=()=>{$('ranking-dialog').close();loading++;};
 $('ranking-dialog').addEventListener('cancel',()=>loading++);
 // Keep modal keys from starting or resuming a run behind the rankings.
 $('ranking-dialog').addEventListener('keydown',event=>event.stopPropagation());
 return {
  begin(mode){attempt++;score=null;run=mode==='endless'&&available()?board.begin('endless'):null;$('score-status').textContent='';$('retry-score').hidden=true;},
  finish(mode,value){if(mode!=='endless'){$('score-status').textContent=t('score.adventure');return;}if(value<1){$('score-status').textContent=t('score.tooLow');return;}score=value;if(run)send();else $('score-status').textContent=t('score.local');},
 };
}
