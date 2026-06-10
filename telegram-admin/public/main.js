async function loadPending(){
  const res=await fetch('/api/pending');
  const list=await res.json();
  const container=document.getElementById('pending');
  if(!list.length){container.innerHTML='<div class="small">Нет новых заявок.</div>';return}
  container.innerHTML='';
  list.forEach(p=>{
    const el=document.createElement('div');el.className='card';
    el.innerHTML=`
      <div class="meta"><div class="avatar">${(p.name||'К')[0]}</div><div><div class="title">${escapeHtml(p.name||'Клиент')}</div><div class="small">${new Date(p.createdAt).toLocaleString()}</div></div></div>
      <div class="text">${escapeHtml(p.text)}</div>
      <div class="controls">
        <button class="btn approve">Approve</button>
        <button class="btn reject">Reject</button>
      </div>
    `;
    el.querySelector('.approve').addEventListener('click',async ()=>{
      const title=prompt('Title for site review', p.name+' — отзыв')||'Отзыв';
      const rating=prompt('Rating 1-5', '5')||'5';
      const type=prompt('Type', 'Создание сайта')||'Создание сайта';
      const r=await fetch('/api/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:p.id,title,rating,type})});
      if(r.ok){loadPending();alert('Approved and pushed');}else{alert('Error')}
    });
    el.querySelector('.reject').addEventListener('click',async ()=>{
      const reason=prompt('Reason (optional)')||'';
      const r=await fetch('/api/reject',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:p.id,reason})});
      if(r.ok){loadPending();alert('Rejected');}else{alert('Error')}
    });
    container.appendChild(el);
  })
}

function escapeHtml(s){return String(s||'').replace(/[&<>'"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;'}[m]))}

loadPending();
setInterval(loadPending,5000);
