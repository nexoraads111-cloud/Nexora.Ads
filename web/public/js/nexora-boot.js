(function () {
  var V = '42';
  function load(src, cb) {
    var s = document.createElement('script');
    s.src = src + '?v=' + V;
    s.async = true;
    s.onload = function () { if (cb) cb(); };
    s.onerror = function () { if (cb) cb(); };
    document.body.appendChild(s);
  }
  function start() {
    // Only core backend scripts — skip legacy i18n/DOM modules that break the React site
    load('/js/gas-api.js', function () {
      load('/js/main.js');
    });
  }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(start, { timeout: 120 });
  } else {
    setTimeout(start, 0);
  }
})();
