// Завантаження цін і проєктів з Google Apps Script
(function () {
  const GAS = (typeof NEXORA_GAS_URL !== 'undefined') ? NEXORA_GAS_URL : '';
  if (!GAS) return;

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
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return '/' + url.replace(/^\//, '');
  }

  function renderPricing(items) {
    const box = document.getElementById('pricing-container');
    if (!box || !items.length) return;

    box.innerHTML = items.map((p) => {
      const ui = PRICE_UI[p.id] || { titleKey: p.id, textKey: '', timeKey: '', features: [] };
      const onSale = p.oldPrice && Number(p.oldPrice) > Number(p.price);
      const saleClass = onSale || p.saleLabel ? ' price-on-sale' : '';
      const popular = p.popular ? ' popular' : '';
      const saleBadge = (onSale || p.saleLabel)
        ? `<span class="price-sale-badge">${esc(p.saleLabel || t('sale_badge') || 'Акція')}</span>`
        : '';
      const oldPrice = onSale
        ? `<div class="price-old">от ${esc(p.oldPrice)}€</div>`
        : '';
      const priceVal = `<div class="price-value">от ${esc(p.price)}€</div>`;

      const feats = ui.features.map((k) => `<span data-i18n="${k}">${t(k)}</span>`).join('');
      const popTag = p.popular ? `<span class="price-tag" data-i18n="popular">${t('popular')}</span>` : '';

      return `<div class="card price${popular}${saleClass}" data-price-id="${p.id}">
        ${saleBadge}${popTag}
        <h3 data-i18n="${ui.titleKey}">${t(ui.titleKey)}</h3>
        <p class="muted" data-i18n="${ui.textKey}">${t(ui.textKey)}</p>
        ${oldPrice}${priceVal}
        <span class="price-time" data-i18n="${ui.timeKey}">${t(ui.timeKey)}</span>
        <div class="list">${feats}</div>
      </div>`;
    }).join('');

    if (typeof setLang === 'function') setLang(localStorage.getItem('nexora_lang') || 'ru');
  }

  function renderProjects(items) {
    const box = document.getElementById('projects-container');
    if (!box || !items.length) return;

    box.innerHTML = items.map((p) => {
      const feat = p.featured ? ' project-featured' : '';
      const badge = p.featured ? '<span class="project-badge">New</span>' : '';
      return `<article class="card project${feat}">
        <div class="project-img">${badge}<img alt="${esc(p.name)}" loading="lazy" src="${imgSrc(p.imageUrl)}"/></div>
        <div class="project-body">
          <h3>${esc(p.name)}</h3>
          <p class="muted">${esc(p.description)}</p>
          <div class="project-actions">
            <a class="btn ghost" data-i18n="open_site" href="${esc(p.siteUrl)}" rel="noopener" target="_blank">${t('open_site')}</a>
          </div>
        </div>
      </article>`;
    }).join('');
  }

  let cachedPrices = null;
  let cachedProjects = null;

  async function load() {
    try {
      const [prices, projects] = await Promise.all([
        fetch(GAS + '?action=pricing', { cache: 'no-cache' }).then((r) => r.json()),
        fetch(GAS + '?action=projects', { cache: 'no-cache' }).then((r) => r.json()),
      ]);
      if (Array.isArray(prices) && prices.length) {
        cachedPrices = prices;
        renderPricing(prices);
      }
      if (Array.isArray(projects) && projects.length) {
        cachedProjects = projects;
        renderProjects(projects);
      }
    } catch (e) {
      console.warn('site-data load', e);
    }
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
