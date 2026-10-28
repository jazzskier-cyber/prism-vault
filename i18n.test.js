import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LANGUAGES,pickLanguage,translator} from './i18n-core.js';
const load=code=>JSON.parse(readFileSync(new URL(`./i18n/${code}.json`,import.meta.url)));
const marks=s=>[...s.matchAll(/\{\w+\}|<br>|<em>/g)].map(m=>m[0]).sort().join();
test('every language has the same keys, placeholders and markup',()=>{const zh=load('zh');for(const code of LANGUAGES){const dict=load(code);assert.deepEqual(Object.keys(dict),Object.keys(zh),code);for(const key of Object.keys(zh)){assert.ok(dict[key],`${code} ${key}`);assert.equal(marks(dict[key]),marks(zh[key]),`${code} ${key}`);}}});
test('?lang= wins, then the browser languages, then English',()=>{assert.equal(pickLanguage('?lang=ja',['ko']),'ja');assert.equal(pickLanguage('?lang=xx',['ko-KR','en']),'ko');assert.equal(pickLanguage('',['zh-TW']),'zh');assert.equal(pickLanguage('',['de']),'en');});
test('placeholders fill and missing keys fall back to the original',()=>{const t=translator({a:'{n} gems'},{a:'{n} 块',b:'原文'});assert.equal(t('a',{n:3}),'3 gems');assert.equal(t('b'),'原文');assert.equal(t('c'),'c');assert.equal(t('a'),'{n} gems');});
