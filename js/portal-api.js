(function () {
  const GAS = (typeof NEXORA_GAS_URL !== 'undefined') ? NEXORA_GAS_URL : '';
  const STORAGE_KEY = 'nexora_portal_session';

  function parseJson(text) {
    try { return JSON.parse(text); } catch (e) { return null; }
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function saveSession(data) {
    if (!data || !data.session) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      token: data.session.token,
      csrf: data.session.csrf,
      user: data.user,
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
    const body = authPayload(Object.assign({ action: action }, data || {}));
    const payload = JSON.stringify(body);
    const bust = Date.now();
    let r = await fetch(GAS + '?payload=' + encodeURIComponent(payload) + '&_=' + bust, {
      redirect: 'follow',
      cache: 'no-store',
    });
    let d = parseJson(await r.text());
    if (!d) {
      r = await fetch(GAS, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: payload,
      });
      d = parseJson(await r.text());
    }
    if (!d) throw new Error('bad_response');
    if (d.error && d.ok === false) throw new Error(d.error);
    if (opts && opts.saveSession && d.session) saveSession(d);
    return d;
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
    const r = await fetch(GAS + '?' + qs.toString(), { redirect: 'follow', cache: 'no-store' });
    const d = parseJson(await r.text());
    if (!d || d.ok === false) throw new Error((d && d.error) || 'poll_failed');
    return d;
  }

  function fileToBase64(file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.onload = function () {
        const result = String(reader.result || '');
        const b64 = result.indexOf(',') >= 0 ? result.split(',')[1] : result;
        resolve(b64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  window.NexoraPortal = {
    url: GAS,
    getSession: getSession,
    saveSession: saveSession,
    clearSession: function () { localStorage.removeItem(STORAGE_KEY); },
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
      });
    },
    getMe: function () { return request('portalGetMe', {}); },
    forgotPassword: function (email) { return request('portalForgotPassword', { email: email }); },
    resetPassword: function (token, password) {
      return request('portalResetPassword', { token: token, password: password });
    },
    updateProfile: function (data) { return request('portalUpdateProfile', data); },
    changePassword: function (oldPassword, newPassword) {
      return request('portalChangePassword', { oldPassword: oldPassword, newPassword: newPassword });
    },
    changeEmail: function (email, password) {
      return request('portalChangeEmail', { email: email, password: password });
    },
    getProjects: function (userId) {
      return request('portalGetMyProjects', userId ? { userId: userId } : {});
    },
    getProject: function (projectId) {
      return request('portalGetProject', { projectId: projectId });
    },
    uploadFile: function (projectId, file) {
      return fileToBase64(file).then(function (data) {
        return request('portalUploadFile', {
          projectId: projectId,
          filename: file.name,
          mime: file.type || 'application/octet-stream',
          data: data,
        });
      });
    },
    sendMessage: function (text, file, userId) {
      const payload = { text: text || '' };
      if (userId) payload.userId = userId;
      if (file) {
        return fileToBase64(file).then(function (data) {
          payload.file = {
            filename: file.name,
            mime: file.type || 'application/octet-stream',
            data: data,
          };
          return request('portalSendMessage', payload);
        });
      }
      return request('portalSendMessage', payload);
    },
    markRead: function (ids, userId) {
      return request('portalMarkRead', { ids: ids, userId: userId });
    },
    adminGetClients: function () { return request('portalAdminGetClients', {}); },
    adminCreateClient: function (data) { return request('portalAdminCreateClient', data); },
    adminDeleteClient: function (userId) { return request('portalAdminDeleteClient', { userId: userId }); },
    adminCreateProject: function (data) { return request('portalAdminCreateProject', data); },
    adminUpdateProject: function (data) { return request('portalAdminUpdateProject', data); },
    adminGetAllProjects: function () { return request('portalAdminGetAllProjects', {}); },
    adminGetChats: function () { return request('portalAdminGetChats', {}); },
  };
})();
