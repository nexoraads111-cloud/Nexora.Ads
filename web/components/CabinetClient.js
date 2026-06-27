'use client';

import Script from 'next/script';

export default function CabinetClient() {
  return (
    <>
      <div className="cabinet-page">
        <div className="cabinet-wrap">
          <a className="cabinet-toplink" href="/">
            ← На главную
          </a>
          <div className="cabinet-head">
            <h1>Личный кабинет</h1>
            <p>История заказов, статусы и повтор заявки в один клик</p>
          </div>

          <div id="cabinet-login" className="cabinet-card cabinet-login">
            <h2>Вход через Telegram</h2>
            <p>
              Нажмите кнопку → откроется бот <b>@Nexora_loginbot</b> → нажмите <b>Start</b> → вернитесь сюда,
              кабинет откроется сам.
            </p>
            <p id="api-status" style={{ fontSize: '13px', color: '#64748b' }}>
              Проверка сервера...
            </p>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
              ⚠️ Укажите в заявке свой @telegram и нажмите Start в боте — тогда статусы придут сюда и в Telegram.
            </p>
            <button type="button" id="btn-telegram-login" className="cabinet-tg-btn">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
              Войти через Telegram
            </button>
            <p id="login-wait" className="cabinet-wait" style={{ display: 'none' }}>
              ⏳ Ждём подтверждения в Telegram... Вернитесь на эту вкладку после Start.
            </p>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '8px' }}>Или откройте бота напрямую:</p>
            <a href="#" id="telegram-direct-link" className="cabinet-tg-link">
              @Nexora_loginbot → Start
            </a>
          </div>

          <div id="cabinet-app" style={{ display: 'none' }}>
            <div className="cabinet-userbar">
              <div>
                👋 <span id="cabinet-user-name">Клиент</span>
              </div>
              <button className="cabinet-logout" id="cabinet-logout" type="button">
                Выйти
              </button>
            </div>
            <div className="cabinet-grid">
              <div className="cabinet-card cabinet-profile">
                <h2>Мои данные</h2>
                <form id="profile-form">
                  <label>
                    Имя
                    <input id="profile-name" name="name" required />
                  </label>
                  <label>
                    Телефон / Telegram
                    <input id="profile-phone" name="phone" placeholder="+380... или @username" />
                  </label>
                  <button type="submit">Сохранить</button>
                </form>
              </div>
              <div className="cabinet-card">
                <h2>Мои заказы</h2>
                <div id="orders-list" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="toast" id="toast" />
      <Script src="/js/nexora-config.js?v=7" strategy="afterInteractive" />
      <Script src="/js/cabinet.js?v=7" strategy="afterInteractive" />
    </>
  );
}
