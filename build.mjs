import {mkdir,copyFile} from 'node:fs/promises';
// Only browser assets ship. tools/serve.mjs is a local static preview, not a game backend.
await mkdir(new URL('./dist/i18n/',import.meta.url),{recursive:true});
for(const name of ['index.html','style.css','game.js','engine.js','leaderboard.js','leaderboard-config.js','rankings.js','adventure.js','treasure.js','i18n.js','i18n-core.js'])await copyFile(new URL(name,import.meta.url),new URL(`dist/${name}`,import.meta.url));
for(const lang of ['zh','en','ja','ko','es'])await copyFile(new URL(`i18n/${lang}.json`,import.meta.url),new URL(`dist/i18n/${lang}.json`,import.meta.url));
console.log('Static game built in dist/');
