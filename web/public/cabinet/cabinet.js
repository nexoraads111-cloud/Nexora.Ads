const GAS = (typeof NEXORA_GAS_URL !== 'undefined') ? NEXORA_GAS_URL : '';
const SECRET_KEY = 'nexora_admin_secret';
const ADMIN_KEY = 'nexora_admin';

function toast(msg, ok) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.style.borderColor = ok ? 'rgba(34,197,94,.4)' : 'rgba(239,68,68,.4)';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

async function gasCall(body) {
  const payload = JSON.stringify(body);
  let r = await fetch(GAS, { method: 'POST', redirect: 'follow', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: payload });
  let d = {};
  try { d = await r.json(); } catch (e) {}
  if (!r.ok || d.error) {
    r = await fetch(GAS + '?payload=' + encodeURIComponent(payload), { redirect: 'follow' });
    try { d = await r.json(); } catch (e) {}
  }
  if (d.error) throw new Error(d.error);
  return d;
}

function getSecret() { return sessionStorage.getItem(SECRET_KEY) || ''; }
function isLoggedIn() {
  if (!getSecret()) {
    sessionStorage.removeItem(ADMIN_KEY);
    localStorage.removeItem(ADMIN_KEY);
    return false;
  }
  return sessionStorage.getItem(ADMIN_KEY) === '1';
}

function showApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('appScreen').style.display = 'block';
  loadAll();
}

function showLogin() {
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('appScreen').style.display = 'none';
}

async function doLogin(e) {
  e.preventDefault();
  const pin = document.getElementById('adminPin').value.trim();
  try {
    const res = await gasCall({ action: 'adminLogin', pin });
    sessionStorage.setItem(ADMIN_KEY, '1');
    sessionStorage.setItem(SECRET_KEY, res.token);
    localStorage.setItem(ADMIN_KEY, '1');
    toast('✅ Вхід успішний', true);
    showApp();
  } catch (err) {
    toast('❌ Невірний PIN', false);
  }
}

function logout() {
  sessionStorage.removeItem(ADMIN_KEY);
  sessionStorage.removeItem(SECRET_KEY);
  localStorage.removeItem(ADMIN_KEY);
  showLogin();
}

function switchTab(name) {
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.tab === name));
  document.getElementById('tab-prices').style.display = name === 'prices' ? 'block' : 'none';
  document.getElementById('tab-projects').style.display = name === 'projects' ? 'block' : 'none';
}

const PRICE_META = {
  price1: { title: 'Landing Page', time: '2–5 дней' },
  price2: { title: 'Сайт для бизнеса', time: '5–10 дней' },
  price3: { title: 'Интернет-магазин', time: '10–20 дней' },
};

function renderPrices(items) {
  const box = document.getElementById('pricesList');
  box.innerHTML = items.map((p) => {
    const meta = PRICE_META[p.id] || { title: p.id, time: '' };
    return `<article class="price-card" data-id="${p.id}">
      <h3>${meta.title}</h3>
      <div class="row">
        <label>Ціна (€)<input type="number" class="f-price" value="${p.price || ''}" placeholder="150"/></label>
        <label>Стара ціна — знижка<input type="number" class="f-old" value="${p.oldPrice || ''}" placeholder="200"/></label>
      </div>
      <div class="row">
        <label>Текст акції (зліва)<input type="text" class="f-sale" value="${p.saleLabel || ''}" placeholder="Акція / -20%"/></label>
        <label class="check" style="align-self:end"><input type="checkbox" class="f-pop" ${p.popular ? 'checked' : ''}/> Популярно</label>
      </div>
      <p class="hint">Якщо стара ціна більша — на сайті буде перекреслена + підсвітка акції зліва</p>
    </article>`;
  }).join('');
}

function renderProjects(items) {
  const box = document.getElementById('projectsList');
  box.innerHTML = items.map((p) => `
    <article class="project-card" data-id="${p.id}">
      <h3>Проєкт</h3>
      <div class="row">
        <label>Назва сайту<input type="text" class="f-name" value="${esc(p.name)}"/></label>
        <label>Посилання<input type="url" class="f-url" value="${esc(p.siteUrl)}"/></label>
      </div>
      <label>Опис<textarea class="f-desc">${esc(p.description)}</textarea></label>
      <label>Зображення (URL або Public/Image/файл.png)<input type="text" class="f-img" value="${esc(p.imageUrl)}"/></label>
      ${p.imageUrl ? `<img class="preview-img" src="${imgSrc(p.imageUrl)}" alt=""/>` : ''}
      <div class="row">
        <label class="check"><input type="checkbox" class="f-feat" ${p.featured ? 'checked' : ''}/> Виділити (New)</label>
        <label class="check"><input type="checkbox" class="f-active" ${p.active !== false ? 'checked' : ''}/> Показувати на сайті</label>
      </div>
      <button type="button" class="btn btn-danger" onclick="removeProject(this)" style="margin-top:12px">Видалити</button>
    </article>`).join('');
}

function esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
function imgSrc(url) { if (!url) return ''; return url.startsWith('http') ? url : '/' + url.replace(/^\//, ''); }

function collectPrices() {
  return [...document.querySelectorAll('#pricesList .price-card')].map((card, i) => ({
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

async function loadAll() {
  try {
    const [prices, projects] = await Promise.all([
      fetch(GAS + '?action=pricing').then((r) => r.json()),
      fetch(GAS + '?action=projectsAdmin&secret=' + encodeURIComponent(getSecret())).then((r) => r.json()),
    ]);
    if (Array.isArray(prices)) renderPrices(prices);
    if (Array.isArray(projects)) renderProjects(projects);
  } catch (e) {
    toast('Помилка завантаження', false);
  }
}

async function savePrices() {
  try {
    await gasCall({ action: 'savePricing', secret: getSecret(), items: collectPrices() });
    toast('✅ Ціни збережено', true);
  } catch (e) { toast('❌ ' + (e.message || 'Помилка'), false); }
}

async function saveProjects() {
  try {
    await gasCall({ action: 'saveProjects', secret: getSecret(), items: collectProjects() });
    toast('✅ Проєкти збережено', true);
    loadAll();
  } catch (e) { toast('❌ ' + (e.message || 'Помилка'), false); }
}

function addProject() {
  const box = document.getElementById('projectsList');
  const id = 'p_' + Date.now();
  const items = collectProjects();
  items.push({ id, name: '', description: '', imageUrl: '', siteUrl: '', featured: false, active: true, sortOrder: items.length + 1 });
  renderProjects(items);
}

function removeProject(btn) {
  btn.closest('.project-card').remove();
}

document.addEventListener('DOMContentLoaded', () => {
  if (isLoggedIn()) showApp();
  else showLogin();
});
