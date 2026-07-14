(function () {
  var V = '31';
  function load(src, cb) {
    var s = document.createElement('script');
    s.src = src + '?v=' + V;
    s.async = true;
    s.onload = function () { if (cb) cb(); };
    document.body.appendChild(s);
  }
  function loadAll(list, done) {
    var i = 0;
    function next() {
      if (i >= list.length) { if (done) done(); return; }
      load(list[i++], next);
    }
    next();
  }
  function start() {
    load('/js/gas-api.js', function () {
      load('/js/main.js', function () {
        loadAll([
          '/js/module-03.js',
          '/js/module-04.js',
          '/js/module-05.js',
          '/js/module-06.js',
          '/js/module-i18n.js',
          '/js/site-data.js',
          '/js/module-admin-nav.js',
        ]);
      });
    });
  }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(start, { timeout: 80 });
  } else {
    setTimeout(start, 0);
  }
})();
