// Показати кнопку кабінету тільки після входу адміна
(function () {
  function showAdminBtn() {
    const ok = sessionStorage.getItem('nexora_admin') === '1' && !!sessionStorage.getItem('nexora_admin_secret');
    ['adminNavBtn', 'adminNavBtnMobile'].forEach((id) => {
      const btn = document.getElementById(id);
      if (btn) btn.style.display = ok ? 'inline-flex' : 'none';
    });
  }
  document.addEventListener('DOMContentLoaded', showAdminBtn);
  window.addEventListener('focus', showAdminBtn);
})();
