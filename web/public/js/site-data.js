// Динамічні ціни та проєкти з Google Apps Script
(function () {
  const GAS = (typeof NEXORA_GAS_URL !== 'undefined') ? NEXORA_GAS_URL : '';
  if (!GAS) return;

  const CACHE_VER = '3';
  const PLACEHOLDER_IMG = '/Public/Image/DiurdStav.png';

  const PRICE_UI = {
    price1: { titleKey: 'price1_title', textKey: 'price1_text', timeKey: 'price1_time', features: ['price_l_mobile', 'price_l_form', 'price_l_seo'] },
    price2: { titleKey: 'price2_title', textKey: 'price2_text', timeKey: 'price2_time', features: ['price_l_pages', 'price_l_reviews', 'price_l_manager'] },
    price3: { titleKey: 'price3_title', textKey: 'price3_text', timeKey: 'price3_time', features: ['price_l_catalog', 'price_l_products', 'price_l_order'] },
  };

  function t(key) {
    const l = localStorage.getItem('nexora_lang') || 'ru';
    const dict = (typeof tr !== 'undefined' && tr[l]) ? tr[l] : {};
    return dict[key] || key;
  }

  function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }

  function imgSrc(url) {
    const u = String(url || '').trim();
    if (!u) return PLACEHOLDER_IMG;
    if (/^https?:\/\//i.test(u)) return u;
    if (/^Public\//i.test(u) || u.startsWith('/')) return '/' + u.replace(/^\//, '');
    return PLACEHOLDER_IMG;
  }

  function safeUrl(url) {
    const u = String(url || '').trim();
    return /^https?:\/\//i.test(u) ? u : '#';
  }

  function renderPricing(items) {
    const box = document.getElementById('pricing-container');
    if (!box || !items.length) return;

    box.innerHTML = items.map((p) => {
      const ui = PRICE_UI[p.id] || { titleKey: p.id, textKey: '', timeKey: '', features: [] };
      const onSale = p.oldPrice && Number(p.oldPrice) > Number(p.price);
      const hasSale = onSale || !!p.saleLabel;
      const saleClass = hasSale ? ' price-on-sale' : '';
      const popular = p.popular ? ' popular' : '';
      const hasBadges = hasSale || p.popular;

      const saleBadge = hasSale
        ? `<span class="price-sale-badge">${esc(p.saleLabel || t('sale_badge') || 'Акція')}</span>`
        : '<span></span>';
      const popTag = p.popular ? `<span class="price-tag" data-i18n="popular">${t('popular')}</span>` : '<span></span>';
      const badges = hasBadges
        ? `<div class="price-top-badges">${saleBadge}${popTag}</div>`
        : '';

      const oldPrice = onSale ? `<div class="price-old">от ${esc(p.oldPrice)}€</div>` : '';
      const priceVal = `<div class="price-value">от ${esc(p.price)}€</div>`;
      const feats = ui.features.map((k) => `<span data-i18n="${k}">${t(k)}</span>`).join('');
      const btnClass = p.popular ? 'btn primary' : 'btn ghost';

      return `<div class="card price${popular}${saleClass}${hasBadges ? ' has-top-badges' : ''}" data-price-id="${p.id}">
        ${badges}
        <h3 data-i18n="${ui.titleKey}">${t(ui.titleKey)}</h3>
        <p class="muted" data-i18n="${ui.textKey}">${t(ui.textKey)}</p>
        ${oldPrice}${priceVal}
        <span class="price-time" data-i18n="${ui.timeKey}">${t(ui.timeKey)}</span>
        <div class="list">${feats}</div>
        <button class="${btnClass}" data-i18n="v14_order_plan" onclick="openOrderModal()" style="width:100%;margin-top:18px">${t('v14_order_plan') || 'Заказать'}</button>
      </div>`;
    }).join('');

    if (typeof setLang === 'function') setLang(localStorage.getItem('nexora_lang') || 'ru');
  }

  function renderProjects(items) {
    const box = document.getElementById('projects-container');
    if (!box) return;

    const list = (items || []).filter((p) => p && String(p.name || '').trim());
    if (!list.length) return;

    box.innerHTML = list.map((p) => {
      const src = imgSrc(p.imageUrl);
      const href = safeUrl(p.siteUrl);
      return `<article class="nx-portfolio-card">
        <div class="nx-portfolio-img"><img alt="${esc(p.name)}" loading="lazy" src="${src}" onerror="this.onerror=null;this.src='${PLACEHOLDER_IMG}'"/></div>
        <div class="nx-portfolio-body">
          <span class="nx-portfolio-cat">${t('v14_filter_corp') || 'Корпоративный сайт'}</span>
          <h3>${esc(p.name)}</h3>
          <p>${esc(p.description)}</p>
          <div class="nx-portfolio-meta">
            <div><small>${t('v14_days_label') || 'Срок'}</small><b>—</b></div>
            <div><small>${t('v14_pages_label') || 'Страниц'}</small><b>—</b></div>
          </div>
          <a class="btn ghost" data-i18n="v14_view_project" href="${esc(href)}" rel="noopener" target="_blank">${t('v14_view_project') || t('open_site')} <i class="fa-solid fa-arrow-right"></i></a>
        </div>
      </article>`;
    }).join('');
  }

  let cachedPrices = null;
  let cachedProjects = null;

  async function fetchJson(action) {
    const r = await fetch(GAS + '?action=' + action + '&_=' + Date.now(), { cache: 'no-store', redirect: 'follow' });
    const text = await r.text();
    try { return JSON.parse(text); } catch (e) { return null; }
  }

  function readCacheFallback() {
    if (localStorage.getItem('nexora_cache_ver') !== CACHE_VER) {
      localStorage.removeItem('nexora_cache_pricing');
      localStorage.removeItem('nexora_cache_projects');
      localStorage.setItem('nexora_cache_ver', CACHE_VER);
      return;
    }
    try {
      const p = JSON.parse(localStorage.getItem('nexora_cache_pricing') || 'null');
      const j = JSON.parse(localStorage.getItem('nexora_cache_projects') || 'null');
      if (Array.isArray(p) && p.length) { cachedPrices = p; renderPricing(p); }
      if (Array.isArray(j) && j.length) { cachedProjects = j; renderProjects(j); }
    } catch (e) {}
  }

  async function loadReviewsBackup() {
    if (typeof window.renderReviews !== 'function') return;
    const BLOCKED = ['r_1782853940234', 'r_1782835228464'];
    try {
      const data = await fetchJson('reviews');
      if (Array.isArray(data)) {
        const clean = data.filter((r) => !BLOCKED.includes(String(r.id)));
        if (clean.length) {
          clean.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          window.renderReviews(clean);
        }
      }
    } catch (e) {
      console.warn('reviews backup load', e);
    }
  }

  async function load() {
    try {
      const [prices, projects] = await Promise.all([fetchJson('pricing'), fetchJson('projects')]);
      if (Array.isArray(prices) && prices.length) {
        cachedPrices = prices;
        renderPricing(prices);
        localStorage.setItem('nexora_cache_pricing', JSON.stringify(prices));
        localStorage.setItem('nexora_cache_ver', CACHE_VER);
      }
      if (Array.isArray(projects)) {
        cachedProjects = projects;
        renderProjects(projects);
        localStorage.setItem('nexora_cache_projects', JSON.stringify(projects));
        localStorage.setItem('nexora_cache_ver', CACHE_VER);
      }
    } catch (e) {
      console.warn('site-data load', e);
      readCacheFallback();
    }
    loadReviewsBackup();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load);
  else load();

  const _setLang = window.setLang;
  window.setLang = function (l) {
    if (typeof _setLang === 'function') _setLang(l);
    if (cachedPrices) renderPricing(cachedPrices);
    if (cachedProjects) renderProjects(cachedProjects);
  };
})();
