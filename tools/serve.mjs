import http from 'node:http';
import { readFile } from 'node:fs/promises';
// Local static preview only; the published game is the static dist/ folder.
const port = Number(process.env.PORT || 5175);
const root = new URL('../', import.meta.url);
const types = {'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json'};
const allowed = /^\/(?:index\.html|style\.css|[\w-]+\.js|i18n\/[a-z]+\.json)$/;
http.createServer(async(req,res)=>{ let path=new URL(req.url,'http://localhost').pathname; if(path==='/')path='/index.html'; if(!allowed.test(path)||path.endsWith('.test.js')){res.writeHead(404);return res.end('Not found');} try{const data=await readFile(new URL('.'+path,root)); res.writeHead(200,{'Content-Type':types[path.slice(path.lastIndexOf('.'))]});res.end(data);}catch{res.writeHead(404);res.end('Not found');}}).listen(port,'127.0.0.1',()=>console.log(`Prism Vault: http://127.0.0.1:${port}`));
