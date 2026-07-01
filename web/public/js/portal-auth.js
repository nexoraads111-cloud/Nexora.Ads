(function () {
  function errMsg(code) {
    var map = {
      invalid_credentials: 'Неверный email или пароль',
      email_exists: 'Этот email уже зарегистрирован',
      weak_password: 'Пароль должен быть не менее 8 символов',
      invalid_email: 'Некорректный email',
      email_not_verified: 'Подтвердите email — проверьте почту',
      check_email: 'Проверьте почту для подтверждения',
      if_exists_sent: 'Если аккаунт существует, письмо отправлено',
    };
    return map[code] || code || 'Ошибка';
  }

  function getSession() {
    return window.NexoraPortal ? NexoraPortal.getSession() : null;
  }

  function goPortal(user) {
    var dest = user && user.role === 'admin' ? '/portal/#/admin' : '/portal/#/dashboard';
    location.href = dest;
  }

  window.openPortalAuth = function (tab) {
    var s = getSession();
    if (s && s.user) return goPortal(s.user);
    switchAuthTab(tab || 'login');
    document.getElementById('portalAuthModal').classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closePortalAuth = function () {
    document.getElementById('portalAuthModal').classList.remove('active');
    document.body.style.overflow = '';
  };

  window.switchAuthTab = function (tab) {
    document.querySelectorAll('.nx-auth-tab').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === tab);
    });
    document.querySelectorAll('.nx-auth-pane').forEach(function (p) {
      p.style.display = p.id === 'auth-' + tab ? 'block' : 'none';
    });
  };

  window.submitPortalLogin = async function (e) {
    e.preventDefault();
    var btn = e.target.querySelector('button[type=submit]');
    var fd = new FormData(e.target);
    var old = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Вход…';
    try {
      var res = await NexoraPortal.login(fd.get('email'), fd.get('password'));
      closePortalAuth();
      if (typeof showToast === 'function') showToast('Добро пожаловать, ' + res.user.name + '!');
      updatePortalNav();
      goPortal(res.user);
    } catch (err) {
      if (typeof showToast === 'function') showToast(errMsg(err.message), 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = old;
    }
  };

  window.submitPortalRegister = async function (e) {
    e.preventDefault();
    var btn = e.target.querySelector('button[type=submit]');
    var fd = new FormData(e.target);
    var old = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Регистрация…';
    try {
      await NexoraPortal.register(fd.get('email'), fd.get('password'), fd.get('name'));
      closePortalAuth();
      if (typeof showToast === 'function') showToast('✅ Аккаунт создан! Проверьте почту для подтверждения email.');
      switchAuthTab('login');
    } catch (err) {
      if (typeof showToast === 'function') showToast(errMsg(err.message), 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = old;
    }
  };

  window.submitPortalForgot = async function (e) {
    e.preventDefault();
    var btn = e.target.querySelector('button[type=submit]');
    var fd = new FormData(e.target);
    var old = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Отправка…';
    try {
      await NexoraPortal.forgotPassword(fd.get('email'));
      closePortalAuth();
      if (typeof showToast === 'function') showToast('Если аккаунт существует, письмо отправлено');
      switchAuthTab('login');
    } catch (err) {
      if (typeof showToast === 'function') showToast(errMsg(err.message), 'err');
    } finally {
      btn.disabled = false;
      btn.textContent = old;
    }
  };

  window.updatePortalNav = function () {
    var s = getSession();
    var btn = document.getElementById('portalNavBtn');
    var btnM = document.getElementById('portalNavBtnMobile');
    if (!btn) return;
    if (s && s.user) {
      btn.textContent = '👤 ' + (s.user.name.split(' ')[0] || 'Кабинет');
      btn.title = 'Личный кабинет — ' + s.user.name;
      if (btnM) btnM.textContent = '👤 ' + (s.user.name.split(' ')[0] || 'Кабинет');
    } else {
      btn.textContent = 'Личный кабинет';
      btn.title = 'Вход / регистрация';
      if (btnM) btnM.textContent = 'Личный кабинет';
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    updatePortalNav();
  });
})();
