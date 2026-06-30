// Надійний клієнт Google Apps Script (GET payload — POST часто ламається)
(function () {
  const GAS = (typeof NEXORA_GAS_URL !== 'undefined') ? NEXORA_GAS_URL : '';

  function parseJson(text) {
    try { return JSON.parse(text); } catch (e) { return null; }
  }

  async function gasRequest(body) {
    if (!GAS) throw new Error('gas_not_configured');

    const payload = JSON.stringify(body);
    const bust = Date.now();

    // 1) GET ?payload= — найстабільніший спосіб для GAS web app
    let r = await fetch(GAS + '?payload=' + encodeURIComponent(payload) + '&_=' + bust, {
      redirect: 'follow',
      cache: 'no-store',
    });
    let d = parseJson(await r.text());

    // 2) POST fallback для інших деплоїв
    if (!d || (d.ok === false && !d.token && body.action === 'adminLogin')) {
      r = await fetch(GAS, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: payload,
      });
      d = parseJson(await r.text());
    }

    if (!d) throw new Error('bad_response');
    if (d.error) throw new Error(d.error);
    if (d.ok === false) throw new Error(d.error || 'request_failed');
    return d;
  }

  async function gasGet(action, params) {
    if (!GAS) throw new Error('gas_not_configured');
    const qs = new URLSearchParams({ action, _: String(Date.now()) });
    if (params) Object.keys(params).forEach((k) => qs.set(k, params[k]));
    const r = await fetch(GAS + '?' + qs.toString(), { redirect: 'follow', cache: 'no-store' });
    const d = parseJson(await r.text());
    if (!d) throw new Error('bad_response');
    if (d.error && d.ok === false) throw new Error(d.error);
    return d;
  }

  window.NexoraGas = {
    url: GAS,
    request: gasRequest,
    get: gasGet,
    health: () => gasGet('health'),
    getPricing: () => gasGet('pricing'),
    getProjects: () => gasGet('projects'),
    getProjectsAdmin: (secret) => gasGet('projectsAdmin', { secret }),
    adminLogin: (pin) => gasRequest({ action: 'adminLogin', pin }),
    savePricing: (secret, items) => gasRequest({ action: 'savePricing', secret, items }),
    saveProjects: (secret, items) => gasRequest({ action: 'saveProjects', secret, items }),
    cachePricing: (items) => localStorage.setItem('nexora_cache_pricing', JSON.stringify(items)),
    cacheProjects: (items) => localStorage.setItem('nexora_cache_projects', JSON.stringify(items)),
    readCachedPricing: () => { try { return JSON.parse(localStorage.getItem('nexora_cache_pricing') || 'null'); } catch (e) { return null; } },
    readCachedProjects: () => { try { return JSON.parse(localStorage.getItem('nexora_cache_projects') || 'null'); } catch (e) { return null; } },
  };
})();
