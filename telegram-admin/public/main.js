let lastCount = 0;
let pendingCache = [];

async function loadPending(){
  const res=await fetch('/api/pending');
  const list=await res.json();
  const container=document.getElementById('pending');
  // apply search filter
  const q = (document.getElementById('search')?.value||'').toLowerCase();
  const filtered = list.filter(p=>!(q) || (p.name||'').toLowerCase().includes(q) || (p.text||'').toLowerCase().includes(q));
  if(!filtered.length){container.innerHTML='<div class="small">Нет новых заявок.</div>';}
  else{
    container.innerHTML='';
    filtered.forEach(p=>{
      const el=document.createElement('div');el.className='card';
      el.innerHTML=`
      <div class="meta"><div class="avatar">${(p.name||'К')[0]}</div><div><div class="title">${escapeHtml(p.name||'Клиент')}</div><div class="small">${new Date(p.createdAt).toLocaleString()}</div></div></div>
      <div class="text">${escapeHtml(p.text)}</div>
      <div class="controls">
        <button class="btn approve">Preview & Approve</button>
        <button class="btn reject">Reject</button>
      </div>
    `;
      el.querySelector('.approve').addEventListener('click',()=>openPreview(p));
      el.querySelector('.reject').addEventListener('click',async ()=>{
        const reason=prompt('Reason (optional)')||'';
        const r=await fetch('/api/reject',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:p.id,reason})});
        if(r.ok){loadPending();alert('Rejected');}else{alert('Error')}
      });
      container.appendChild(el);
    })
  }
  // play notification if new items
  if(list.length>lastCount){
    notifyNew(list.length-lastCount);
  }
  lastCount = list.length;
  pendingCache = list;
}

function notifyNew(n){
  try{if(Notification && Notification.permission!=='denied'){if(Notification.permission!=='granted')Notification.requestPermission(); new Notification('Nexora Admin', {body:`${n} new review(s)`});}}
  catch(e){}
  // play beep
  try{const ctx=new (window.AudioContext||window.webkitAudioContext)();const o=ctx.createOscillator();const g=ctx.createGain();o.type='sine';o.frequency.value=440;o.connect(g);g.connect(ctx.destination);g.gain.value=0.05;o.start();setTimeout(()=>{o.stop();ctx.close()},220);}catch(e){}
}

function openPreview(p){
  const modal = document.getElementById('previewModal');
  const content = document.getElementById('previewContent');
  content.innerHTML = `
    <div><b>${escapeHtml(p.name||'Клиент')}</b> — <span class="small">${new Date(p.createdAt).toLocaleString()}</span></div>
    <div style="margin-top:8px">${escapeHtml(p.text)}</div>
    <div style="margin-top:12px">Title: <input id="pvTitle" value="${escapeHtml(p.name+' — отзыв')}" style="width:100%" /></div>
    <div style="margin-top:8px">Rating: <input id="pvRating" value="5" style="width:60px" /></div>
    <div style="margin-top:8px">Type: <input id="pvType" value="Создание сайта" style="width:100%" /></div>
  `;
  modal.classList.add('active');
  const conf = document.getElementById('modalConfirm');
  const cancel = document.getElementById('modalCancel');
  function onConfirm(){
    const title = document.getElementById('pvTitle').value||'Отзыв';
    const rating = document.getElementById('pvRating').value||5;
    const type = document.getElementById('pvType').value||'Создание сайта';
    fetch('/api/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:p.id,title,rating,type})}).then(r=>{if(r.ok){modal.classList.remove('active');loadPending();alert('Approved and pushed')}else alert('Error')}).catch(()=>alert('Error'));
    cleanup();
  }
  function onCancel(){modal.classList.remove('active');cleanup();}
  function cleanup(){conf.removeEventListener('click',onConfirm);cancel.removeEventListener('click',onCancel);}  
  conf.addEventListener('click',onConfirm);cancel.addEventListener('click',onCancel);
}

function escapeHtml(s){return String(s||'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[m]))}

loadPending();
setInterval(loadPending,5000);
