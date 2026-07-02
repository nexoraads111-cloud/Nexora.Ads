(function () {
  document.documentElement.classList.add('nx-js');
  var loader = document.getElementById('nxPreloader');
  if (!loader) return;
  document.body.classList.add('nx-loading');
  var done = false;
  function finish() {
    if (done) return;
    done = true;
    loader.classList.add('nx-hide');
    document.body.classList.remove('nx-loading');
    document.body.classList.add('nx-ready');
    setTimeout(function () { if (loader.parentNode) loader.remove(); }, 400);
  }
  if (document.readyState === 'complete') finish();
  else {
    document.addEventListener('DOMContentLoaded', finish, { once: true });
    window.addEventListener('load', finish, { once: true });
    setTimeout(finish, 280);
  }
})();
