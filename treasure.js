import {t} from './i18n.js';
// Hand-drawn SVG rooms and real clickable objects; all art ships locally.
// Each room is painted in layers: back, the relics, then foreground leaves and light, so relics sit inside the scene.
const symbols=`<defs>
<linearGradient id="ws-wall" x2="0" y2="1"><stop stop-color="#1b1828"/><stop offset=".7" stop-color="#2a2131"/><stop offset="1" stop-color="#33262d"/></linearGradient>
<linearGradient id="ws-floor" x2="0" y2="1"><stop stop-color="#2f2220"/><stop offset="1" stop-color="#151012"/></linearGradient>
<linearGradient id="gh-sky" x2="0" y2="1"><stop stop-color="#0c1a2e"/><stop offset=".75" stop-color="#16344a"/><stop offset="1" stop-color="#1d4250"/></linearGradient>
<linearGradient id="night" x2="0" y2="1"><stop stop-color="#1c2f4f"/><stop offset="1" stop-color="#3b5d7c"/></linearGradient>
<linearGradient id="beam" x2="0" y2="1"><stop stop-color="#bcd7ff" stop-opacity=".2"/><stop offset="1" stop-color="#bcd7ff" stop-opacity="0"/></linearGradient>
<radialGradient id="moonglow"><stop stop-color="#f6efd4" stop-opacity=".45"/><stop offset="1" stop-color="#f6efd4" stop-opacity="0"/></radialGradient>
<radialGradient id="warm"><stop stop-color="#ffc66e" stop-opacity=".42"/><stop offset=".45" stop-color="#ff9e4a" stop-opacity=".12"/><stop offset="1" stop-color="#ff9e4a" stop-opacity="0"/></radialGradient>
<radialGradient id="brew"><stop stop-color="#8dffbf" stop-opacity=".35"/><stop offset="1" stop-color="#8dffbf" stop-opacity="0"/></radialGradient>
<radialGradient id="ffglow"><stop stop-color="#f4ff9a" stop-opacity=".95"/><stop offset=".35" stop-color="#d9f56b" stop-opacity=".35"/><stop offset="1" stop-color="#d9f56b" stop-opacity="0"/></radialGradient>
<radialGradient id="vignette" r=".75"><stop offset=".55" stop-color="#05060f" stop-opacity="0"/><stop offset="1" stop-color="#05060f" stop-opacity=".78"/></radialGradient>
<filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
<filter id="shade" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#000" flood-opacity=".55"/></filter>
<symbol id="key" viewBox="0 0 40 40"><circle cx="13" cy="12" r="7" fill="none" stroke="#e2b765" stroke-width="4"/><path d="M18 18l15 15m-5-5 5-5m-10 0 5-5" fill="none" stroke="#e2b765" stroke-width="4" stroke-linecap="round"/><path d="M9 9a5 5 0 0 1 5-2" stroke="#fff3c9" stroke-width="1.5" fill="none" opacity=".8"/></symbol>
<symbol id="bottle" viewBox="0 0 40 40"><path d="M15 5h10v10l7 12q4 10-12 10T8 27l7-12z" fill="#2f4f52" stroke="#e8dcae" stroke-width="1.5"/><path d="M10 25q10 4 20 0 3 9-10 10T10 25z" fill="#6fe0c0"/><path d="M14 5h12" stroke="#b08a5a" stroke-width="5"/><path d="M13 22q-2 4 0 8" stroke="#fff" stroke-width="1.5" fill="none" opacity=".55"/></symbol>
<symbol id="moon" viewBox="0 0 40 40"><circle cx="22" cy="4" r="2.5" fill="none" stroke="#e9cf8f" stroke-width="1.5"/><path d="M28 7C6 4 3 34 22 36q11 0 14-12C19 32 13 12 28 7" fill="#e9cf8f" stroke="#fff1c7" stroke-width=".8"/></symbol>
<symbol id="feather" viewBox="0 0 40 40"><path d="M7 33C0 11 26-1 34 6c4 13-13 30-27 27" fill="#c3d3dc"/><path d="M5 37 29 11m-16 17 9-1m-3-5 9-2m-5-4 7-1" stroke="#5d7582" fill="none" stroke-width="1.6" stroke-linecap="round"/></symbol>
<symbol id="gem" viewBox="0 0 40 40"><path d="m20 3 15 16-15 18L5 19z" fill="#a77fe0" stroke="#e6d4ff" stroke-width="1"/><path d="m20 3-5 16 5 18 6-18z" fill="#dcc8ff" opacity=".55"/><path d="M5 19h30" stroke="#e6d4ff" stroke-width=".8" opacity=".7"/></symbol>
<symbol id="firefly" viewBox="0 0 40 40"><ellipse cx="13" cy="15" rx="7" ry="10" transform="rotate(-35 13 15)" fill="#dfe9d2" opacity=".55"/><ellipse cx="27" cy="15" rx="7" ry="10" transform="rotate(35 27 15)" fill="#dfe9d2" opacity=".55"/><path d="M20 11v15" stroke="#2d3a2a" stroke-width="4" stroke-linecap="round"/><ellipse cx="20" cy="28" rx="5" ry="7" fill="#f2f58a"/><path d="m20 11-4-5m4 5 4-5" stroke="#9fb07a" fill="none"/></symbol>
</defs>`;
const random=seed=>()=>(seed=seed*16807%2147483647)/2147483647;
const herb=(x,len)=>`<path d="M${x} 24v${len}" stroke="#6b5a48" stroke-width="1.5"/><g transform="translate(${x} ${24+len})"><path d="M-3 0h6l10 40-13-7-13 7z" fill="#4f6343"/><path d="M0 2v34M-6 10l6 10 6-10" stroke="#7f9466" fill="none" stroke-width="1.4"/><rect x="-5" y="-3" width="10" height="5" rx="1" fill="#a0764e"/></g>`;
const leaf=(x,y,len,angle,fill='#2c4a39',vein='#4f7a5c')=>`<g transform="translate(${x} ${y}) rotate(${angle})"><path d="M0 0q${len*.5} ${-len*.32} ${len} 0q${-len*.5} ${len*.32} ${-len} 0z" fill="${fill}"/><path d="M2 0H${len-4}" stroke="${vein}" stroke-width="1.4"/></g>`;
const jar=(x,y,color)=>`<circle cx="${x+10}" cy="${y-12}" r="20" fill="${color}" opacity=".16" filter="url(#blur)"/><rect x="${x}" y="${y-28}" width="20" height="28" rx="5" fill="${color}" opacity=".6"/><rect x="${x+3}" y="${y-33}" width="14" height="6" rx="1" fill="#6e5443"/><path d="M${x+5} ${y-22}v12" stroke="#fff" opacity=".35" stroke-width="2" stroke-linecap="round"/>`;
const motes=(r,color,count)=>Array.from({length:count},(_,i)=>`<circle class="mote" style="animation-delay:-${(r()*12).toFixed(1)}s" cx="${(r()*800).toFixed(0)}" cy="${(80+r()*380).toFixed(0)}" r="${(1+r()*1.6).toFixed(1)}" fill="${color}"/>`).join('');
function workshop(chapter){
 const r=random(chapter*977+13);
 let back=`<rect width="800" height="500" fill="url(#ws-wall)"/><path d="${Array.from({length:8},(_,i)=>`M${i*100+50} 26V410`).join('')}" stroke="#fff" opacity=".025" stroke-width="2"/>`;
 back+=`<rect y="410" width="800" height="90" fill="url(#ws-floor)"/><path d="M0 410H800" stroke="#000" opacity=".5" stroke-width="3"/><path d="M0 440H800M0 472H800M120 410l-6 30M410 440l-5 32M640 410l-4 30M260 472l-4 28M700 472l-3 28" stroke="#c49a73" opacity=".1"/>`;
 back+=`<circle cx="588" cy="112" r="95" fill="url(#moonglow)"/><path d="M470 255V130a80 80 0 0 1 160 0v125z" fill="url(#night)"/>${Array.from({length:9},()=>`<circle cx="${(480+r()*140).toFixed(0)}" cy="${(70+r()*120).toFixed(0)}" r="${(.6+r()).toFixed(1)}" fill="#fff" opacity="${(.4+r()*.5).toFixed(2)}"/>`).join('')}<circle cx="588" cy="112" r="20" fill="#f3ecd2"/><circle cx="582" cy="106" r="4" fill="#ddd3b4"/><path d="m478 255 40-48 26 30 30-40 48 58z" fill="#24354d"/><path d="M550 50V255M470 170H630" stroke="#3b2e2a" stroke-width="6"/><path d="M470 255V130a80 80 0 0 1 160 0v125z" fill="none" stroke="#5a4438" stroke-width="10"/><rect x="458" y="252" width="184" height="12" rx="2" fill="#6e5443"/>`;
 back+=`<rect width="800" height="24" fill="#241a19"/><rect y="22" width="800" height="5" fill="#000" opacity=".3"/>${herb(118,26)}${herb(196,12)}${herb(372,30)}${herb(690,16)}`;
 back+=`<g transform="translate(728 138)" opacity=".85"><circle r="44" fill="#1c1622" stroke="#b08d57" stroke-width="3"/><circle r="32" fill="none" stroke="#8c6f45" stroke-width="1.5"/><ellipse rx="44" ry="14" fill="none" stroke="#b08d57" stroke-width="1.5" transform="rotate(-25)"/><path d="M-44 0H44M0-44V44" stroke="#8c6f45"/><circle r="5" fill="#d8b36e"/></g>`;
 for(let i=0;i<3;i++){const y=130+i*92;let x=44;
  back+=`<rect x="34" y="${y}" width="232" height="9" rx="2" fill="#5b4334"/><rect x="34" y="${y+9}" width="232" height="4" fill="#000" opacity=".35"/><path d="M48 ${y+13}v12h10M252 ${y+13}v12h-10" stroke="#3e2d24" stroke-width="4" fill="none"/>`;
  while(x<252){if(i===1&&x>168){back+=jar(x,y,['#6fe0c0','#c79bf0','#f0b866'][Math.floor(r()*3)]);x+=28;continue;}if(r()<.14){x+=20;continue;}
   const w=Math.round(11+r()*10),h=Math.round(32+r()*30);if(x+w>258)break;const c=['#6b3f4a','#3f5a5e','#7a6440','#4b4466','#5e3b3b','#3d4f3f','#5a4a6e'][Math.floor(r()*7)],lean=r()<.15?(r()<.5?-7:7):0;
   back+=`<g transform="rotate(${lean} ${x+w/2} ${y})"><rect x="${x}" y="${y-h}" width="${w}" height="${h}" rx="1.5" fill="${c}"/><rect x="${x}" y="${y-h}" width="3" height="${h}" fill="#fff" opacity=".06"/><path d="M${x+2} ${y-h+6}h${w-4}M${x+2} ${y-8}h${w-4}" stroke="#d9bf8a" opacity=".4"/></g>`;x+=w+1;}}
 back+=`<rect x="640" y="250" width="150" height="8" rx="2" fill="#5b4334"/><rect x="640" y="258" width="150" height="3" fill="#000" opacity=".35"/>${jar(650,250,'#f0b866')}${jar(726,250,'#6fe0c0')}${jar(756,250,'#c79bf0')}`;
 back+=`<path d="M300 500 478 255H622L640 500z" fill="url(#beam)"/>`;
 back+=`<ellipse cx="380" cy="464" rx="250" ry="32" fill="#3a2030"/><ellipse cx="380" cy="464" rx="232" ry="25" fill="none" stroke="#b08d57" stroke-width="2" opacity=".45" stroke-dasharray="7 6"/>`;
 back+=`<ellipse cx="370" cy="452" rx="210" ry="10" fill="#000" opacity=".35"/><rect x="186" y="374" width="14" height="80" fill="#3f2c22"/><rect x="540" y="374" width="14" height="80" fill="#3f2c22"/><path d="M160 362h420l-14 14H174z" fill="#5a3f30"/><rect x="160" y="354" width="420" height="9" rx="2" fill="#8a6549"/>`;
 back+=`<g transform="translate(200 338)"><path d="M0 16 40 9l40 7V3L40-5 0 3z" fill="#e4d3ac"/><path d="M40-5v14" stroke="#8a7550"/><path d="M6 6h28M6 11h24M46 6h28M46 11h22" stroke="#8a7550" opacity=".5"/></g>`;
 back+=`<path d="M314 354h32l-4-7h-24z" fill="#a37c45"/><rect x="322" y="316" width="16" height="32" rx="2" fill="#efe3c4"/><path d="M322 322q4 3 2 9" stroke="#fff" opacity=".5" fill="none"/><path d="M330 316v-4" stroke="#2a2020" stroke-width="1.5"/><path class="flame" d="M330 296q-8 10 0 18 8-8 0-18z" fill="#ffc45e"/><path class="flame" d="M330 302q-3.5 6 0 10.5 3.5-4.5 0-10.5z" fill="#fff4cf"/>`;
 back+=`<path d="M406 340h48q-2 16-24 16t-24-16z" fill="#6e737b"/><ellipse cx="430" cy="340" rx="24" ry="4" fill="#4b4f56"/><path d="M438 343l16-28" stroke="#9aa0a6" stroke-width="6" stroke-linecap="round"/>`;
 back+=`<g fill="#d8c59b"><rect x="488" y="340" width="58" height="11" rx="5.5"/><rect x="494" y="330" width="48" height="10" rx="5"/></g><g fill="#a68c62"><circle cx="488" cy="345.5" r="5.5"/><circle cx="494" cy="335" r="5"/></g><path d="M530 340l6-18" stroke="#3a2a2a" stroke-width="3"/>`;
 back+=`<circle cx="682" cy="410" r="80" fill="url(#brew)"/><ellipse cx="680" cy="476" rx="66" ry="16" fill="#ff8a3d" opacity=".35" filter="url(#blur)"/><path d="M638 478l84-12M638 466l84 12" stroke="#4a2e22" stroke-width="8" stroke-linecap="round"/><path class="flame" d="M662 474q-7-14 4-24 2 12 8 6 6 10-12 18z" fill="#ff9a45"/><path class="flame" d="M690 474q-6-12 5-20 1 10 7 5 4 9-12 15z" fill="#ffc45e"/>`;
 back+=`<path d="M630 410q0 54 50 54t50-54z" fill="#25272d"/><path d="M640 420q4 30 30 38" stroke="#fff" opacity=".08" stroke-width="6" fill="none"/><ellipse cx="680" cy="410" rx="52" ry="12" fill="#3a3d44"/><ellipse cx="680" cy="410" rx="44" ry="8" fill="#63c98f"/><ellipse class="brew" cx="676" cy="409" rx="30" ry="4" fill="#c6ffdc" opacity=".45"/>${[0,1,2].map(i=>`<path class="steam" style="animation-delay:-${i*1.4}s" d="M${664+i*15} 398q-12-24 4-44t-2-44" stroke="#d3f5e1" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}`;
 const front=`<g>${leaf(-10,470,120,-50,'#22392d','#3f644e')}${leaf(10,500,140,-70,'#2a4535','#4b7559')}${leaf(30,488,110,-25,'#1f3428','#3a5d48')}<path d="M24 500h80l-8-34H32z" fill="#7a4a35"/><path d="M28 470h72" stroke="#9a6044" stroke-width="5"/></g>`+
  `<circle cx="330" cy="306" r="190" fill="url(#warm)" style="mix-blend-mode:screen"/>${motes(r,'#ffe2b0',16)}<rect width="800" height="500" fill="url(#vignette)"/>`;
 return {back,front,label:'hunt.workshopScene'};
}
function greenhouse(chapter){
 const r=random(chapter*389+7);
 let back=`<rect width="800" height="500" fill="url(#gh-sky)"/>${Array.from({length:42},()=>`<circle cx="${(r()*800).toFixed(0)}" cy="${(r()*300).toFixed(0)}" r="${(.5+r()*1.1).toFixed(1)}" fill="#fff" opacity="${(.25+r()*.6).toFixed(2)}"/>`).join('')}`;
 back+=`<circle cx="662" cy="86" r="110" fill="url(#moonglow)"/><circle cx="662" cy="86" r="24" fill="#f3ecd2"/><circle cx="655" cy="80" r="5" fill="#ddd3b4"/><circle cx="670" cy="95" r="3" fill="#ddd3b4"/>`;
 back+=`<path d="${Array.from({length:8},(_,i)=>`M${i*100+20} 330l55-70M${i*100+50} 200l40-50`).join('')}" stroke="#fff" opacity=".035" stroke-width="12"/>`;
 back+=`<path d="${Array.from({length:9},(_,i)=>`M${i*100} 0V330`).join('')}M0 112H800M0 222H800" stroke="#24333a" stroke-width="6"/><path d="${Array.from({length:8},(_,i)=>`M${i*100} 48q50-40 100 0`).join('')}" stroke="#2c3e44" stroke-width="4" fill="none"/>`;
 back+=`<rect y="330" width="800" height="80" fill="#222b2a"/><path d="M0 330H800M0 356H800M0 383H800${Array.from({length:14},(_,i)=>`M${i*60+(i%2)*30} 330v26M${i*60+15} 356v27M${i*60+45} 383v27`).join('')}" stroke="#0f1515" opacity=".7" stroke-width="2"/>`;
 back+=`<rect y="410" width="800" height="90" fill="#17201e"/><path d="M0 410H800M0 448H800M0 486H800M100 410l-14 90M260 410l-6 90M420 410v90M580 410l6 90M740 410l14 90" stroke="#3b4a45" opacity=".45"/>`;
 back+=`<path d="M0 30q100 44 200 12t200 22 200-12 200 26" stroke="#2c5a3e" stroke-width="4" fill="none"/>${Array.from({length:16},(_,i)=>leaf(i*50+10,36+Math.sin(i*1.3)*14,22+r()*10,60+r()*60,'#2f6045','#4f8a64')).join('')}`;
 const pot=(x,y)=>`<path d="M${x} 0V${y-14}" stroke="#7e8a86" stroke-width="1.2"/><path d="M${x-16} ${y-14}h32l-5 26h-22z" fill="#9a5d3f"/><path d="M${x-17} ${y-14}h34" stroke="#b97250" stroke-width="5"/>${[0,1,2,3,4].map(i=>leaf(x-14+i*7,y+4+i*6,18+i*2,70+i*18-40,'#33694a','#5a9670')).join('')}`;
 back+=pot(170,150)+pot(565,172);
 back+=`<path d="M300 500 560 0H760L520 500z" fill="url(#beam)"/>`;
 back+=`<path d="M430 112v94" stroke="#6b7a76" stroke-width="1.5"/><circle cx="430" cy="232" r="70" fill="url(#warm)"/><path d="M416 210h28l-4 8h-20z" fill="#3b3a36"/><rect x="418" y="218" width="24" height="30" rx="3" fill="#ffcf7a" opacity=".85"/><path d="M418 218h24v30h-24zM430 218v30" stroke="#3b3a36" stroke-width="2.5" fill="none"/><path d="M414 248h32l-4 6h-24z" fill="#3b3a36"/><path class="flame" d="M430 228q-4 6 0 11 4-5 0-11z" fill="#fff4cf"/>`;
 back+=`<ellipse cx="410" cy="452" rx="190" ry="9" fill="#000" opacity=".4"/><rect x="250" y="372" width="10" height="80" fill="#3d3128"/><rect x="560" y="372" width="10" height="80" fill="#3d3128"/><rect x="240" y="352" width="340" height="12" rx="2" fill="#6a523e"/><rect x="240" y="364" width="340" height="8" fill="#4b3a2d"/>`;
 for(const [x,h] of [[272,22],[306,30],[340,18]])back+=`<path d="M${x-12} 352l3-18h18l3 18z" fill="#9a5d3f"/><path d="M${x-13} 334h26" stroke="#b97250" stroke-width="4"/><path d="M${x} 332v-${h}" stroke="#5a9a6a" stroke-width="2"/>${leaf(x,332-h,14,-30,'#4f9a66','#7cc28e')}${leaf(x,332-h+6,12,-150,'#4f9a66','#7cc28e')}`;
 back+=`<g fill="#9a5d3f"><path d="M420 352l4-12h32l4 12z"/><path d="M424 340l4-10h24l4 10z" opacity=".85"/></g><path d="M504 352v-26q0-8 8-8h26q8 0 8 8v26z" fill="#5f7d86"/><path d="M546 330l26-18" stroke="#5f7d86" stroke-width="5" stroke-linecap="round"/><path d="M512 318q13-16 26 0" stroke="#5f7d86" stroke-width="4" fill="none"/><path d="M508 326h34" stroke="#fff" opacity=".12" stroke-width="3"/>`;
 back+=Array.from({length:12},()=>`<circle class="drift" style="animation-delay:-${(r()*9).toFixed(1)}s" cx="${(r()*800).toFixed(0)}" cy="${(60+r()*360).toFixed(0)}" r="${(2+r()*4).toFixed(1)}" fill="#e8f2a6" opacity="${(.06+r()*.1).toFixed(2)}" filter="url(#blur)"/>`).join('');
 const front=`<g>${leaf(-20,330,150,-35,'#1b3527','#32573f')}${leaf(-30,420,170,-15,'#1f3c2c','#3a6449')}${leaf(-10,500,160,-55,'#183022','#2f5039')}${leaf(20,470,120,-80,'#22432f','#3f6b4f')}</g>`+
  `<g>${leaf(830,300,130,200,'#1b3527','#32573f')}${leaf(820,380,140,190,'#1f3c2c','#3a6449')}${leaf(810,470,150,220,'#183022','#2f5039')}${leaf(800,500,110,250,'#22432f','#3f6b4f')}</g>`+
  `<rect width="800" height="500" fill="url(#vignette)"/>`;
 return {back,front,label:'hunt.greenhouseScene'};
}
// [x,y,size,rotation] of each relic's box, chosen so it rests on a shelf, sill, table or leaf.
const workshopSpots=[[150,102,26,-15],[512,226,26,10],[256,330,26,-20],[204,74,24,0],[420,448,26,25],[690,224,24,-10],[590,446,24,15]];
const greenhouseSpots=[[178,154,22,-20],[92,48,20,15],[296,328,22,10],[446,250,20,-15],[716,296,24,25],[380,452,22,-30],[612,128,20,20],[575,184,20,0]];
export function makeHunt(chapter){
 const garden=chapter%2===0,kinds=garden?Array(7).fill('firefly'):['key','bottle','moon','feather','gem'],spots=garden?greenhouseSpots:workshopSpots;
 const objects=kinds.map((kind,i)=>{const p=spots[(i+Math.floor((chapter-1)/2))%spots.length];return {id:i,kind,name:`item.${kind}`,x:p[0],y:p[1],size:p[2],rotation:p[3]};});
 return {garden,objects,title:garden?'hunt.greenhouse':'hunt.workshop',instruction:garden?'hunt.greenhouseCopy':'hunt.workshopCopy'};
}
function relic(o,garden){
 const cx=o.x+o.size/2,cy=o.y+o.size/2;
 const glow=garden?`<circle class="ffglow" style="animation-delay:-${(o.id*.83).toFixed(2)}s" cx="${cx}" cy="${cy+o.size*.2}" r="${o.size*.95}" fill="url(#ffglow)"/>`:'';
 const glint=garden?'':`<path class="glint" style="animation-delay:${(1.5+o.id*1.9).toFixed(1)}s" d="M${cx+o.size*.3} ${cy-o.size*.55}l1.6 5.4 5.4 1.6-5.4 1.6-1.6 5.4-1.6-5.4-5.4-1.6 5.4-1.6z" fill="#fff8e0"/>`;
 return `<g class="relic" data-relic="${o.id}">${glow}<use href="#${o.kind}" x="${o.x}" y="${o.y}" width="${o.size}" height="${o.size}" transform="rotate(${o.rotation} ${cx} ${cy})" filter="url(#shade)"/>${glint}</g>`;
}
export function createTreasure({onComplete,onFind}){
 const dialog=document.getElementById('treasure-dialog'),scene=document.getElementById('treasure-scene'),list=document.getElementById('treasure-list'),status=document.getElementById('treasure-status'),count=document.getElementById('hunt-count');
 const calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 let hunt,found=new Set(),hinted=null,finalHunt=false;
 const refresh=()=>{const total=hunt.objects.length,all=found.size===total;count.textContent=`${found.size} / ${total}`;
  status.textContent=all?t(finalHunt?'hunt.allFinal':'hunt.all'):found.size?t('hunt.left',{n:total-found.size}):t(hunt.garden?'hunt.tipGarden':'hunt.tipWorkshop');
  document.getElementById('treasure-next').textContent=t(finalHunt?'hunt.endFinal':all?'hunt.keep':'hunt.leave');};
 function sparkle(button){
  for(let i=0;i<10;i++){const s=document.createElement('span'),a=i/10*Math.PI*2+Math.random()*.4,d=26+Math.random()*22;s.className='spark';s.style.cssText=`left:${button.style.left};top:${button.style.top};--dx:${(Math.cos(a)*d).toFixed(1)}px;--dy:${(Math.sin(a)*d).toFixed(1)}px`;scene.append(s);setTimeout(()=>s.remove(),800);}
  const ring=document.createElement('span');ring.className='found-ring';ring.style.cssText=`left:${button.style.left};top:${button.style.top}`;scene.append(ring);setTimeout(()=>ring.remove(),800);
 }
 function collect(o,button){
  if(found.has(o.id))return;found.add(o.id);button.disabled=true;button.classList.remove('hinted');button.setAttribute('aria-label',t('hunt.foundItem',{name:t(o.name)}));
  if(hinted===button){hinted=null;scene.querySelector('#hunt-spot').classList.remove('on');}
  const art=scene.querySelector(`[data-relic="${o.id}"]`),chip=hunt.garden?list.querySelector('span:not(.claimed)'):list.querySelector(`[data-item="${o.id}"]`),done=()=>chip.classList.add('found');
  chip.classList.add('claimed');onFind();refresh();if(found.size===hunt.objects.length)setTimeout(()=>scene.classList.add('complete'),calm()?0:700);
  if(calm()){art.remove();done();return;}
  sparkle(button);
  const from=art.querySelector('use').getBoundingClientRect(),to=chip.querySelector('svg').getBoundingClientRect(),size=Math.max(from.width,from.height,1);
  const fly=document.createElement('div');fly.className='relic-flyer';fly.innerHTML=`<svg viewBox="0 0 40 40" aria-hidden="true"><use href="#${o.kind}" width="40" height="40"/></svg>`;fly.style.width=fly.style.height=size+'px';dialog.append(fly);art.classList.add('taken');
  const sx=from.left+from.width/2-size/2,sy=from.top+from.height/2-size/2,ex=to.left+to.width/2-size/2,ey=to.top+to.height/2-size/2;
  fly.animate([{transform:`translate(${sx}px,${sy}px) scale(1)`},{transform:`translate(${sx}px,${sy-16}px) scale(1.8)`,offset:.32},{transform:`translate(${ex}px,${ey}px) scale(${(to.width/size).toFixed(2)})`}],{duration:850,easing:'cubic-bezier(.55,0,.3,1)',fill:'forwards'}).finished.catch(()=>{}).then(()=>{fly.remove();done();});
 }
 document.getElementById('treasure-next').onclick=()=>{if(!dialog.open)return;dialog.close();onComplete(found.size,hunt.objects.length);};
 document.getElementById('treasure-hint').onclick=()=>{const target=hunt.objects.find(o=>!found.has(o.id));if(!target)return;if(hinted)hinted.classList.remove('hinted');hinted=scene.querySelector(`[data-target="${target.id}"]`);hinted.classList.add('hinted');const spot=scene.querySelector('#hunt-spot');spot.style.setProperty('--x',hinted.style.left);spot.style.setProperty('--y',hinted.style.top);spot.classList.add('on');status.textContent=t('hunt.hintText');};
 dialog.addEventListener('cancel',e=>{e.preventDefault();status.textContent=t('hunt.cancel');});dialog.addEventListener('keydown',e=>e.stopPropagation());
 return {open(chapter){
  finalHunt=chapter===3;document.querySelector('.hunt-note').textContent=t(finalHunt?'hunt.noteFinal':'hunt.note');hunt=makeHunt(chapter);found=new Set();hinted=null;
  document.getElementById('treasure-title').textContent=t(hunt.title);document.getElementById('treasure-copy').textContent=t(hunt.instruction);
  document.getElementById('treasure-eyebrow').textContent=t(hunt.garden?'hunt.eyebrowCollect':'hunt.eyebrowList',{n:chapter});
  const art=hunt.garden?greenhouse(chapter):workshop(chapter);
  scene.className=hunt.garden?'garden':'';
  scene.innerHTML=`<svg viewBox="0 0 800 500" role="img" aria-label="${t(art.label)}">${symbols}${art.back}${hunt.objects.map(o=>relic(o,hunt.garden)).join('')}${art.front}</svg><div id="hunt-spot"></div>`;
  for(const o of hunt.objects){const button=document.createElement('button');button.className='hidden-item';button.dataset.target=o.id;button.setAttribute('aria-label',t('hunt.seek',{name:t(o.name),n:o.id+1}));button.style.cssText=`left:${(o.x+o.size/2)/8}%;top:${(o.y+o.size/2)/5}%;`;button.onclick=()=>collect(o,button);scene.append(button);}
  list.className=hunt.garden?'jar':'';
  list.innerHTML=hunt.objects.map(o=>`<span data-item="${o.id}" title="${t(o.name)}" aria-label="${t(o.name)}"><i><svg viewBox="0 0 40 40" aria-hidden="true"><use href="#${o.kind}" width="40" height="40"/></svg></i>${hunt.garden?'':`<b>${t(o.name)}</b>`}</span>`).join('');
  refresh();dialog.showModal();document.getElementById('treasure-hint').focus();
 }};
}
