const SECRET_KEY = 'nexora_admin_secret';
const ADMIN_KEY = 'nexora_admin';
const api = () => window.NexoraGas;

const PRICE_META = {
  price1: { title: 'Landing Page', sub: 'Одна послуга / продукт' },
  price2: { title: 'Сайт для бізнесу', sub: 'Компанія, послуги, портфоліо' },
  price3: { title: 'Інтернет-магазин', sub: 'Каталог і заявки' },
};

let state = { prices: [], projects: [] };

function toast(msg, ok) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + (ok ? 'ok' : 'bad');
  setTimeout(() => el.classList.remove('show'), 3500);
}

function esc(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

function imgSrc(url) {
  if (!url) return '';
  return url.startsWith('http') ? url : '/' + url.replace(/^\//, '');
}

function getSecret() { return sessionStorage.getItem(SECRET_KEY) || ''; }

function isLoggedIn() {
  return sessionStorage.getItem(ADMIN_KEY) === '1' && !!getSecret();
}

function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appScreen').style.display = 'block';
  loadAll();
}

function showLogin() {
  document.getElementById('loginScreen').style.display = 'grid';
  document.getElementById('appScreen').style.display = 'none';
}

async function checkConnection() {
  const pill = document.getElementById('connStatus');
  try {
    const h = await api().health();
    pill.textContent = '🟢 GAS v' + (h.version || '?') + ' — з\'єднання OK';
    pill.className = 'status-pill ok';
  } catch (e) {
    pill.textContent = '🔴 Немає з\'єднання з Google Script';
    pill.className = 'status-pill bad';
  }
}

async function doLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  const pin = document.getElementById('adminPin').value.trim();
  btn.disabled = true;
  btn.textContent = 'Вхід…';
  try {
    const res = await api().adminLogin(pin);
    if (!res.token) throw new Error('no_token');
    sessionStorage.setItem(ADMIN_KEY, '1');
    sessionStorage.setItem(SECRET_KEY, res.token);
    toast('✅ Вхід успішний', true);
    showApp();
  } catch (err) {
    toast('❌ Невірний PIN або помилка сервера', false);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Увійти';
  }
}

function logout() {
  sessionStorage.removeItem(ADMIN_KEY);
  sessionStorage.removeItem(SECRET_KEY);
  showLogin();
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  document.getElementById('tab-prices').style.display = name === 'prices' ? 'block' : 'none';
  document.getElementById('tab-projects').style.display = name === 'projects' ? 'block' : 'none';
  updatePreview();
}

function renderPrices(items) {
  state.prices = items;
  document.getElementById('pricesList').innerHTML = items.map((p) => {
    const meta = PRICE_META[p.id] || { title: p.id, sub: '' };
    return `<article class="card" data-id="${p.id}">
      <h3>${meta.title}</h3>
      <p class="hint" style="margin-top:0;margin-bottom:12px">${meta.sub}</p>
      <div class="row">
        <label>Нова ціна (€)<input type="number" class="f-price" value="${esc(p.price)}" oninput="updatePreview()"/></label>
        <label>Стара ціна (знижка)<input type="number" class="f-old" value="${esc(p.oldPrice)}" oninput="updatePreview()"/></label>
      </div>
      <div class="row">
        <label>Текст акції<input type="text" class="f-sale" value="${esc(p.saleLabel)}" placeholder="Акція / -20%" oninput="updatePreview()"/></label>
        <label class="check" style="align-self:end"><input type="checkbox" class="f-pop" ${p.popular ? 'checked' : ''} onchange="updatePreview()"/> Популярно</label>
      </div>
    </article>`;
  }).join('');
  updatePreview();
}

function renderProjects(items) {
  state.projects = items;
  document.getElementById('projectsList').innerHTML = items.map((p) => `
    <article class="card project-card" data-id="${p.id}">
      <h3>${esc(p.name) || 'Новий проєкт'}</h3>
      <div class="row">
        <label>Назва<input type="text" class="f-name" value="${esc(p.name)}" oninput="updatePreview()"/></label>
        <label>Посилання<input type="url" class="f-url" value="${esc(p.siteUrl)}" oninput="updatePreview()"/></label>
      </div>
      <label>Опис<textarea class="f-desc" oninput="updatePreview()">${esc(p.description)}</textarea></label>
      <label>Фото (URL)<input type="text" class="f-img" value="${esc(p.imageUrl)}" oninput="onImgInput(this)"/></label>
      <img class="preview-img" src="${imgSrc(p.imageUrl)}" alt="" style="${p.imageUrl ? '' : 'display:none'}" data-preview/>
      <div class="row">
        <label class="check"><input type="checkbox" class="f-feat" ${p.featured ? 'checked' : ''} onchange="updatePreview()"/> New badge</label>
        <label class="check"><input type="checkbox" class="f-active" ${p.active !== false ? 'checked' : ''} onchange="updatePreview()"/> Показувати</label>
      </div>
      <button type="button" class="btn btn-danger btn-block" onclick="removeProject(this)">Видалити</button>
    </article>`).join('');
  updatePreview();
}

function onImgInput(el) {
  const img = el.parentElement.querySelector('[data-preview]');
  const v = el.value.trim();
  if (img) {
    img.src = imgSrc(v);
    img.style.display = v ? '' : 'none';
  }
  updatePreview();
}

function collectPrices() {
  return [...document.querySelectorAll('#pricesList .card')].map((card, i) => ({
    id: card.dataset.id,
    price: card.querySelector('.f-price').value.trim(),
    oldPrice: card.querySelector('.f-old').value.trim(),
    saleLabel: card.querySelector('.f-sale').value.trim(),
    popular: card.querySelector('.f-pop').checked,
    sortOrder: i + 1,
  }));
}

function collectProjects() {
  return [...document.querySelectorAll('#projectsList .project-card')].map((card, i) => ({
    id: card.dataset.id || ('p_' + Date.now() + '_' + i),
    name: card.querySelector('.f-name').value.trim(),
    description: card.querySelector('.f-desc').value.trim(),
    imageUrl: card.querySelector('.f-img').value.trim(),
    siteUrl: card.querySelector('.f-url').value.trim(),
    featured: card.querySelector('.f-feat').checked,
    active: card.querySelector('.f-active').checked,
    sortOrder: i + 1,
  }));
}

function updatePreview() {
  const area = document.getElementById('previewArea');
  if (!area) return;

  const tab = document.querySelector('.tab.active')?.dataset.tab || 'prices';

  if (tab === 'prices') {
    const items = collectPrices();
    area.innerHTML = items.map((p) => {
      const meta = PRICE_META[p.id] || { title: p.id };
      const onSale = p.oldPrice && Number(p.oldPrice) > Number(p.price);
      const saleCls = onSale || p.saleLabel ? ' sale' : '';
      const badge = (onSale || p.saleLabel) ? `<span class="p-sale-badge">${esc(p.saleLabel || 'Акція')}</span>` : '';
      const old = onSale ? `<div class="p-old">от ${esc(p.oldPrice)}€</div>` : '';
      const pop = p.popular ? '<span class="hint">⭐ Популярно</span>' : '';
      return `<div class="preview-box"><div class="preview-label">${esc(meta.title)}</div>
        <div class="p-price${saleCls}">${badge}${pop}
        ${old}<div class="p-new${onSale ? '' : ' normal'}">от ${esc(p.price || '0')}€</div></div></div>`;
    }).join('');
    return;
  }

  const projects = collectProjects().filter((p) => p.active !== false);
  area.innerHTML = projects.length ? projects.map((p) => `
    <div class="preview-box">
      <div class="p-project">
        <img src="${imgSrc(p.imageUrl)}" alt="" onerror="this.style.opacity=.2"/>
        <div>
          <h4>${esc(p.name) || 'Без назви'} ${p.featured ? '<span style="color:#f59e0b">• New</span>' : ''}</h4>
          <p>${esc(p.description) || 'Без опису'}</p>
        </div>
      </div>
    </div>`).join('') : '<p class="hint">Немає активних проєктів</p>';
}

async function loadAll() {
  try {
    const [prices, projects] = await Promise.all([
      api().getPricing(),
      api().getProjectsAdmin(getSecret()),
    ]);
    if (Array.isArray(prices)) renderPrices(prices);
    if (Array.isArray(projects)) renderProjects(projects);
  } catch (e) {
    toast('❌ Помилка завантаження: ' + (e.message || ''), false);
  }
}

async function savePrices() {
  const btn = document.getElementById('savePricesBtn');
  const items = collectPrices();
  btn.disabled = true;
  btn.textContent = 'Збереження…';
  try {
    const res = await api().savePricing(getSecret(), items);
    api().cachePricing(items);
    toast('✅ Ціни збережено! (' + (res.count || items.length) + ')', true);
    await loadAll();
  } catch (e) {
    toast('❌ ' + (e.message === 'unauthorized' ? 'Сесія закінчилась — увійди знову' : (e.message || 'Помилка')), false);
  } finally {
    btn.disabled = false;
    btn.textContent = '💾 Зберегти ціни на сайт';
  }
}

async function saveProjects() {
  const btn = document.getElementById('saveProjectsBtn');
  const items = collectProjects();
  btn.disabled = true;
  btn.textContent = 'Збереження…';
  try {
    const res = await api().saveProjects(getSecret(), items);
    api().cacheProjects(items.filter((p) => p.active !== false));
    toast('✅ Проєкти збережено! (' + (res.count || items.length) + ')', true);
    await loadAll();
  } catch (e) {
    toast('❌ ' + (e.message === 'unauthorized' ? 'Сесія закінчилась — увійди знову' : (e.message || 'Помилка')), false);
  } finally {
    btn.disabled = false;
    btn.textContent = '💾 Зберегти проєкти на сайт';
  }
}

function addProject() {
  const items = collectProjects();
  items.push({
    id: 'p_' + Date.now(),
    name: '',
    description: '',
    imageUrl: '',
    siteUrl: '',
    featured: false,
    active: true,
    sortOrder: items.length + 1,
  });
  renderProjects(items);
  switchTab('projects');
}

function removeProject(btn) {
  btn.closest('.project-card').remove();
  updatePreview();
}

document.addEventListener('DOMContentLoaded', () => {
  checkConnection();
  if (isLoggedIn()) showApp();
  else showLogin();
});
