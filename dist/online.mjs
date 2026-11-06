const peerScript=document.createElement('script');
peerScript.src='https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';
document.head.append(peerScript);

function waitPeer(){
  return new Promise(function(resolve,reject){
    let attempts=0;
    const timer=setInterval(function(){
      if(window.Peer){clearInterval(timer);resolve();}
      else if(++attempts>80){clearInterval(timer);reject(new Error('PeerJS non disponibile'));}
    },100);
  });
}

const css=document.createElement('style');
css.textContent='.online-entry{margin-top:8px;text-align:center}.online-entry button{font-size:10px;background:transparent;color:#d5bc91;border:1px solid #4b4c43;padding:7px 12px;border-radius:4px}.online-backdrop{position:fixed;inset:0;z-index:110;background:#050806e8;backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center}.online-backdrop.hidden{display:none}.online-panel{width:min(440px,94vw);background:#172019;border:1px solid #9e7c50;border-radius:10px;padding:24px;text-align:center}.online-panel h2{font:32px Georgia;margin:0 0 8px}.online-panel p{font-size:11px;color:#aab2a0}.online-panel input{width:100%;margin:8px 0;padding:11px;border:1px solid #4b4c43;background:#242824;border-radius:4px;color:#eee}.online-actions{display:grid;gap:8px;margin-top:12px}.online-status{font-size:11px;color:#dfb171;min-height:18px;margin-top:14px}.online-close{margin-top:14px}';
document.head.append(css);

let peer=null;
let conn=null;

function onlineUI(){
  const entry=document.createElement('div');
  entry.className='online-entry';
  entry.innerHTML='<button id="onlineButton">⚔ Gioca online</button>';
  const startButton=document.querySelector('#start');
  if(startButton)startButton.insertAdjacentElement('afterend',entry);

  const back=document.createElement('div');
  back.className='online-backdrop hidden';
  back.innerHTML='<div class="online-panel"><h2>Gioca online</h2><p>Crea una stanza e invia il codice all’altro giocatore, oppure inserisci un codice ricevuto.</p><div class="online-actions"><button class="primary" id="createRoom">Crea stanza</button><input id="roomCode" placeholder="Codice stanza"><button id="joinRoom">Entra nella stanza</button></div><div class="online-status" id="onlineStatus"></div><button class="online-close" id="closeOnline">Chiudi</button></div>';
  document.body.append(back);

  const status=function(message){back.querySelector('#onlineStatus').textContent=message;};
  const close=function(){
    back.classList.add('hidden');
    if(conn){conn.close();conn=null;}
    if(peer){peer.destroy();peer=null;}
  };

  entry.querySelector('#onlineButton').onclick=function(){back.classList.remove('hidden');status('');};
  back.querySelector('#closeOnline').onclick=close;

  back.querySelector('#createRoom').onclick=async function(){
    status('Creo la stanza…');
    try{
      await waitPeer();
      const id='eclipse-'+Math.random().toString(36).slice(2,8);
      peer=new window.Peer(id);
      peer.on('open',function(){status('Codice stanza: '+id);});
      peer.on('connection',function(incoming){
        conn=incoming;
        conn.on('open',function(){
          status('Giocatore collegato. Avviamo la partita…');
          conn.send({type:'hello'});
          document.querySelector('#mode').value='local';
          document.querySelector('#start').click();
        });
      });
      peer.on('error',function(error){status('Errore: '+error.type);});
    }catch(error){status('Impossibile collegarsi al server online');}
  };

  back.querySelector('#joinRoom').onclick=async function(){
    const id=back.querySelector('#roomCode').value.trim();
    if(!id){status('Inserisci il codice stanza');return;}
    status('Connessione…');
    try{
      await waitPeer();
      peer=new window.Peer();
      peer.on('open',function(){
        conn=peer.connect(id);
        conn.on('open',function(){
          status('Connesso. Attendo l’avvio…');
          conn.on('data',function(message){
            if(message&&message.type==='hello'){
              document.querySelector('#mode').value='local';
              document.querySelector('#start').click();
            }
          });
        });
      });
      peer.on('error',function(){status('Errore: codice non valido o stanza chiusa');});
    }catch(error){status('Impossibile collegarsi al server online');}
  };
}

onlineUI();
