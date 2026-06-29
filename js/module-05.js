// NexoraWeb — order modal i18n

(function(){
  const extra = {
    ru:{order_kicker:'Новая заявка',order_subtitle:'Ответим по почте и подскажем лучший формат сайта.',choice_landing:'Landing',choice_landing_sub:'для одной услуги',choice_business_sub:'компания / услуги',choice_shop_sub:'товары / каталог',choice_consult_sub:'подобрать решение',form_name_label:'Имя',form_contact_label:'Контакт',form_message_label:'Коротко о проекте',order_note:'Заявка придёт на почту менеджера.',form_submit:'Отправить заявку',modal_order_title:'Оставить заявку',nav_cta:'Оставить заявку',contact_text:'Заявка отправляется на почту. Мы свяжемся с вами и подскажем лучший формат.',contact_email_note:'📧 Заявка сразу приходит на почту — ответим в течение рабочего дня',form_contact:'Email / WhatsApp / телефон'},
    uk:{order_kicker:'Нова заявка',order_subtitle:'Відповімо на пошту і підкажемо найкращий формат сайту.',choice_landing:'Landing',choice_landing_sub:'для однієї послуги',choice_business:'Бізнес сайт',choice_business_sub:'компанія / послуги',choice_shop:'Магазин',choice_shop_sub:'товари / каталог',choice_consult:'Консультація',choice_consult_sub:'підібрати рішення',form_name_label:'Ім’я',form_contact_label:'Контакт',form_message_label:'Коротко про проєкт',order_note:'Заявка надійде на пошту менеджера.',form_submit:'Надіслати заявку',modal_order_title:'Залишити заявку',nav_cta:'Залишити заявку',contact_text:'Заявка надсилається на пошту. Ми зв’яжемося з вами і підкажемо найкращий формат.',contact_email_note:'📧 Заявка одразу надходить на пошту — відповімо протягом робочого дня',form_contact:'Email / WhatsApp / телефон'},
    en:{order_kicker:'New request',order_subtitle:'We will reply by email and suggest the best website format.',choice_landing:'Landing',choice_landing_sub:'for one service',choice_business:'Business website',choice_business_sub:'company / services',choice_shop:'Online store',choice_shop_sub:'products / catalog',choice_consult:'Consultation',choice_consult_sub:'choose a solution',form_name_label:'Name',form_contact_label:'Contact',form_message_label:'Project summary',order_note:'The request goes to the manager by email.',form_submit:'Send request',modal_order_title:'Leave a request',nav_cta:'Leave a request',contact_text:'Your request is sent by email. We will contact you and suggest the best format.',contact_email_note:'📧 Your request arrives by email — we reply within one business day',form_contact:'Email / WhatsApp / phone'},
    sk:{order_kicker:'Nový dopyt',order_subtitle:'Odpovieme emailom a odporučíme najlepší formát webu.',choice_landing:'Landing',choice_landing_sub:'pre jednu službu',choice_business:'Firemný web',choice_business_sub:'firma / služby',choice_shop:'E-shop',choice_shop_sub:'produkty / katalóg',choice_consult:'Konzultácia',choice_consult_sub:'vybrať riešenie',form_name_label:'Meno',form_contact_label:'Kontakt',form_message_label:'Stručne o projekte',order_note:'Dopyt príde manažérovi na email.',form_submit:'Odoslať dopyt',modal_order_title:'Poslať dopyt',nav_cta:'Poslať dopyt',contact_text:'Dopyt sa odošle emailom. Kontaktujeme vás a odporučíme najlepší formát.',contact_email_note:'📧 Dopyt príde emailom — odpovieme do jedného pracovného dňa',form_contact:'Email / WhatsApp / telefón'}
  };
  const _setLang = window.setLang;
  window.setLang = function(l){
    if (typeof tr !== 'undefined') Object.assign(tr[l] || tr.ru, extra[l] || extra.ru);
    if (_setLang) _setLang(l);
  };
  document.addEventListener('DOMContentLoaded', () => {
    const l = localStorage.getItem('nexora_lang') || 'ru';
    if (typeof tr !== 'undefined') Object.assign(tr[l] || tr.ru, extra[l] || extra.ru);
  });
})();
