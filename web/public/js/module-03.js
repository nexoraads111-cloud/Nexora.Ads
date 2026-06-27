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
  const addLink = (nav, mobile) => {
    if (!nav || nav.querySelector('a[href="/cabinet/"]')) return;
    const a = document.createElement('a');
    a.href = '/cabinet/';
    a.textContent = 'Кабинет';
    a.setAttribute('data-i18n', 'nav_cabinet');
    nav.insertBefore(a, nav.querySelector('a[href="#contact"]'));
    if (mobile) {
      const m = document.createElement('a');
      m.href = '/cabinet/';
      m.textContent = 'Кабинет';
      m.setAttribute('onclick', 'closeMobileMenu()');
      mobile.insertBefore(m, mobile.querySelector('a[href="#contact"]'));
    }
  };
  addLink(document.querySelector('header nav'), document.getElementById('mobileMenu'));
});
