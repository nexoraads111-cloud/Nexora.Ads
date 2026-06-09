// NexoraWeb script extracted from index.html

(function(){
  document.documentElement.classList.add('nx-js');
  document.body.classList.add('nx-loading');
  const loader=document.getElementById('nxPreloader');
  const finish=()=>{
    if(!loader) return;
    loader.classList.add('nx-hide');
    document.body.classList.remove('nx-loading');
    document.body.classList.add('nx-ready');
    setTimeout(()=>loader.remove(),1000);
  };
  window.addEventListener('load',()=>setTimeout(finish,2300));
  setTimeout(finish,4200);
})();
