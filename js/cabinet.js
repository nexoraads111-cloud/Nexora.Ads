const STATUS_LABELS = {
  accepted: 'Принят',
  in_progress: 'В работе',
  ready: 'Готов',
};

const TOKEN_KEY = 'nexora_cabinet_token';
const USER_KEY = 'nexora_cabinet_user';

let pollTimer = null;

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
  if (pollTimer) clearInterval(pollTimer);
  document.getElementById('cabinet-login').style.display = 'none';
  document.getElementById('cabinet-app').style.display = 'block';
  document.getElementById('cabinet-user-name').textContent = user?.name || 'Клиент';
  loadProfile().catch(console.error);
  loadOrders().catch(console.error);
}

function loginWithToken(token, user) {
  setSession(token, user);
  showToast('✅ Вход выполнен');
  showApp(user);
}

function pollSession(sessionId) {
  const waitEl = document.getElementById('login-wait');
  waitEl.style.display = 'block';

  let tries = 0;
  pollTimer = setInterval(async () => {
    tries += 1;
    try {
      const res = await fetch(`${NEXORA_API}/auth/session/${sessionId}`);
      const data = await res.json();
      if (data.status === 'ok' && data.token) {
        clearInterval(pollTimer);
        pollTimer = null;
        loginWithToken(data.token, data.user);
      } else if (data.status === 'expired' || tries > 90) {
        clearInterval(pollTimer);
        pollTimer = null;
        waitEl.textContent = '❌ Время истекло. Нажмите «Войти» снова.';
      }
    } catch (e) {
      console.warn('poll', e);
    }
  }, 2000);
}

async function startTelegramLogin() {
  const btn = document.getElementById('btn-telegram-login');
  btn.disabled = true;
  try {
    const data = await api('auth/session', { method: 'POST', body: '{}' });
    const botUrl = data.botUrl;
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      location.href = botUrl;
    } else {
      const win = window.open(botUrl, '_blank');
      if (!win) location.href = botUrl;
    }
    document.getElementById('login-wait').style.display = 'block';
    pollSession(data.sessionId);
  } catch (e) {
    showToast('Ошибка: ' + e.message);
    btn.disabled = false;
  }
}

async function checkApi() {
  const el = document.getElementById('api-status');
  try {
    const res = await fetch(`${NEXORA_API}/health`);
    const data = await res.json();
    if (data.ok) {
      el.textContent = '✅ Сервер подключен';
      el.style.color = '#86efac';
    } else throw new Error('bad');
  } catch {
    el.textContent = '⚠️ Сервер просыпается — подождите 30 сек';
    el.style.color = '#fcd34d';
  }
}

function tryTokenFromUrl() {
  const params = new URLSearchParams(location.search);
  const token = params.get('token');
  if (!token) return false;
  setSession(token, { name: 'Клиент' });
  history.replaceState({}, '', 'cabinet.html');
  showApp({ name: 'Клиент' });
  loadProfile().catch(() => {});
  return true;
}

function detectStalePage() {
  if (document.getElementById('telegram-login-container')) {
    const box = document.getElementById('cabinet-login');
    if (box) {
      box.insertAdjacentHTML(
        'beforeend',
        '<p style="color:#fca5a5;font-size:14px;margin-top:12px">Устаревшая версия страницы. <a href="cabinet.html?v=4" style="color:#38bdf8">Обновить кабинет</a></p>'
      );
    }
  }
}

document.getElementById('btn-telegram-login').addEventListener('click', startTelegramLogin);

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
  detectStalePage();
  checkApi();
  if (tryTokenFromUrl()) return;
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
