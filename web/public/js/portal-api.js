(function () {
  const GAS = (typeof NEXORA_GAS_URL !== 'undefined') ? NEXORA_GAS_URL : '';
  const STORAGE_KEY = 'nexora_portal_session';
  const _cache = {};
  const _inflight = {};

  function parseJson(text) {
    try { return JSON.parse(text); } catch (e) { return null; }
  }

  function cacheGet(key) {
    const e = _cache[key];
    if (e && e.exp > Date.now()) return e.data;
    return null;
  }

  function cacheSet(key, data, ttl) {
    _cache[key] = { data: data, exp: Date.now() + (ttl || 30000) };
  }

  function cacheClear(prefix) {
    Object.keys(_cache).forEach(function (k) {
      if (!prefix || k.indexOf(prefix) === 0) delete _cache[k];
    });
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function trimUser(user) {
    if (!user) return user;
    if (user.avatarUrl && user.avatarUrl.length > 8000) {
      return Object.assign({}, user, { avatarUrl: '' });
    }
    return user;
  }

  function saveSession(data) {
    if (!data || !data.session) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      token: data.session.token,
      csrf: data.session.csrf,
      user: trimUser(data.user),
    }));
  }

  function authPayload(extra) {
    const s = getSession();
    const body = Object.assign({}, extra || {});
    if (s) {
      body.session = s.token;
      body.csrf = s.csrf;
    }
    return body;
  }

  async function request(action, data, opts) {
    if (!GAS) throw new Error('gas_not_configured');
    opts = opts || {};
    const cacheKey = opts.cacheKey;
    if (cacheKey) {
      const hit = cacheGet(cacheKey);
      if (hit) return hit;
    }

    const dedupeKey = action + ':' + JSON.stringify(data || {});
    if (_inflight[dedupeKey]) return _inflight[dedupeKey];

    const run = (async function () {
      const body = authPayload(Object.assign({ action: action }, data || {}));
      const payload = JSON.stringify(body);
      const r = await fetch(GAS + '?payload=' + encodeURIComponent(payload) + '&_=' + Date.now(), {
        redirect: 'follow',
        cache: 'no-store',
        keepalive: true,
      });
      let d = parseJson(await r.text());
      if (!d) throw new Error('bad_response');
      if (d.error && d.ok === false) throw new Error(d.error);
      if (opts.saveSession && d.session) saveSession(d);
      if (cacheKey && d.ok !== false) cacheSet(cacheKey, d, opts.cacheTtl || 30000);
      if (opts.invalidate) cacheClear(opts.invalidate);
      return d;
    })();

    _inflight[dedupeKey] = run;
    try {
      return await run;
    } finally {
      delete _inflight[dedupeKey];
    }
  }

  async function pollMessages(since, userId) {
    const s = getSession();
    if (!s) throw new Error('unauthorized');
    const qs = new URLSearchParams({
      action: 'portalMessages',
      session: s.token,
      since: String(since || 0),
      _: String(Date.now()),
    });
    if (userId) qs.set('userId', userId);
    const r = await fetch(GAS + '?' + qs.toString(), { redirect: 'follow', cache: 'no-store', keepalive: true });
    const d = parseJson(await r.text());
    if (!d || d.ok === false) throw new Error((d && d.error) || 'poll_failed');
    return d;
  }

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        const result = String(reader.result || '');
        resolve(result.indexOf(',') >= 0 ? result.split(',')[1] : result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  window.NexoraPortal = {
    url: GAS,
    getSession: getSession,
    saveSession: saveSession,
    clearSession: function () {
      localStorage.removeItem(STORAGE_KEY);
      cacheClear('');
    },
    cacheGet: cacheGet,
    cacheSet: cacheSet,
    cacheClear: cacheClear,
    request: request,
    pollMessages: pollMessages,
    fileToBase64: fileToBase64,
    register: function (email, password, name) {
      return request('portalRegister', { email: email, password: password, name: name });
    },
    login: function (email, password) {
      return request('portalLogin', { email: email, password: password }, { saveSession: true });
    },
    logout: function () {
      return request('portalLogout', {}).finally(function () {
        localStorage.removeItem(STORAGE_KEY);
        cacheClear('');
      });
    },
    getMe: function () { return request('portalGetMe', {}); },
    getDashboard: function () {
      return request('portalGetDashboard', {}, { cacheKey: 'dashboard', cacheTtl: 45000 });
    },
    forgotPassword: function (email) { return request('portalForgotPassword', { email: email }); },
    resetPassword: function (token, password) {
      return request('portalResetPassword', { token: token, password: password });
    },
    updateProfile: function (data) {
      return request('portalUpdateProfile', data, { invalidate: 'dashboard' });
    },
    changePassword: function (oldPassword, newPassword) {
      return request('portalChangePassword', { oldPassword: oldPassword, newPassword: newPassword });
    },
    changeEmail: function (email, password) {
      return request('portalChangeEmail', { email: email, password: password });
    },
    getProjects: function (userId) {
      return request('portalGetMyProjects', userId ? { userId: userId } : {}, { cacheKey: 'projects', cacheTtl: 45000 });
    },
    getProject: function (projectId) {
      return request('portalGetProject', { projectId: projectId }, { cacheKey: 'project_' + projectId, cacheTtl: 20000 });
    },
    uploadFile: function (projectId, file) {
      return fileToBase64(file).then(function (b64) {
        return request('portalUploadFile', {
          projectId: projectId,
          filename: file.name,
          mime: file.type || 'application/octet-stream',
          data: b64,
        }, { invalidate: 'project_' + projectId });
      });
    },
    sendMessage: function (text, file, userId) {
      const payload = { text: text || '' };
      if (userId) payload.userId = userId;
      if (file) {
        return fileToBase64(file).then(function (b64) {
          payload.file = { filename: file.name, mime: file.type || 'application/octet-stream', data: b64 };
          cacheClear('dashboard');
          return request('portalSendMessage', payload);
        });
      }
      cacheClear('dashboard');
      return request('portalSendMessage', payload);
    },
    markRead: function (ids, userId) {
      if (!ids || !ids.length) return Promise.resolve({ ok: true });
      return request('portalMarkRead', { ids: ids, userId: userId });
    },
    adminGetClients: function () {
      return request('portalAdminGetClients', {}, { cacheKey: 'clients', cacheTtl: 30000 });
    },
    adminCreateClient: function (data) {
      return request('portalAdminCreateClient', data, { invalidate: 'clients' });
    },
    adminDeleteClient: function (userId) {
      return request('portalAdminDeleteClient', { userId: userId }, { invalidate: 'clients' });
    },
    adminCreateProject: function (data) {
      return request('portalAdminCreateProject', data, { invalidate: 'dashboard' });
    },
    adminUpdateProject: function (data) {
      return request('portalAdminUpdateProject', data, { invalidate: 'project_' + data.projectId });
    },
    adminGetAllProjects: function () {
      return request('portalAdminGetAllProjects', {}, { cacheKey: 'allprojects', cacheTtl: 30000 });
    },
    adminGetChats: function () {
      return request('portalAdminGetChats', {}, { cacheKey: 'chats', cacheTtl: 15000 });
    },
  };
})();
