// Unified i18n — all languages in one place
(function () {
  if (typeof tr === 'undefined') return;

  const extra = {
    ru: {
      p3_text: 'Сайт строительной компании DiurdStav в Братиславе — услуги, доверие и заявки.',
      map_badge: 'Где нас найти',
      map_title: 'Братислава и онлайн по всей Европе',
      map_text: 'Студия в Братиславе. Работаем с клиентами из Словакии, Украины и ЕС.',
      map_address: 'Bratislava, Slovakia',
      map_cta: 'Открыть в Google Maps',
      nav_location: 'Локация',
      review_subtitle: 'Быстрая форма — 30 секунд',
      review_quick_hint: 'Нажмите на звёзды и выберите тип',
      review_cancel: 'Отмена',
      chat_status: 'онлайн • отвечает сразу',
      chip_portfolio: '🏗 Стройка',
      chip_store: '🛒 Магазин',
      chip_contact: '📧 Контакт',
    },
    uk: {
      p3_text: 'Сайт будівельної компанії DiurdStav у Братиславі — послуги, довіра та заявки.',
      map_badge: 'Де нас знайти',
      map_title: 'Братислава та онлайн по всій Європі',
      map_text: 'Студія в Братиславі. Працюємо з клієнтами зі Словаччини, України та ЄС.',
      map_address: 'Bratislava, Slovakia',
      map_cta: 'Відкрити в Google Maps',
      nav_location: 'Локація',
      review_subtitle: 'Швидка форма — 30 секунд',
      review_quick_hint: 'Натисніть зірки та оберіть тип',
      review_cancel: 'Скасувати',
      chat_status: 'онлайн • відповідає одразу',
      chip_portfolio: '🏗 Будівництво',
      chip_store: '🛒 Магазин',
      chip_contact: '📧 Контакт',
    },
    en: {
      p3_text: 'DiurdStav construction company website in Bratislava — services, trust and leads.',
      map_badge: 'Where to find us',
      map_title: 'Bratislava and online across Europe',
      map_text: 'Studio in Bratislava. We work with clients from Slovakia, Ukraine and the EU.',
      map_address: 'Bratislava, Slovakia',
      map_cta: 'Open in Google Maps',
      nav_location: 'Location',
      review_subtitle: 'Quick form — 30 seconds',
      review_quick_hint: 'Tap stars and choose a type',
      review_cancel: 'Cancel',
      chat_status: 'online • replies instantly',
      chip_portfolio: '🏗 Construction',
      chip_store: '🛒 Store',
      chip_contact: '📧 Contact',
    },
    sk: {
      p3_text: 'Web stavebnej firmy DiurdStav v Bratislave — služby, dôvera a dopyty.',
      map_badge: 'Kde nás nájdete',
      map_title: 'Bratislava a online po celej Európe',
      map_text: 'Štúdio v Bratislave. Pracujeme s klientmi zo Slovenska, Ukrajiny a EÚ.',
      map_address: 'Bratislava, Slovensko',
      map_cta: 'Otvoriť v Google Maps',
      nav_location: 'Poloha',
      review_subtitle: 'Rýchly formulár — 30 sekúnd',
      review_quick_hint: 'Kliknite na hviezdy a vyberte typ',
      review_cancel: 'Zrušiť',
      chat_status: 'online • odpovedá hneď',
      chip_portfolio: '🏗 Stavebníctvo',
      chip_store: '🛒 E-shop',
      chip_contact: '📧 Kontakt',
    },
  };

  const langLabels = { ru: 'RU', uk: 'UA', en: 'EN', sk: 'SK' };

  function mergeExtra(l) {
    Object.assign(tr[l] || tr.ru, extra[l] || extra.ru);
  }

  function updateLangBadge(l) {
    const el = document.getElementById('langCurrent');
    if (el) el.textContent = langLabels[l] || 'RU';
  }

  function translateSelects(dict) {
    const sel = document.getElementById('order-type');
    if (!sel) return;
    const opts = {
      ru: ['Landing Page', 'Сайт для бизнеса', 'Интернет-магазин', 'Нужна консультация'],
      uk: ['Landing Page', 'Сайт для бізнесу', 'Інтернет-магазин', 'Потрібна консультація'],
      en: ['Landing Page', 'Business website', 'Online store', 'Need consultation'],
      sk: ['Landing Page', 'Firemný web', 'E-shop', 'Potrebujem konzultáciu'],
    };
    const l = localStorage.getItem('nexora_lang') || 'ru';
    const list = opts[l] || opts.ru;
    const cur = sel.value;
    sel.innerHTML = list.map((o) => `<option>${o}</option>`).join('');
    if (list.includes(cur)) sel.value = cur;
  }

  const prev = window.setLang;
  window.setLang = function (l) {
    mergeExtra(l);
    if (typeof prev === 'function') prev(l);
    mergeExtra(l);
    updateLangBadge(l);
    translateSelects();
    document.querySelectorAll('.lang-menu button').forEach((b) => {
      b.classList.toggle('active', b.getAttribute('onclick')?.includes("'" + l + "'"));
    });
  };

  ['ru', 'uk', 'en', 'sk'].forEach(mergeExtra);
  document.addEventListener('DOMContentLoaded', () => {
    const l = localStorage.getItem('nexora_lang') || 'ru';
    mergeExtra(l);
    updateLangBadge(l);
    translateSelects();
  });
})();
