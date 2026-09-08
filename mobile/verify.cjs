const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=__dirname,html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const saved=new Map();
function boot(){
 const elements=new Map();
 const el=id=>{if(!elements.has(id))elements.set(id,{value:'',innerHTML:'',textContent:'',style:{},dataset:{},classList:{add(){},remove(){}},addEventListener(){},querySelectorAll(){return []},focus(){}});return elements.get(id);};
 const context=vm.createContext({document:{getElementById:el,querySelectorAll:()=>[],body:{addEventListener(){}}},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},console,Date,Math,JSON,Number,String,Set,Blob,URL,setTimeout:()=>0,clearTimeout(){},alert:msg=>{throw Error(msg)},confirm:()=>true});
 vm.runInContext(script,context);
 // Only the pure validator is needed for these data checks.
 vm.runInContext(fs.readFileSync(path.join(root,'device.js'),'utf8').split('let installEvent;')[0],context);
 return {context,el,run:s=>vm.runInContext(s,context)};
}
const app=boot();
assert.equal(app.run('state.transactions.length'),0);
app.el('fDesc').value='Mercado';app.el('fVal').value='350,90';app.el('fDate').value='2026-01-31';
app.el('fCat').value=app.run("state.categories.find(c=>c.name==='Alimentação').id");
app.el('addBtn').onclick();
assert.equal(app.run('state.transactions[0].value'),350.90);
assert.equal(app.run('currentKey'),'2026-01');
app.el('nextMonth').onclick();assert.equal(app.run('currentKey'),'2026-02');
app.run("state.categories.find(c=>c.name==='Alimentação').limit=500;persistMeta()");
assert.equal(app.run("limitFor(state.categories.find(c=>c.name==='Alimentação'),'2026-02')"),500);
app.run("state.overrides['2026-02']={[state.categories.find(c=>c.name==='Alimentação').id]:200};persistMeta()");
assert.equal(app.run("limitFor(state.categories.find(c=>c.name==='Alimentação'),'2026-02')"),200);
assert.equal(app.run("limitFor(state.categories.find(c=>c.name==='Alimentação'),'2026-03')"),500);
app.run('validateBackup(JSON.parse(JSON.stringify(state)))');
assert.throws(()=>app.run("validateBackup({categories:[{id:'x',name:'x',type:'despesa',limit:0,color:'bad'}],transactions:[]})"));
const reopened=boot();assert.equal(reopened.run('state.transactions[0].value'),350.90);
assert.equal(reopened.run('state.categories.find(c=>c.name===\'Alimentação\').limit'),500);
app.el('fVal').value='Infinity';app.el('addBtn').onclick();assert.equal(app.run('state.transactions.length'),1);
app.run('delTxStore(state.transactions[0].id)');assert.equal(boot().run('state.transactions.length'),0);
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest')));
for(const icon of manifest.icons){const data=fs.readFileSync(path.join(root,icon.src));assert.equal(data.readUInt32BE(16),parseInt(icon.sizes));assert.equal(data.readUInt32BE(20),parseInt(icon.sizes));}
assert(!html.includes('import('));assert(!html.includes('gstatic.com'));
const listeners={},cached=new Map();
const cache={addAll:async assets=>{for(const asset of assets){const filename=asset==='./'?'index.html':asset.slice(2);cached.set(asset,fs.readFileSync(path.join(root,filename),'utf8'));}},match:async key=>cached.get(typeof key==='string'?key:key.url)};
const scope=vm.createContext({URL,Promise,self:{location:{origin:'https://example.com'},registration:{scope:'https://example.com/mobile/'},clients:{claim:async()=>{}},addEventListener:(name,fn)=>listeners[name]=fn},caches:{open:async()=>cache,keys:async()=>[]},fetch:async()=>{throw Error('offline')}});
vm.runInContext(fs.readFileSync(path.join(root,'sw.js'),'utf8'),scope);
(async()=>{
 let pending;listeners.install({waitUntil:p=>pending=p});await pending;assert.equal(cached.size,7);
 listeners.fetch({request:{url:'https://example.com/mobile/unknown',method:'GET',mode:'navigate'},respondWith:p=>pending=p});
 assert.equal(await pending,html);
 console.log('PASS: launch, transaction, month navigation, fixed/monthly limits, persistence after restart, backup validation, invalid value, deletion, icons, offline cache/fallback.');
})().catch(e=>{console.error(e);process.exitCode=1});
