import {pickLanguage,translator} from './i18n-core.js';
// Outside a browser (node tests) the text stays as raw keys.
const browser=typeof window!=='undefined';
export const lang=browser?pickLanguage(location.search,navigator.languages||[navigator.language]):'zh';
const load=code=>browser?fetch(new URL(`./i18n/${code}.json`,import.meta.url)).then(r=>{if(!r.ok)throw Error(`HTTP ${r.status}`);return r.json();}):Promise.resolve({});
const original=await load('zh').catch(()=>({}));
const dict=lang==='zh'?original:await load(lang).catch(()=>original);
export const t=translator(dict,original);
// Static markup carries its keys in data-i18n* attributes.
export function applyText(root=document){
 document.documentElement.lang={zh:'zh-CN',en:'en',ja:'ja',ko:'ko',es:'es'}[lang];
 for(const el of root.querySelectorAll('[data-i18n]'))el.textContent=t(el.dataset.i18n);
 for(const el of root.querySelectorAll('[data-i18n-html]'))el.innerHTML=t(el.dataset.i18nHtml);
 for(const el of root.querySelectorAll('[data-i18n-aria]'))el.setAttribute('aria-label',t(el.dataset.i18nAria));
 for(const el of root.querySelectorAll('[data-i18n-title]'))el.title=t(el.dataset.i18nTitle);
}
