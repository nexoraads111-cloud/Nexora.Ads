// NexoraWeb script extracted from index.html

(function(){
  const extraTr={
    ru:{order_kicker:'Новая заявка',order_subtitle:'Ответим в Telegram и подскажем лучший формат сайта.',choice_landing:'Landing',choice_landing_sub:'для одной услуги',choice_business_sub:'компания / услуги',choice_shop_sub:'товары / каталог',choice_consult_sub:'подобрать решение',form_name_label:'Имя',form_contact_label:'Контакт',form_message_label:'Коротко о проекте',order_note:'Заявка уйдёт менеджеру в Telegram. Функционал отправки сохранён.',form_submit:'Отправить менеджеру',modal_order_title:'Оставить заявку',nav_cta:'Оставить заявку'},
    uk:{order_kicker:'Нова заявка',order_subtitle:'Відповімо в Telegram і підкажемо найкращий формат сайту.',choice_landing:'Landing',choice_landing_sub:'для однієї послуги',choice_business:'Бізнес сайт',choice_business_sub:'компанія / послуги',choice_shop:'Магазин',choice_shop_sub:'товари / каталог',choice_consult:'Консультація',choice_consult_sub:'підібрати рішення',form_name_label:'Ім’я',form_contact_label:'Контакт',form_message_label:'Коротко про проєкт',order_note:'Заявка піде менеджеру в Telegram. Функціонал відправки збережено.',form_submit:'Надіслати менеджеру',modal_order_title:'Залишити заявку',nav_cta:'Залишити заявку'},
    en:{order_kicker:'New request',order_subtitle:'We will reply in Telegram and suggest the best website format.',choice_landing:'Landing',choice_landing_sub:'for one service',choice_business:'Business website',choice_business_sub:'company / services',choice_shop:'Online store',choice_shop_sub:'products / catalog',choice_consult:'Consultation',choice_consult_sub:'choose a solution',form_name_label:'Name',form_contact_label:'Contact',form_message_label:'Project summary',order_note:'The request goes to the manager in Telegram. Sending functionality is preserved.',form_submit:'Send to manager',modal_order_title:'Leave a request',nav_cta:'Leave a request'},
    sk:{order_kicker:'Nový dopyt',order_subtitle:'Odpovieme v Telegrame a odporučíme najlepší formát webu.',choice_landing:'Landing',choice_landing_sub:'pre jednu službu',choice_business:'Firemný web',choice_business_sub:'firma / služby',choice_shop:'E-shop',choice_shop_sub:'produkty / katalóg',choice_consult:'Konzultácia',choice_consult_sub:'vybrať riešenie',form_name_label:'Meno',form_contact_label:'Kontakt',form_message_label:'Stručne o projekte',order_note:'Dopyt pôjde manažérovi do Telegramu. Funkcia odosielania ostáva zachovaná.',form_submit:'Odoslať manažérovi',modal_order_title:'Poslať dopyt',nav_cta:'Poslať dopyt'}
  };
  const phraseMap={
    uk:{'Главная':'Головна','Услуги':'Послуги','Кейсы':'Кейси','О нас':'Про нас','Контакты':'Контакти','Отзывы':'Відгуки','Цены':'Ціни','Команда':'Команда','Проекты':'Проєкти','Оставить заявку':'Залишити заявку','Обсудить проект':'Обговорити проєкт','Смотреть кейсы':'Дивитись кейси','Поддержать':'Підтримати'},
    en:{'Главная':'Home','Услуги':'Services','Кейсы':'Cases','О нас':'About','Контакты':'Contacts','Отзывы':'Reviews','Цены':'Prices','Команда':'Team','Проекты':'Projects','Оставить заявку':'Leave a request','Обсудить проект':'Discuss project','Смотреть кейсы':'View cases','Поддержать':'Support'},
    sk:{'Главная':'Domov','Услуги':'Služby','Кейсы':'Práce','О нас':'O nás','Контакты':'Kontakty','Отзывы':'Recenzie','Цены':'Ceny','Команда':'Tím','Проекты':'Projekty','Оставить заявку':'Poslať dopyt','Обсудить проект':'Prediskutovať projekt','Смотреть кейсы':'Pozrieť práce','Поддержать':'Podporiť'}
  };
  function applyExtraLang(l){
    const dict=extraTr[l]||extraTr.ru;
    document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(dict[k]) el.innerHTML=dict[k];});
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{const k=el.dataset.i18nPlaceholder;if(dict[k]) el.placeholder=dict[k];});
    document.querySelectorAll('[data-donate-i18n]').forEach(el=>{ if(window.donateTr && donateTr[l] && donateTr[l][el.dataset.donateI18n]) el.innerHTML=donateTr[l][el.dataset.donateI18n]; });
    const map=phraseMap[l];
    if(map){document.querySelectorAll('a,button,b,span,h1,h2,h3,p,small').forEach(el=>{ if(el.children.length) return; const t=el.textContent.trim(); if(map[t]) el.textContent=map[t]; });}
    document.documentElement.lang=l;
  }
  const oldSetLang=window.setLang;
  window.setLang=function(l){ if(typeof oldSetLang==='function') oldSetLang(l); applyExtraLang(l); localStorage.setItem('nexora_lang',l); };
  const oldChoose=window.chooseSiteType;
  window.chooseSiteType=function(t,el){
    const input=document.getElementById('modal-type'); if(input) input.value=t;
    document.querySelectorAll('#orderModal .choice,#orderModal .nx-service-choice').forEach(x=>x.classList.remove('active'));
    if(el) el.classList.add('active');
  };
  function lock(lock){document.body.classList.toggle('no-scroll',!!lock)}
  const oo=window.openOrderModal, co=window.closeOrderModal, od=window.openDonateModal, cd=window.closeDonateModal, orv=window.openReviewModal, crv=window.closeReviewModal;
  window.openOrderModal=function(){document.getElementById('orderModal')?.classList.add('active');lock(true)};
  window.closeOrderModal=function(){document.getElementById('orderModal')?.classList.remove('active');lock(false)};
  window.openDonateModal=function(){document.getElementById('donateModal')?.classList.add('active');lock(true)};
  window.closeDonateModal=function(){document.getElementById('donateModal')?.classList.remove('active');lock(false)};
  window.openReviewModal=function(){document.getElementById('reviewModal')?.classList.add('active');lock(true); if(window.setRating) setRating(5)};
  window.closeReviewModal=function(){document.getElementById('reviewModal')?.classList.remove('active');lock(false); document.getElementById('review-form')?.reset(); if(window.setRating) setRating(5)};
  document.addEventListener('click',e=>{ if(e.target.classList && e.target.classList.contains('modal')){ e.target.classList.remove('active'); lock(false); } });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'){document.querySelectorAll('.modal.active').forEach(m=>m.classList.remove('active'));lock(false);} });
  window.addEventListener('DOMContentLoaded',()=>{ const l=localStorage.getItem('nexora_lang')||'ru'; setTimeout(()=>window.setLang(l),50); document.body.classList.add('nx-page-ready'); });
})();
