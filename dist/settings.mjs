const defaults={p1left:'a',p1right:'d',p1jump:'w',p1dodge:'q',p1block:'s',p1punch:'u',p1kick:'i',p1special:'o',p2left:'arrowleft',p2right:'arrowright',p2jump:'arrowup',p2dodge:'l',p2block:'arrowdown',p2punch:'j',p2kick:'k',p2special:'m'};
const labels={p1left:'Sinistra',p1right:'Destra',p1jump:'Salto',p1dodge:'Schivata',p1block:'Parata',p1punch:'Pugno',p1kick:'Calcio',p1special:'Abilità speciale',p2left:'Sinistra',p2right:'Destra',p2jump:'Salto',p2dodge:'Schivata',p2block:'Parata',p2punch:'Pugno',p2kick:'Calcio',p2special:'Abilità speciale'};
const pretty=k=>({arrowleft:'←',arrowright:'→',arrowup:'↑',arrowdown:'↓', ' ':'SPAZIO'}[k]||k.toUpperCase());
let binds={...defaults,...JSON.parse(localStorage.getItem('eclipse-binds')||'{}')};
let open=false,waiting=null;
const style=document.createElement('style');style.textContent=`
html,body{width:100%;height:100%;overflow:hidden}body>header,main>.intro,main>.under-arena,body>footer{display:none!important}main{width:100vw;max-width:none;height:100vh;margin:0}.arena{width:100vw;height:100vh;min-height:100vh;margin:0;border:0;border-radius:0}.arena canvas{width:100vw;height:100vh;aspect-ratio:auto;object-fit:contain}.arena-caption{display:none}
.command-deck,.instructions{display:none!important}.menu-settings{margin-top:14px;text-align:center}.menu-settings-title{font-size:10px;letter-spacing:3px;color:#c79c67;background:transparent;border:0;padding:6px 12px}.menu-settings-title:hover{color:#f1ca8d;background:transparent}.menu-settings-links{display:none;justify-content:center;gap:8px;flex-wrap:wrap;margin-top:5px}.menu-settings.open .menu-settings-links{display:flex}.menu-settings-links button,.menu-settings-links a{font-size:10px;padding:7px 10px;background:transparent;border:1px solid #4b4c43;border-radius:4px;color:#d5bc91}.menu-settings-links button:hover,.menu-settings-links a:hover{border-color:#e4b372;background:#34382e}.settings-audio{display:flex;align-items:center;gap:12px;margin-top:16px;border:1px solid #3b4939;border-radius:7px;padding:12px;font-size:12px;color:#d9ddce}.settings-audio input{flex:1;accent-color:#dfb171}.settings-audio output{width:38px;color:#d4bb8e}
#settingsButton{font-size:11px;background:transparent;padding:7px 10px}
.settings-backdrop{position:fixed;inset:0;background:#050806d9;backdrop-filter:blur(8px);z-index:100;display:flex;align-items:center;justify-content:center;padding:18px}
.settings-backdrop.hidden{display:none}
.settings-panel{width:min(680px,96vw);max-height:90vh;overflow:auto;background:#172019;border:1px solid #9e7c50;border-radius:10px;padding:24px;box-shadow:0 20px 70px #000b}
.settings-head{display:flex;justify-content:space-between;align-items:center;gap:14px;border-bottom:1px solid #3e493b;padding-bottom:14px;margin-bottom:14px}
.settings-head h2{font:32px Georgia;margin:0}.settings-head p{color:#9fa993;font-size:11px;margin:5px 0 0}
.settings-close{font-size:20px;padding:4px 10px}.settings-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.settings-group{border:1px solid #3b4939;border-radius:7px;padding:12px}.settings-group h3{font-size:10px;letter-spacing:2px;color:#dfb171;margin:0 0 10px}
.bind-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:7px 0;color:#d9ddce;font-size:12px}.bind-row button{min-width:64px;padding:6px 9px;font-weight:800;color:#efc98f}
.bind-row button.waiting{background:#dfb171;color:#152018;animation:pulse 1s infinite}
.settings-foot{display:flex;justify-content:space-between;align-items:center;margin-top:18px;gap:10px;color:#98a38e;font-size:10px}
@keyframes pulse{50%{opacity:.55}}@media(max-width:600px){.settings-grid{grid-template-columns:1fr}.settings-panel{padding:16px}.settings-head h2{font-size:26px}}
`;document.head.append(style);
function keyName(e){return e.key.toLowerCase()===' ' ? ' ' : e.key.toLowerCase()}
function save(){localStorage.setItem('eclipse-binds',JSON.stringify(binds))}
function render(){document.querySelectorAll('.bind-row button').forEach(b=>{const k=b.dataset.bind;b.textContent=waiting===k?'PREMI UN TASTO':pretty(binds[k]);b.classList.toggle('waiting',waiting===k)})}
function row(k){const d=document.createElement('div');d.className='bind-row';d.innerHTML='<span>'+labels[k]+'</span><button data-bind="'+k+'">'+pretty(binds[k])+'</button>';return d}
function makeSettings(){
 const menu=document.createElement('div');menu.className='menu-settings';menu.innerHTML='<button class="menu-settings-title" type="button" aria-expanded="false">SETTINGS →</button><div class="menu-settings-links"><button id="openController">Controller</button><button id="openAudio">Audio volume</button><a href="prova.html">Studio movimenti</a></div>';document.querySelector('#start').insertAdjacentElement('afterend',menu);
 const title=menu.querySelector('.menu-settings-title');title.onclick=()=>{const expanded=menu.classList.toggle('open');title.setAttribute('aria-expanded',String(expanded))};
 const back=document.createElement('div');back.className='settings-backdrop hidden';back.id='settingsBackdrop';
 back.innerHTML='<div class="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settingsTitle"><div class="settings-head"><div><h2 id="settingsTitle">Impostazioni</h2><p>Personalizza comandi, audio e allenamento.</p></div><button class="settings-close" id="settingsClose">×</button></div><div class="settings-grid"><section class="settings-group"><h3>CONTROLLER · GIOCATORE 1</h3><div id="binds1"></div></section><section class="settings-group"><h3>CONTROLLER · GIOCATORE 2</h3><div id="binds2"></div></section></div><div class="settings-audio"><label for="settingsVolume">Audio volume</label><input id="settingsVolume" type="range" min="0" max="100" value="35"><output id="settingsVolumeValue">35%</output></div><div class="settings-foot"><a href="prova.html">Apri Studio movimenti ↗</a><button id="resetBinds">Ripristina comandi</button></div></div>';
 document.body.append(back);
 ['p1left','p1right','p1jump','p1dodge','p1block','p1punch','p1kick','p1special'].forEach(k=>back.querySelector('#binds1').append(row(k)));
 ['p2left','p2right','p2jump','p2dodge','p2block','p2punch','p2kick','p2special'].forEach(k=>back.querySelector('#binds2').append(row(k)));
 const close=()=>{open=false;waiting=null;back.classList.add('hidden');render()};
 const show=()=>{open=true;back.classList.remove('hidden');render()};
 menu.querySelector('#openController').onclick=show;
 menu.querySelector('#openAudio').onclick=()=>{show();back.querySelector('#settingsVolume').focus()};
 back.querySelector('#settingsClose').onclick=close;back.onclick=e=>{if(e.target===back)close()};
 back.querySelector('#resetBinds').onclick=()=>{binds={...defaults};save();render()};
 back.querySelector('#settingsVolume').oninput=e=>{const v=e.target.value;back.querySelector('#settingsVolumeValue').textContent=v+'%';const main=document.querySelector('#musicVolume');if(main){main.value=v;main.dispatchEvent(new Event('input',{bubbles:true}))}};
 back.addEventListener('click',e=>{const btn=e.target.closest('[data-bind]');if(btn){waiting=btn.dataset.bind;render()}});
}const reverse=()=>Object.fromEntries(Object.entries(binds).map(([k,v])=>[v,k]));
function synthetic(type,key,e){window.dispatchEvent(new KeyboardEvent(type,{key:key===' ' ? ' ':key,code:e.code,bubbles:true,cancelable:true}))}
window.addEventListener('keydown',e=>{
 if(waiting){if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;e.preventDefault();e.stopImmediatePropagation();binds[waiting]=keyName(e);save();waiting=null;render();return}
 if(open)return;
 const r=reverse(),k=keyName(e),action=r[k];if(!action)return;
 const canonical=defaults[action];if(k===canonical)return;
 e.preventDefault();e.stopImmediatePropagation();synthetic('keydown',canonical,e);
},true);
window.addEventListener('keyup',e=>{
 if(open)return;
 const r=reverse(),k=keyName(e),action=r[k];if(!action)return;
 const canonical=defaults[action];if(k!==canonical){e.preventDefault();e.stopImmediatePropagation();synthetic('keyup',canonical,e)}
},true);
makeSettings();render();
