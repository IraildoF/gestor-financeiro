// Mechanical derivation of the existing standalone app; original remains intact.
const fs = require('node:fs');
const path = require('node:path');
let html = fs.readFileSync(path.join(__dirname, '../Gestor Financeiro v2.0.html'), 'utf8').replace(/\r\n/g, '\n');
function replace(a,b){if(!html.includes(a))throw Error('Source marker missing: '+a.slice(0,70)); html=html.replace(a,b);}
replace('width=device-width, initial-scale=1.0','width=device-width, initial-scale=1.0, viewport-fit=cover');
replace('<title>Gestor Financeiro Mensal</title>', `<title>Minhas Finanças</title>
<meta name="theme-color" content="#0f1420">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="Finanças">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icon-192.png">
<link rel="icon" href="icon-192.png">
<link rel="stylesheet" href="mobile.css">`);
// Load overrides after the existing stylesheet.
replace('</style>', '</style>\n<link rel="stylesheet" href="mobile.css">');
replace('<link rel="stylesheet" href="mobile.css">\n<style>','<style>');
replace('💰</span> Gestor Financeiro Mensal','💰</span> Minhas Finanças');
replace('title="Sincronização na nuvem"','title="Dados salvos neste aparelho"');
replace('⚙️ Dados & Nuvem','⚙️ Dados');
replace('📝 Lançamentos</button>','📝 Lançar</button>');
const start=html.indexOf('    <div class="card"',html.indexOf('<section class="tabview" id="tab-dados">'));
const end=html.indexOf('    <div class="grid cols-2">',start);
html=html.slice(0,start)+`    <div class="card" style="margin-bottom:16px">
      <h3>Somente neste celular</h3>
      <p>Receitas, despesas e limites são salvos neste aparelho, sem conta e sem sincronização.</p>
      <p id="offlineStatus" role="status" style="margin:12px 0">Preparando o uso sem internet…</p>
      <button class="btn btn-primary" id="installBtn">Instalar no celular</button>
      <p id="installHelp" style="margin-top:12px">No Android, abra o menu do Chrome e escolha Instalar aplicativo ou Adicionar à tela inicial. No iPhone, abra no Safari, toque em Compartilhar → Adicionar à Tela de Início e ative Abrir como App, se disponível.</p>
      <p class="muted-note" style="margin-top:12px">Faça backups regularmente. Limpar os dados do navegador ou do aplicativo pode apagar seus registros. Para trocar de aparelho, exporte o backup e importe no novo celular.</p>
    </div>
`+html.slice(end);
replace('Mesmo com a nuvem, é bom guardar backups. Sem a nuvem, use estes botões para trocar dados manualmente.', 'Salve uma cópia dos seus registros em um arquivo. A importação substitui os dados atuais após sua confirmação.');
replace("const LS_KEY='gestor_financeiro_v1';", "const LS_KEY='gestor_financeiro_mobile_v1';");
html=html.replace(/^const SYNC_KEY=.*\n/m,'').replace(/^const FB_VER=.*\n/m,'');
replace('let current=new Date();','let current=new Date(); current.setDate(1);');
const runtime=html.indexOf('/* cloud runtime */'), defaults=html.indexOf('function defaultState()',runtime);
html=html.slice(0,runtime)+'const cloud={enabled:false};\n'+html.slice(defaults);
const saveStart=html.indexOf('function saveLocal()'), saveEnd=html.indexOf('function uid()',saveStart);
html=html.slice(0,saveStart)+`function saveLocal(){
  try { localStorage.setItem(LS_KEY,JSON.stringify(state)); }
  catch(e){alert('Não foi possível salvar no aparelho. Exporte um backup agora, antes de fechar o app. Verifique o espaço livre e se o navegador permite armazenamento.'); throw e;}
}
`+html.slice(saveEnd);
const mutStart=html.indexOf('function persistMeta()'), renderStart=html.indexOf('function render()',mutStart);
html=html.slice(0,mutStart)+`function persistMeta(){saveLocal();}
function addTxStore(tx){state.transactions.push(tx);saveLocal();}
function delTxStore(id){state.transactions=state.transactions.filter(t=>t.id!==id);saveLocal();}
`+html.slice(renderStart);
const syncStart=html.indexOf('/* sync UI */'), dataStart=html.indexOf('/* data: export/import/reset */',syncStart);
html=html.slice(0,syncStart)+html.slice(dataStart);
replace("if(val<=0)","if(!Number.isFinite(val)||val<=0)");
replace("current=new Date(date+'T12:00:00');", "current=new Date(date+'T12:00:00');current.setDate(1);");
replace("current=new Date();render();", "current=new Date();current.setDate(1);render();");
replace("if(!d.categories||!d.transactions)throw 0;", "validateBackup(d);");
replace("if(cloud.enabled)pushAllToCloud().then(()=>toast('Backup importado e enviado.','ok'));else toast('Backup importado.','ok');", "toast('Backup importado.','ok');");
const initStart=html.indexOf('/* ---------- Init ---------- */');
html=html.slice(0,initStart)+`/* ---------- Init ---------- */
const today=new Date();
document.getElementById('fDate').value=monthKey(today)+'-'+String(today.getDate()).padStart(2,'0');
document.querySelectorAll('.field').forEach(field=>{const label=field.querySelector('label'),input=field.querySelector('input,select,textarea');if(label&&input&&input.id)label.htmlFor=input.id;});
render();
</script>
<script src="device.js"></script>
</body>
</html>
`;
fs.writeFileSync(path.join(__dirname,'index.html'),html);
console.log('Mobile app generated from v2.0.');
