(function () {
  const API = window.NexoraPortal;
  const STATUSES = ['Планирование', 'Дизайн', 'Разработка', 'Тестирование', 'Готов'];
  const STATUS_CLASS = {
    'Планирование': 'planning',
    'Дизайн': 'design',
    'Разработка': 'dev',
    'Тестирование': 'test',
    'Готов': 'done',
  };

  const state = {
    user: null,
    route: '',
    chatPoll: null,
    chatSince: 0,
    chatMessages: [],
    chatUserId: null,
    unread: 0,
  };

  const app = document.getElementById('app');
  const toastEl = document.getElementById('toast');

  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtDate(d) {
    if (!d) return '—';
    const dt = new Date(d);
    if (isNaN(dt)) return esc(d);
    return dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function fmtDateTime(ts) {
    if (!ts) return '';
    return new Date(ts).toLocaleString('ru-RU', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  }

  function fmtSize(bytes) {
    const n = Number(bytes) || 0;
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1048576).toFixed(1) + ' MB';
  }

  function toast(msg, type) {
    toastEl.textContent = msg;
    toastEl.className = 'nx-toast show ' + (type || 'ok');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { toastEl.className = 'nx-toast'; }, 3500);
  }

  function errMsg(code) {
    const map = {
      invalid_credentials: 'Неверный email или пароль',
      email_exists: 'Этот email уже зарегистрирован',
      weak_password: 'Пароль должен быть не менее 8 символов',
      invalid_email: 'Некорректный email',
      email_not_verified: 'Подтвердите email перед входом',
      unauthorized: 'Сессия истекла — войдите снова',
      forbidden: 'Нет доступа',
      wrong_password: 'Неверный пароль',
      invalid_token: 'Ссылка недействительна или истекла',
      not_found: 'Не найдено',
      gas_not_configured: 'API не настроен',
    };
    return map[code] || code || 'Ошибка';
  }

  function progressBar(pct, delay) {
    const p = Math.max(0, Math.min(100, Number(pct) || 0));
    return '<div class="nx-progress-wrap"><div class="nx-progress-label"><span>Прогресс</span><span>' + p + '%</span></div>' +
      '<div class="nx-progress-bar"><div class="nx-progress-fill" style="width:0" data-pct="' + p + '" data-delay="' + (delay || 0) + '"></div></div></div>';
  }

  function animateBars() {
    requestAnimationFrame(function () {
      document.querySelectorAll('.nx-progress-fill').forEach(function (el, i) {
        const pct = el.getAttribute('data-pct');
        const delay = Number(el.getAttribute('data-delay') || i * 80);
        setTimeout(function () { el.style.width = pct + '%'; }, delay);
      });
    });
  }

  function statusBadge(status) {
    const cls = STATUS_CLASS[status] || 'planning';
    return '<span class="nx-status nx-status-' + cls + '">' + esc(status) + '</span>';
  }

  function avatarHtml(user, size) {
    const cls = size === 'lg' ? 'nx-avatar lg' : 'nx-avatar';
    if (user && user.avatarUrl) {
      return '<img class="' + cls + '" src="' + esc(user.avatarUrl) + '" alt=""/>';
    }
    const letter = (user && user.name ? user.name : '?').charAt(0).toUpperCase();
    return '<div class="' + cls + '">' + esc(letter) + '</div>';
  }

  function parseRoute() {
    const raw = location.hash.replace(/^#\/?/, '') || 'dashboard';
    const qIdx = raw.indexOf('?');
    const pathPart = qIdx >= 0 ? raw.slice(0, qIdx) : raw;
    const query = qIdx >= 0 ? raw.slice(qIdx + 1) : '';
    const parts = pathPart.split('/').filter(Boolean);
    return {
      path: parts[0] || 'dashboard',
      parts: parts,
      query: new URLSearchParams(query),
    };
  }

  function nav(path) {
    location.hash = '#/' + path;
  }

  function stopChatPoll() {
    if (state.chatPoll) {
      clearInterval(state.chatPoll);
      state.chatPoll = null;
    }
  }

  async function boot() {
    const route = parseRoute();
    const publicRoutes = ['login', 'register', 'forgot', 'reset'];
    const sess = API.getSession();

    if (sess && sess.user) state.user = sess.user;

    if (!state.user && !publicRoutes.includes(route.path)) {
      nav('login');
      return;
    }

    if (state.user && publicRoutes.includes(route.path)) {
      nav(state.user.role === 'admin' ? 'admin' : 'dashboard');
      return;
    }

    if (state.user && route.path !== 'login') {
      try {
        const me = await API.getMe();
        if (me.user) {
          state.user = me.user;
          API.saveSession({ session: { token: sess.token, csrf: sess.csrf }, user: me.user });
        }
      } catch (e) {
        if (!publicRoutes.includes(route.path)) {
          API.clearSession();
          nav('login');
          return;
        }
      }
    }

    render();
  }

  function render() {
    stopChatPoll();
    const route = parseRoute();
    state.route = route.path;

    if (route.path === 'login') return renderLogin();
    if (route.path === 'register') return renderRegister();
    if (route.path === 'forgot') return renderForgot();
    if (route.path === 'reset') return renderReset(route.query.get('token'));
    if (route.path === 'dashboard') return renderDashboard();
    if (route.path === 'project') return renderProject(route.parts[1]);
    if (route.path === 'chat') return renderChat(route.parts[1]);
    if (route.path === 'profile') return renderProfile();
    if (route.path === 'admin') return renderAdmin(route.parts.slice(1));
    nav(state.user.role === 'admin' ? 'admin' : 'dashboard');
  }

  function authBrand() {
    return '<div class="nx-brand-mini"><div class="logo">N</div><div><b>NexoraAds</b><span>Личный кабинет</span></div></div>';
  }

  function renderLogin() {
    app.innerHTML = '<div class="nx-auth-wrap"><div class="nx-auth-card nx-glass">' + authBrand() +
      '<h1>Вход</h1><p>Войдите в личный кабинет для отслеживания проектов</p>' +
      '<form id="loginForm"><div class="nx-field"><label>Email</label><input type="email" name="email" required autocomplete="email"/></div>' +
      '<div class="nx-field"><label>Пароль</label><input type="password" name="password" required autocomplete="current-password"/></div>' +
      '<button class="nx-btn nx-btn-primary nx-btn-block" type="submit">Войти</button></form>' +
      '<div class="nx-auth-links"><a href="#/forgot">Забыли пароль?</a> · <a href="#/register">Регистрация</a> · <a href="/">На сайт</a></div></div></div>';

    document.getElementById('loginForm').onsubmit = async function (e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        const res = await API.login(fd.get('email'), fd.get('password'));
        state.user = res.user;
        toast('Добро пожаловать, ' + res.user.name + '!');
        nav(res.user.role === 'admin' ? 'admin' : 'dashboard');
      } catch (err) {
        toast(errMsg(err.message), 'err');
      }
    };
  }

  function renderRegister() {
    app.innerHTML = '<div class="nx-auth-wrap"><div class="nx-auth-card nx-glass">' + authBrand() +
      '<h1>Регистрация</h1><p>Создайте аккаунт для доступа к личному кабинету</p>' +
      '<form id="regForm"><div class="nx-field"><label>Имя</label><input name="name" required autocomplete="name"/></div>' +
      '<div class="nx-field"><label>Email</label><input type="email" name="email" required autocomplete="email"/></div>' +
      '<div class="nx-field"><label>Пароль</label><input type="password" name="password" required minlength="8" autocomplete="new-password"/></div>' +
      '<button class="nx-btn nx-btn-primary nx-btn-block" type="submit">Зарегистрироваться</button></form>' +
      '<div class="nx-auth-links"><a href="#/login">Уже есть аккаунт?</a> · <a href="/">На сайт</a></div></div></div>';

    document.getElementById('regForm').onsubmit = async function (e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.register(fd.get('email'), fd.get('password'), fd.get('name'));
        toast('Проверьте почту для подтверждения email');
        nav('login');
      } catch (err) {
        toast(errMsg(err.message), 'err');
      }
    };
  }

  function renderForgot() {
    app.innerHTML = '<div class="nx-auth-wrap"><div class="nx-auth-card nx-glass">' + authBrand() +
      '<h1>Восстановление</h1><p>Мы отправим ссылку для сброса пароля на ваш email</p>' +
      '<form id="forgotForm"><div class="nx-field"><label>Email</label><input type="email" name="email" required/></div>' +
      '<button class="nx-btn nx-btn-primary nx-btn-block" type="submit">Отправить ссылку</button></form>' +
      '<div class="nx-auth-links"><a href="#/login">← Назад к входу</a></div></div></div>';

    document.getElementById('forgotForm').onsubmit = async function (e) {
      e.preventDefault();
      const email = new FormData(e.target).get('email');
      try {
        await API.forgotPassword(email);
        toast('Если аккаунт существует, письмо отправлено');
        nav('login');
      } catch (err) {
        toast(errMsg(err.message), 'err');
      }
    };
  }

  function renderReset(token) {
    const t = token || '';
    app.innerHTML = '<div class="nx-auth-wrap"><div class="nx-auth-card nx-glass">' + authBrand() +
      '<h1>Новый пароль</h1><p>Установите новый пароль для вашего аккаунта</p>' +
      '<form id="resetForm"><input type="hidden" name="token" value="' + esc(t) + '"/>' +
      '<div class="nx-field"><label>Новый пароль</label><input type="password" name="password" required minlength="8" autocomplete="new-password"/></div>' +
      '<button class="nx-btn nx-btn-primary nx-btn-block" type="submit">Сохранить</button></form>' +
      '<div class="nx-auth-links"><a href="#/login">← К входу</a></div></div></div>';

    document.getElementById('resetForm').onsubmit = async function (e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.resetPassword(fd.get('token'), fd.get('password'));
        toast('Пароль обновлён');
        nav('login');
      } catch (err) {
        toast(errMsg(err.message), 'err');
      }
    };
  }

  function shellLayout(active, content) {
    const isAdmin = state.user.role === 'admin';
    const badge = state.unread > 0 ? '<span class="badge">' + state.unread + '</span>' : '';
    return '<button class="nx-mobile-toggle" id="menuToggle">☰</button>' +
      '<div class="nx-shell"><aside class="nx-sidebar" id="sidebar">' + authBrand() +
      '<nav class="nx-nav">' +
      (isAdmin ? '' : '<a href="#/dashboard" class="' + (active === 'dashboard' ? 'active' : '') + '">📊 Dashboard</a>') +
      (isAdmin ? '<a href="#/admin" class="' + (active === 'admin' ? 'active' : '') + '">⚡ Админ-панель</a>' +
        '<a href="#/admin/clients" class="' + (active === 'clients' ? 'active' : '') + '">👥 Клиенты</a>' +
        '<a href="#/admin/projects" class="' + (active === 'projects' ? 'active' : '') + '">📁 Проекты</a>' : '') +
      '<a href="#/chat" class="' + (active === 'chat' ? 'active' : '') + '">💬 Чат' + badge + '</a>' +
      '<a href="#/profile" class="' + (active === 'profile' ? 'active' : '') + '">👤 Профиль</a>' +
      '</nav><div class="nx-sidebar-foot"><button class="nx-nav" style="width:100%" id="logoutBtn">🚪 Выйти</button>' +
      '<a href="/" style="display:block;padding:12px 14px;font-size:13px;color:var(--nx-muted)">← На сайт</a></div></aside>' +
      '<main class="nx-main">' + content + '</main></div>';
  }

  async function loadUnread() {
    try {
      if (state.user.role === 'admin') {
        const res = await API.adminGetChats();
        state.unread = (res.chats || []).reduce(function (s, c) { return s + (c.unread || 0); }, 0);
      } else {
        const res = await API.pollMessages(0);
        state.unread = (res.messages || []).filter(function (m) {
          return m.senderRole === 'admin' && m.status === 'sent';
        }).length;
      }
    } catch (e) { state.unread = 0; }
  }

  async function renderDashboard() {
    app.innerHTML = shellLayout('dashboard', '<div class="nx-topbar"><div><h1>Загрузка…</h1></div></div>');
    await loadUnread();
    try {
      const res = await API.getProjects();
      const projects = res.projects || [];
      const cards = projects.length ? projects.map(function (p, i) {
        return '<div class="nx-card nx-glass nx-project-card" onclick="location.hash=\'#/project/' + esc(p.id) + '\'" style="animation-delay:' + (i * 60) + 'ms">' +
          '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">' +
          '<h3 style="margin:0">' + esc(p.title) + '</h3>' + statusBadge(p.status) + '</div>' +
          '<p style="color:var(--nx-muted);font-size:14px;margin:12px 0 0">' + esc(p.description).slice(0, 120) + (p.description.length > 120 ? '…' : '') + '</p>' +
          progressBar(p.progress, i * 100) +
          '<div class="nx-meta"><span>📅 ' + fmtDate(p.startDate) + '</span><span>🎯 ' + fmtDate(p.dueDate) + '</span></div></div>';
      }).join('') : '<div class="nx-card nx-glass nx-empty"><div class="icon">📁</div><p>Проектов пока нет</p><p style="font-size:13px">Когда администратор назначит проект, он появится здесь</p></div>';

      app.innerHTML = shellLayout('dashboard',
        '<div class="nx-topbar"><div><h1>Привет, ' + esc(state.user.name) + ' 👋</h1>' +
        '<p>Ваши проекты и статус выполнения</p></div>' +
        '<div class="nx-user-chip">' + avatarHtml(state.user) + '<span>' + esc(state.user.name) + '</span></div></div>' +
        '<div class="nx-grid nx-grid-2">' + cards + '</div>');

      bindShellEvents();
      animateBars();
    } catch (err) {
      toast(errMsg(err.message), 'err');
    }
  }

  function bindShellEvents() {
    document.getElementById('logoutBtn').onclick = async function () {
      await API.logout();
      state.user = null;
      nav('login');
    };
    var toggle = document.getElementById('menuToggle');
    if (toggle) toggle.onclick = function () {
      document.getElementById('sidebar').classList.toggle('open');
    };
  }

  async function renderProject(id) {
    if (!id) { nav('dashboard'); return; }
    app.innerHTML = shellLayout('dashboard', '<div class="nx-topbar"><h1>Загрузка…</h1></div>');
    await loadUnread();
    try {
      const res = await API.getProject(id);
      const p = res.project;
      const isAdmin = state.user.role === 'admin';
      const history = (p.history || []).map(function (h) {
        return '<div class="nx-timeline-item"><div class="nx-timeline-dot"></div><div class="nx-timeline-body">' +
          '<b>' + esc(h.text) + '</b><small>' + esc(h.byName) + ' · ' + fmtDateTime(h.createdAt) + '</small></div></div>';
      }).join('') || '<p class="sub">История пока пуста</p>';

      const files = (p.files || []).map(function (f) {
        return '<div class="nx-file-row"><span class="icon">📎</span><div class="info"><b>' + esc(f.filename) + '</b>' +
          '<small>' + fmtSize(f.size) + ' · ' + fmtDateTime(f.createdAt) + '</small></div>' +
          '<a class="nx-btn nx-btn-ghost nx-btn-sm" href="' + esc(f.url) + '" target="_blank" rel="noopener">Скачать</a></div>';
      }).join('') || '<p class="sub">Файлов пока нет</p>';

      const archiveBtn = p.status === 'Готов' && p.archiveUrl
        ? '<a class="nx-btn nx-btn-primary" href="' + esc(p.archiveUrl) + '" target="_blank" rel="noopener">⬇ Скачать архив сайта</a>'
        : (p.status === 'Готов' ? '<p class="sub">Архив будет доступен после загрузки администратором</p>' : '');

      const adminControls = isAdmin ? '<div class="nx-card nx-glass" style="margin-top:20px"><h3>Управление проектом</h3>' +
        '<form id="adminProjectForm"><div class="nx-form-row">' +
        '<div class="nx-field"><label>Статус</label><select name="status">' +
        STATUSES.map(function (s) { return '<option' + (s === p.status ? ' selected' : '') + '>' + s + '</option>'; }).join('') +
        '</select></div><div class="nx-field"><label>Прогресс %</label><input type="number" name="progress" min="0" max="100" value="' + p.progress + '"/></div></div>' +
        '<div class="nx-form-row"><div class="nx-field"><label>Срок сдачи</label><input name="dueDate" value="' + esc(p.dueDate) + '"/></div>' +
        '<div class="nx-field"><label>URL архива</label><input name="archiveUrl" value="' + esc(p.archiveUrl) + '" placeholder="https://..."/></div></div>' +
        '<button class="nx-btn nx-btn-primary" type="submit">Сохранить</button></form>' +
        '<div style="margin-top:20px"><label class="nx-upload-zone" id="uploadZone">📤 Загрузить файл для клиента<input type="file" id="fileInput" hidden/></label></div></div>' : '';

      app.innerHTML = shellLayout('dashboard',
        '<button class="nx-back-link" onclick="location.hash=\'#/dashboard\'">← Назад</button>' +
        '<div class="nx-topbar"><div><h1>' + esc(p.title) + '</h1><p>' + esc(p.description) + '</p></div>' +
        statusBadge(p.status) + '</div>' +
        '<div class="nx-grid nx-grid-2"><div class="nx-card nx-glass">' + progressBar(p.progress) +
        '<div class="nx-meta" style="margin-top:16px"><span>📅 Начало: ' + fmtDate(p.startDate) + '</span>' +
        '<span>🎯 Срок: ' + fmtDate(p.dueDate) + '</span></div>' + archiveBtn + '</div>' +
        '<div class="nx-card nx-glass"><h3>История обновлений</h3><div class="nx-timeline">' + history + '</div></div></div>' +
        '<div class="nx-card nx-glass" style="margin-top:20px"><h3>Файлы проекта</h3><div class="nx-files-list">' + files + '</div></div>' +
        adminControls);

      bindShellEvents();
      animateBars();

      if (isAdmin) {
        document.getElementById('adminProjectForm').onsubmit = async function (e) {
          e.preventDefault();
          const fd = new FormData(e.target);
          try {
            await API.adminUpdateProject({
              projectId: id,
              status: fd.get('status'),
              progress: fd.get('progress'),
              dueDate: fd.get('dueDate'),
              archiveUrl: fd.get('archiveUrl'),
            });
            toast('Проект обновлён');
            renderProject(id);
          } catch (err) { toast(errMsg(err.message), 'err'); }
        };
        var zone = document.getElementById('uploadZone');
        var input = document.getElementById('fileInput');
        zone.onclick = function () { input.click(); };
        input.onchange = async function () {
          if (!input.files[0]) return;
          try {
            toast('Загрузка…');
            await API.uploadFile(id, input.files[0]);
            toast('Файл загружен');
            renderProject(id);
          } catch (err) { toast(errMsg(err.message), 'err'); }
        };
      }
    } catch (err) {
      toast(errMsg(err.message), 'err');
      nav('dashboard');
    }
  }

  function renderMessages(msgs) {
    return msgs.map(function (m) {
      const mine = m.senderId === state.user.id;
      const fileHtml = m.file ? '<a class="file-link" href="' + esc(m.file.url) + '" target="_blank" rel="noopener">📎 ' + esc(m.file.filename) + ' (' + fmtSize(m.file.size) + ')</a>' : '';
      const statusHtml = mine ? '<span class="status">' + (m.status === 'read' ? '✓✓' : '✓') + '</span>' : '';
      return '<div class="nx-msg ' + (mine ? 'mine' : 'theirs') + '">' + esc(m.text) + fileHtml +
        '<time>' + fmtDateTime(m.createdAt) + statusHtml + '</time></div>';
    }).join('');
  }

  async function renderChat(userId) {
    await loadUnread();
    const isAdmin = state.user.role === 'admin';
    state.chatUserId = isAdmin ? userId : state.user.id;
    state.chatMessages = [];
    state.chatSince = 0;

    let chatListHtml = '';
    if (isAdmin) {
      try {
        const chatsRes = await API.adminGetChats();
        const chats = chatsRes.chats || [];
        chatListHtml = '<div class="nx-chat-list nx-glass">' +
          (chats.length ? chats.map(function (c) {
            return '<button class="nx-chat-item' + (c.userId === state.chatUserId ? ' active' : '') + '" data-uid="' + esc(c.userId) + '">' +
              '<b>' + esc(c.name) + (c.unread ? ' <span class="badge">' + c.unread + '</span>' : '') + '</b>' +
              '<small>' + esc(c.lastText || 'Нет сообщений') + '</small></button>';
          }).join('') : '<p class="sub" style="padding:16px">Чатов пока нет</p>') + '</div>';
      } catch (e) {
        chatListHtml = '<div class="nx-chat-list nx-glass"><p class="sub">Ошибка загрузки</p></div>';
      }
    }

    const chatTitle = isAdmin ? 'Чат с клиентом' : 'Личный чат с NexoraAds';
    app.innerHTML = shellLayout('chat',
      '<div class="nx-topbar"><div><h1>' + chatTitle + '</h1><p>Приватный диалог — только вы и администратор</p></div></div>' +
      '<div class="nx-chat-layout">' + (isAdmin ? chatListHtml : '') +
      '<div class="nx-card nx-glass nx-chat-window"><div class="nx-chat-header" id="chatHeader">' +
      (isAdmin && !state.chatUserId ? 'Выберите клиента' : '💬 Диалог') + '</div>' +
      '<div class="nx-chat-messages" id="chatMessages"></div>' +
      '<div class="nx-chat-input" id="chatInput" style="' + (isAdmin && !state.chatUserId ? 'display:none' : '') + '">' +
      '<button class="attach-btn" id="attachBtn" title="Прикрепить файл">📎</button>' +
      '<input type="file" id="chatFile" hidden accept="image/*,.pdf,.zip,.rar,.doc,.docx"/>' +
      '<textarea id="msgText" placeholder="Сообщение…" rows="1"></textarea>' +
      '<button class="nx-btn nx-btn-primary nx-btn-sm" id="sendBtn">Отправить</button></div></div></div>');

    bindShellEvents();

    if (isAdmin) {
      document.querySelectorAll('.nx-chat-item').forEach(function (btn) {
        btn.onclick = function () {
          nav('chat/' + btn.getAttribute('data-uid'));
        };
      });
    }

    if (!isAdmin || state.chatUserId) {
      await refreshChat();
      startChatPoll();
      bindChatInput();
    }
  }

  function bindChatInput() {
    var sendBtn = document.getElementById('sendBtn');
    var attachBtn = document.getElementById('attachBtn');
    var chatFile = document.getElementById('chatFile');
    var msgText = document.getElementById('msgText');

    sendBtn.onclick = sendChatMessage;
    msgText.onkeydown = function (e) {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
    };
    attachBtn.onclick = function () { chatFile.click(); };
    chatFile.onchange = function () {
      if (chatFile.files[0]) sendChatMessage(chatFile.files[0]);
    };
  }

  async function sendChatMessage(file) {
    var text = document.getElementById('msgText').value.trim();
    var f = file || document.getElementById('chatFile').files[0];
    if (!text && !f) return;
    try {
      document.getElementById('sendBtn').disabled = true;
      const uid = state.user.role === 'admin' ? state.chatUserId : undefined;
      await API.sendMessage(text, f, uid);
      document.getElementById('msgText').value = '';
      document.getElementById('chatFile').value = '';
      await refreshChat();
    } catch (err) {
      toast(errMsg(err.message), 'err');
    } finally {
      document.getElementById('sendBtn').disabled = false;
    }
  }

  async function refreshChat() {
    try {
      const uid = state.user.role === 'admin' ? state.chatUserId : undefined;
      const res = await API.pollMessages(state.chatSince, uid);
      const newMsgs = res.messages || [];
      if (newMsgs.length) {
        state.chatMessages = state.chatMessages.concat(newMsgs);
        state.chatSince = Math.max.apply(null, state.chatMessages.map(function (m) { return m.createdAt; }));
        var box = document.getElementById('chatMessages');
        if (box) {
          box.innerHTML = renderMessages(state.chatMessages);
          box.scrollTop = box.scrollHeight;
        }
        var toMark = newMsgs.filter(function (m) {
          return m.senderId !== state.user.id && m.status === 'sent';
        }).map(function (m) { return m.id; });
        if (toMark.length) API.markRead(toMark, uid);
      } else if (!state.chatMessages.length) {
        var box2 = document.getElementById('chatMessages');
        if (box2) box2.innerHTML = '<p class="sub" style="text-align:center;margin-top:40px">Начните диалог — напишите первое сообщение</p>';
      }
    } catch (e) { /* silent poll errors */ }
  }

  function startChatPoll() {
    stopChatPoll();
    state.chatPoll = setInterval(refreshChat, 2500);
  }

  async function renderProfile() {
    await loadUnread();
    const u = state.user;
    app.innerHTML = shellLayout('profile',
      '<div class="nx-topbar"><div><h1>Профиль</h1><p>Настройки аккаунта</p></div></div>' +
      '<div class="nx-grid nx-grid-2">' +
      '<div class="nx-card nx-glass"><div style="display:flex;align-items:center;gap:20px;margin-bottom:24px">' +
      avatarHtml(u, 'lg') + '<div><h2 style="margin:0">' + esc(u.name) + '</h2><p class="sub">' + esc(u.email) +
      (u.role === 'admin' ? ' <span class="nx-admin-badge">Admin</span>' : '') + '</p></div></div>' +
      '<form id="avatarForm"><label class="nx-upload-zone">📷 Загрузить аватар<input type="file" name="avatar" accept="image/*" hidden/></label></form></div>' +
      '<div class="nx-card nx-glass"><h3>Имя</h3><form id="nameForm"><div class="nx-field"><input name="name" value="' + esc(u.name) + '" required/></div>' +
      '<button class="nx-btn nx-btn-primary nx-btn-sm" type="submit">Сохранить</button></form></div>' +
      '<div class="nx-card nx-glass"><h3>Сменить email</h3><form id="emailForm">' +
      '<div class="nx-field"><label>Новый email</label><input type="email" name="email" required/></div>' +
      '<div class="nx-field"><label>Текущий пароль</label><input type="password" name="password" required/></div>' +
      '<button class="nx-btn nx-btn-primary nx-btn-sm" type="submit">Обновить email</button></form></div>' +
      '<div class="nx-card nx-glass"><h3>Сменить пароль</h3><form id="passForm">' +
      '<div class="nx-field"><label>Текущий пароль</label><input type="password" name="oldPassword" required/></div>' +
      '<div class="nx-field"><label>Новый пароль</label><input type="password" name="newPassword" required minlength="8"/></div>' +
      '<button class="nx-btn nx-btn-primary nx-btn-sm" type="submit">Обновить пароль</button></form></div></div>');

    bindShellEvents();

    document.getElementById('nameForm').onsubmit = async function (e) {
      e.preventDefault();
      try {
        const res = await API.updateProfile({ name: new FormData(e.target).get('name') });
        state.user = res.user;
        toast('Имя обновлено');
      } catch (err) { toast(errMsg(err.message), 'err'); }
    };

    document.getElementById('emailForm').onsubmit = async function (e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        const res = await API.changeEmail(fd.get('email'), fd.get('password'));
        state.user = res.user;
        toast('Email обновлён — проверьте почту для подтверждения');
      } catch (err) { toast(errMsg(err.message), 'err'); }
    };

    document.getElementById('passForm').onsubmit = async function (e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await API.changePassword(fd.get('oldPassword'), fd.get('newPassword'));
        toast('Пароль обновлён');
        e.target.reset();
      } catch (err) { toast(errMsg(err.message), 'err'); }
    };

    document.querySelector('#avatarForm input').onchange = async function (e) {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 500000) { toast('Изображение слишком большое (макс. 500 KB)', 'err'); return; }
      try {
        const reader = new FileReader();
        reader.onload = async function () {
          const res = await API.updateProfile({ avatarUrl: reader.result });
          state.user = res.user;
          toast('Аватар обновлён');
          renderProfile();
        };
        reader.readAsDataURL(file);
      } catch (err) { toast(errMsg(err.message), 'err'); }
    };
  }

  async function renderAdmin(parts) {
    if (state.user.role !== 'admin') { nav('dashboard'); return; }
    await loadUnread();
    const sub = (parts && parts[0]) || '';

    if (sub === 'clients') return renderAdminClients();
    if (sub === 'projects') return renderAdminProjects();
    if (sub === 'chat' && parts[1]) { nav('chat/' + parts[1]); return; }

    app.innerHTML = shellLayout('admin',
      '<div class="nx-topbar"><div><h1>Админ-панель <span class="nx-admin-badge">Admin</span></h1>' +
      '<p>Управление клиентами, проектами и чатами</p></div></div>' +
      '<div class="nx-grid nx-grid-3">' +
      '<div class="nx-card nx-glass nx-project-card" onclick="location.hash=\'#/admin/clients\'"><h3>👥 Клиенты</h3><p class="sub">Создание и удаление клиентов</p></div>' +
      '<div class="nx-card nx-glass nx-project-card" onclick="location.hash=\'#/admin/projects\'"><h3>📁 Проекты</h3><p class="sub">Все проекты и статусы</p></div>' +
      '<div class="nx-card nx-glass nx-project-card" onclick="location.hash=\'#/chat\'"><h3>💬 Чаты</h3><p class="sub">Личные диалоги с клиентами</p></div></div>');
    bindShellEvents();
  }

  async function renderAdminClients() {
    app.innerHTML = shellLayout('clients', '<div class="nx-topbar"><h1>Загрузка…</h1></div>');
    try {
      const res = await API.adminGetClients();
      const clients = res.clients || [];
      const rows = clients.map(function (c) {
        return '<tr><td>' + avatarHtml(c) + ' ' + esc(c.name) + '</td><td>' + esc(c.email) + '</td>' +
          '<td>' + fmtDateTime(c.createdAt) + '</td><td>' +
          '<button class="nx-btn nx-btn-ghost nx-btn-sm" onclick="location.hash=\'#/chat/' + esc(c.id) + '\'">💬</button> ' +
          '<button class="nx-btn nx-btn-danger nx-btn-sm" data-del="' + esc(c.id) + '">Удалить</button></td></tr>';
      }).join('');

      app.innerHTML = shellLayout('clients',
        '<button class="nx-back-link" onclick="location.hash=\'#/admin\'">← Админ</button>' +
        '<div class="nx-topbar"><div><h1>Клиенты</h1><p>' + clients.length + ' клиентов</p></div></div>' +
        '<div class="nx-grid nx-grid-2"><div class="nx-card nx-glass"><h3>Новый клиент</h3>' +
        '<form id="newClientForm"><div class="nx-field"><label>Имя</label><input name="name" required/></div>' +
        '<div class="nx-field"><label>Email</label><input type="email" name="email" required/></div>' +
        '<div class="nx-field"><label>Пароль (опционально)</label><input name="password" placeholder="Автогенерация"/></div>' +
        '<button class="nx-btn nx-btn-primary" type="submit">Создать клиента</button></form></div>' +
        '<div class="nx-card nx-glass nx-table-wrap"><table class="nx-table"><thead><tr><th>Клиент</th><th>Email</th><th>Создан</th><th></th></tr></thead><tbody>' +
        (rows || '<tr><td colspan="4" class="sub">Нет клиентов</td></tr>') + '</tbody></table></div></div>');

      bindShellEvents();
      document.getElementById('newClientForm').onsubmit = async function (e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
          await API.adminCreateClient({
            name: fd.get('name'), email: fd.get('email'), password: fd.get('password') || undefined,
          });
          toast('Клиент создан — пароль отправлен на email');
          renderAdminClients();
        } catch (err) { toast(errMsg(err.message), 'err'); }
      };
      document.querySelectorAll('[data-del]').forEach(function (btn) {
        btn.onclick = async function () {
          if (!confirm('Удалить клиента?')) return;
          try {
            await API.adminDeleteClient(btn.getAttribute('data-del'));
            toast('Клиент удалён');
            renderAdminClients();
          } catch (err) { toast(errMsg(err.message), 'err'); }
        };
      });
    } catch (err) { toast(errMsg(err.message), 'err'); }
  }

  async function renderAdminProjects() {
    app.innerHTML = shellLayout('projects', '<div class="nx-topbar"><h1>Загрузка…</h1></div>');
    try {
      const [projRes, clientsRes] = await Promise.all([API.adminGetAllProjects(), API.adminGetClients()]);
      const projects = projRes.projects || [];
      const clients = clientsRes.clients || [];
      const clientOpts = clients.map(function (c) {
        return '<option value="' + esc(c.id) + '">' + esc(c.name) + ' (' + esc(c.email) + ')</option>';
      }).join('');

      const rows = projects.map(function (p) {
        const client = clients.find(function (c) { return c.id === p.userId; });
        return '<tr><td><a href="#/project/' + esc(p.id) + '">' + esc(p.title) + '</a></td>' +
          '<td>' + esc(client ? client.name : p.userId) + '</td>' +
          '<td>' + statusBadge(p.status) + '</td><td>' + p.progress + '%</td>' +
          '<td>' + fmtDate(p.dueDate) + '</td></tr>';
      }).join('');

      app.innerHTML = shellLayout('projects',
        '<button class="nx-back-link" onclick="location.hash=\'#/admin\'">← Админ</button>' +
        '<div class="nx-topbar"><div><h1>Проекты</h1><p>' + projects.length + ' проектов</p></div></div>' +
        '<div class="nx-grid nx-grid-2"><div class="nx-card nx-glass"><h3>Новый проект</h3>' +
        '<form id="newProjectForm"><div class="nx-field"><label>Клиент</label><select name="userId" required>' + clientOpts + '</select></div>' +
        '<div class="nx-field"><label>Название</label><input name="title" required/></div>' +
        '<div class="nx-field"><label>Описание</label><textarea name="description"></textarea></div>' +
        '<div class="nx-form-row"><div class="nx-field"><label>Дата начала</label><input name="startDate" type="date"/></div>' +
        '<div class="nx-field"><label>Срок сдачи</label><input name="dueDate" type="date"/></div></div>' +
        '<button class="nx-btn nx-btn-primary" type="submit">Создать проект</button></form></div>' +
        '<div class="nx-card nx-glass nx-table-wrap"><table class="nx-table"><thead><tr><th>Проект</th><th>Клиент</th><th>Статус</th><th>%</th><th>Срок</th></tr></thead><tbody>' +
        (rows || '<tr><td colspan="5">Нет проектов</td></tr>') + '</tbody></table></div></div>');

      bindShellEvents();
      document.getElementById('newProjectForm').onsubmit = async function (e) {
        e.preventDefault();
        const fd = new FormData(e.target);
        try {
          await API.adminCreateProject({
            userId: fd.get('userId'), title: fd.get('title'), description: fd.get('description'),
            startDate: fd.get('startDate'), dueDate: fd.get('dueDate'),
          });
          toast('Проект создан');
          renderAdminProjects();
        } catch (err) { toast(errMsg(err.message), 'err'); }
      };
    } catch (err) { toast(errMsg(err.message), 'err'); }
  }

  window.addEventListener('hashchange', boot);
  boot();
})();
