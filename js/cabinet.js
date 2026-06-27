const STATUS_LABELS = {
  accepted: 'Принят',
  in_progress: 'В работе',
  ready: 'Готов',
};

const TOKEN_KEY = 'nexora_cabinet_token';
const USER_KEY = 'nexora_cabinet_user';
const PENDING_SESSION_KEY = 'nexora_pending_login_session';

let pollTimer = null;
let activeSessionId = null;

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

function savePendingSession(sessionId) {
  localStorage.setItem(
    PENDING_SESSION_KEY,
    JSON.stringify({ sessionId, startedAt: Date.now() })
  );
}

function loadPendingSession() {
  try {
    const raw = localStorage.getItem(PENDING_SESSION_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data?.sessionId) return null;
    if (Date.now() - (data.startedAt || 0) > 10 * 60 * 1000) {
      clearPendingSession();
      return null;
    }
    return data.sessionId;
  } catch {
    return null;
  }
}

function clearPendingSession() {
  localStorage.removeItem(PENDING_SESSION_KEY);
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
  pollTimer = null;
  activeSessionId = null;
  clearPendingSession();
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

async function checkSessionOnce(sessionId) {
  const res = await fetch(`${NEXORA_API}/auth/session/${sessionId}`);
  return res.json();
}

async function pollSessionNow() {
  if (!activeSessionId) return false;
  const waitEl = document.getElementById('login-wait');
  try {
    const data = await checkSessionOnce(activeSessionId);
    if (data.status === 'ok' && data.token) {
      loginWithToken(data.token, data.user);
      return true;
    }
    if (data.status === 'expired') {
      clearPendingSession();
      activeSessionId = null;
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = null;
      waitEl.textContent = '❌ Время истекло. Нажмите «Войти» снова.';
      document.getElementById('btn-telegram-login').disabled = false;
    }
  } catch (e) {
    console.warn('poll', e);
  }
  return false;
}

function pollSession(sessionId) {
  activeSessionId = sessionId;
  const waitEl = document.getElementById('login-wait');
  const btn = document.getElementById('btn-telegram-login');
  waitEl.style.display = 'block';
  waitEl.textContent = '⏳ Ждём подтверждения в Telegram... Вернитесь на эту вкладку после Start.';
  if (btn) btn.disabled = true;

  if (pollTimer) clearInterval(pollTimer);

  let tries = 0;
  const tick = async () => {
    tries += 1;
    const done = await pollSessionNow();
    if (done) return;
    if (tries > 120) {
      clearInterval(pollTimer);
      pollTimer = null;
      waitEl.textContent = '❌ Время истекло. Нажмите «Войти» снова.';
      if (btn) btn.disabled = false;
    }
  };

  tick();
  pollTimer = setInterval(tick, 2000);
}

function openTelegramBot(botUrl) {
  const link = document.createElement('a');
  link.href = botUrl;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

async function beginTelegramLogin() {
  const btn = document.getElementById('btn-telegram-login');
  if (btn) btn.disabled = true;
  try {
    const data = await api('auth/session', { method: 'POST', body: '{}' });
    savePendingSession(data.sessionId);
    openTelegramBot(data.botUrl);
    pollSession(data.sessionId);
  } catch (e) {
    showToast('Ошибка: ' + e.message);
    if (btn) btn.disabled = false;
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

function resumePendingLogin() {
  const sessionId = loadPendingSession();
  if (!sessionId || getToken()) return;
  pollSession(sessionId);
}

function detectStalePage() {
  if (document.getElementById('telegram-login-container')) {
    const box = document.getElementById('cabinet-login');
    if (box) {
      box.insertAdjacentHTML(
        'beforeend',
        '<p style="color:#fca5a5;font-size:14px;margin-top:12px">Устаревшая версия страницы. <a href="cabinet.html?v=5" style="color:#38bdf8">Обновить кабинет</a></p>'
      );
    }
  }
}

document.getElementById('btn-telegram-login').addEventListener('click', beginTelegramLogin);

const directBotLink = document.getElementById('telegram-direct-link');
if (directBotLink) {
  directBotLink.addEventListener('click', (e) => {
    e.preventDefault();
    beginTelegramLogin();
  });
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
  clearPendingSession();
  location.reload();
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') pollSessionNow();
});

window.addEventListener('focus', () => pollSessionNow());
window.addEventListener('pageshow', () => {
  if (!getToken()) resumePendingLogin();
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
      return;
    } catch {
      clearSession();
    }
  }
  resumePendingLogin();
});
