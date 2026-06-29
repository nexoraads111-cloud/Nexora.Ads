// NexoraWeb script extracted from index.html

document.addEventListener('error', function(e){
  const img=e.target;
  if(!img || img.tagName!=='IMG' || !img.dataset.fallbacks) return;
  const list=img.dataset.fallbacks.split(',').map(s=>s.trim()).filter(Boolean);
  const idx=Number(img.dataset.fallbackIndex||0);
  if(idx < list.length){ img.dataset.fallbackIndex=String(idx+1); img.src=list[idx]; }
  else { const box=img.closest('.member-avatar,.team-avatar,.mini-person-photo,.mini-photo,.manager-photo-bubble'); if(box){ box.classList.add('no-img'); } img.remove(); }
}, true);

document.addEventListener('DOMContentLoaded', function(){
  // Image fallbacks only — cabinet nav removed
});
