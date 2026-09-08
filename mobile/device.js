'use strict';
function validateBackup(d){
  const fail=()=>{throw new Error('Backup inválido');};
  if(!d||!Array.isArray(d.categories)||!Array.isArray(d.transactions)||d.categories.length>10000||d.transactions.length>100000)fail();
  const validId=x=>typeof x==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(x);
  const validType=x=>x==='receita'||x==='despesa';
  const amount=x=>typeof x==='number'&&Number.isFinite(x)&&x>=0;
  const ids=new Set();
  for(const c of d.categories){if(!validId(c.id)||ids.has(c.id)||typeof c.name!=='string'||!validType(c.type)||!amount(c.limit)||!/^#[0-9a-f]{6}$/i.test(c.color))fail();ids.add(c.id);}
  const txIds=new Set();
  for(const t of d.transactions){
    if(!validId(t.id)||txIds.has(t.id)||!validId(t.categoryId)||!validType(t.type)||!amount(t.value)||t.value===0||typeof t.description!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(t.date))fail();
    const date=new Date(t.date+'T12:00:00Z');if(!Number.isFinite(date.getTime())||date.toISOString().slice(0,10)!==t.date)fail();txIds.add(t.id);
  }
  if(d.overrides!=null){
    if(typeof d.overrides!=='object'||Array.isArray(d.overrides))fail();
    for(const [month,values] of Object.entries(d.overrides)){
      if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)||!values||typeof values!=='object'||Array.isArray(values))fail();
      for(const [id,value] of Object.entries(values)){if(!validId(id)||!amount(value))fail();}
    }
  }
}
let installEvent;
const installButton=document.getElementById('installBtn');
const help=document.getElementById('installHelp');
const offlineStatus=document.getElementById('offlineStatus');
const installed=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone;
function reflectInstall(){if(installed()){installButton.hidden=true;help.textContent='Aplicativo aberto pela tela inicial.';}}
reflectInstall();
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installEvent=e;});
installButton.onclick=async()=>{
  if(installEvent){await installEvent.prompt();await installEvent.userChoice;installEvent=null;}
  else{help.scrollIntoView({behavior:'smooth',block:'center'});help.style.fontWeight='600';}
  if(navigator.storage?.persist)navigator.storage.persist().catch(()=>{});
};
window.addEventListener('appinstalled',()=>{installButton.hidden=true;help.textContent='Instalado. Abra pelo ícone na tela inicial.';});
if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){
  navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(()=>{
    offlineStatus.textContent='Pronto para usar sem internet. Dados salvos neste aparelho.';
  }).catch(()=>{offlineStatus.textContent='Não foi possível preparar o uso offline. Reabra com internet e tente novamente.';});
}else{
  offlineStatus.textContent='Para instalar e habilitar o modo offline, abra esta versão por um link HTTPS. O arquivo aberto diretamente permite apenas o uso local no navegador.';
}
