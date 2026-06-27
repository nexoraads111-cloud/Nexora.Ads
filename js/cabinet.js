const STATUS_LABELS = {
  accepted: 'Принят',
  in_progress: 'В работе',
  ready: 'Готов',
};

const TOKEN_KEY = 'nexora_cabinet_token';
const USER_KEY = 'nexora_cabinet_user';

function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

function showToast(text) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = text;
  el.classList.add('active');
  setTimeout(() => el.classList.remove('active'), 3000);
}

async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${NEXORA_API}/${path}`, { ...options, headers });
  let data = {};
  try {
    data = await res.json();
  } catch (e) {}
  if (!res.ok) throw new Error(data.error || 'Ошибка запроса');
  return data;
}

function renderSteps(status) {
  const steps = [
    { key: 'accepted', label: 'Принят' },
    { key: 'in_progress', label: 'В работе' },
    { key: 'ready', label: 'Готов' },
  ];
  const idx = steps.findIndex((s) => s.key === status);
  return `<div class="cabinet-steps">${steps
    .map((s, i) => `<span class="cabinet-step ${i <= idx ? 'active' : ''}">${s.label}</span>`)
    .join('')}</div>`;
}

function renderOrders(orders) {
  const box = document.getElementById('orders-list');
  if (!orders.length) {
    box.innerHTML = '<div class="cabinet-empty">Заказов пока нет. Оформите заявку на <a href="index.html#contact" style="color:#a5b4fc">главной</a>.</div>';
    return;
  }
  box.innerHTML = orders
    .map(
      (o) => `
    <article class="cabinet-order">
      <div class="cabinet-order-top">
        <h3>${escapeHtml(o.plan || 'Заявка')}</h3>
        <span class="cabinet-status status-${o.status}">${STATUS_LABELS[o.status] || o.status}</span>
      </div>
      ${renderSteps(o.status)}
      <p>${escapeHtml(o.message || '—')}</p>
      <div class="cabinet-order-meta">${new Date(o.createdAt).toLocaleString('ru')} · ${escapeHtml(o.contact || '')}</div>
      <button class="cabinet-order-btn" data-repeat="${o.id}">Повторить заказ</button>
    </article>`
    )
    .join('');

  box.querySelectorAll('[data-repeat]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await api('orders/repeat', { method: 'POST', body: JSON.stringify({ orderId: btn.dataset.repeat }) });
        showToast('✅ Заказ повторён');
        loadOrders();
      } catch (e) {
        showToast('Ошибка: ' + e.message);
      }
    });
  });
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function loadProfile() {
  const profile = await api('profile');
  document.getElementById('profile-name').value = profile.name || '';
  document.getElementById('profile-phone').value = profile.phone || profile.contact || '';
  document.getElementById('cabinet-user-name').textContent = profile.name || 'Клиент';
}

async function loadOrders() {
  const orders = await api('orders');
  renderOrders(orders);
}

function showApp(user) {
  document.getElementById('cabinet-login').style.display = 'none';
  document.getElementById('cabinet-app').style.display = 'block';
  document.getElementById('cabinet-user-name').textContent = user?.name || 'Клиент';
  loadProfile().catch(console.error);
  loadOrders().catch(console.error);
}

window.onTelegramAuth = async function onTelegramAuth(user) {
  try {
    const data = await api('auth/telegram', { method: 'POST', body: JSON.stringify(user) });
    setSession(data.token, data.user);
    showToast('✅ Вход выполнен');
    showApp(data.user);
  } catch (e) {
    showToast('Ошибка входа: ' + e.message);
  }
};

function initTelegramWidget() {
  const box = document.getElementById('telegram-login-container');
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://telegram.org/js/telegram-widget.js?22';
  script.setAttribute('data-telegram-login', NEXORA_BOT);
  script.setAttribute('data-size', 'large');
  script.setAttribute('data-radius', '12');
  script.setAttribute('data-onauth', 'onTelegramAuth(user)');
  script.setAttribute('data-request-access', 'write');
  box.appendChild(script);
}

document.getElementById('profile-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await api('profile', {
      method: 'PATCH',
      body: JSON.stringify({
        name: document.getElementById('profile-name').value.trim(),
        phone: document.getElementById('profile-phone').value.trim(),
      }),
    });
    showToast('✅ Сохранено');
  } catch (err) {
    showToast('Ошибка: ' + err.message);
  }
});

document.getElementById('cabinet-logout').addEventListener('click', () => {
  clearSession();
  location.reload();
});

document.addEventListener('DOMContentLoaded', () => {
  initTelegramWidget();
  const token = getToken();
  if (token) {
    try {
      const user = JSON.parse(localStorage.getItem(USER_KEY) || '{}');
      showApp(user);
    } catch {
      clearSession();
    }
  }
});
