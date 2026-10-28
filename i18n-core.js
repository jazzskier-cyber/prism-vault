// Chinese is the original; every other file carries the same keys. ?lang= wins over the browser language.
export const LANGUAGES=['zh','en','ja','ko','es'];
const match=code=>{const base=String(code||'').toLowerCase().split(/[-_]/)[0];return LANGUAGES.includes(base)?base:null;};
export function pickLanguage(search='',languages=[]){
 let asked=null;try{asked=new URLSearchParams(search).get('lang');}catch{}
 return match(asked)||languages.map(match).find(Boolean)||'en';
}
export function translator(dict,original){
 return (key,params={})=>String(dict[key]??original[key]??key).replace(/\{(\w+)\}/g,(m,name)=>name in params?String(params[name]):m);
}
