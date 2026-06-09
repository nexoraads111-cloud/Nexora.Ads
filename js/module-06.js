// NexoraWeb script extracted from index.html

(function(){
  const nxHeroTr={
    ru:{
      nx_pill:'<i class="fa-solid fa-bolt"></i> ВЕБ-РАЗРАБОТКА',
      nx_title:'Создаём сайты,<br>которые приносят <span>результат</span>',
      nx_lead:'Разрабатываем современные веб‑сайты и веб‑сервисы, которые помогают бизнесу расти, выглядеть дороже и получать заявки.',
      nx_cta:'Обсудить проект <i class="fa-solid fa-arrow-right"></i>', nx_cases:'Смотреть кейсы <i class="fa-solid fa-play"></i>',
      nx_feat1_title:'Быстрый старт', nx_feat1_text:'запускаем проекты в короткие сроки',
      nx_feat2_title:'Фокус на бизнес', nx_feat2_text:'структура, которая ведёт к заявке',
      nx_feat3_title:'Надёжность', nx_feat3_text:'безопасный код и поддержка',
      nx_feat4_title:'Рост и масштаб', nx_feat4_text:'сайты, которые растут вместе с вами',
      nx_phone_brand:'NexoraWeb', nx_phone_pill:'Агентство цифровых решений',
      nx_phone_title:'Делаем ваш бизнес <em>сильнее</em><br>в цифровом мире',
      nx_phone_text:'Комплексный подход к разработке сайтов и веб‑сервисов с фокусом на результат.',
      nx_phone_cta:'Обсудить проект <i class="fa-solid fa-arrow-right"></i>',
      nx_phone_s1:'Веб‑разработка', nx_phone_s2:'Интернет‑магазины', nx_phone_s3:'Веб‑приложения', nx_phone_s4:'Дизайн и брендинг',
      nx_stat1:'проектов выполнено', nx_stat2:'довольных клиентов', nx_stat3:'недели средний срок', nx_stat4:'поддержка и сопровождение'
    },
    uk:{
      nx_pill:'<i class="fa-solid fa-bolt"></i> ВЕБ-РОЗРОБКА',
      nx_title:'Створюємо сайти,<br>які приносять <span>результат</span>',
      nx_lead:'Розробляємо сучасні веб‑сайти та веб‑сервіси, які допомагають бізнесу рости, виглядати дорожче й отримувати заявки.',
      nx_cta:'Обговорити проєкт <i class="fa-solid fa-arrow-right"></i>', nx_cases:'Дивитись кейси <i class="fa-solid fa-play"></i>',
      nx_feat1_title:'Швидкий старт', nx_feat1_text:'запускаємо проєкти у короткі строки',
      nx_feat2_title:'Фокус на бізнес', nx_feat2_text:'структура, яка веде до заявки',
      nx_feat3_title:'Надійність', nx_feat3_text:'безпечний код і підтримка',
      nx_feat4_title:'Ріст і масштаб', nx_feat4_text:'сайти, які ростуть разом із вами',
      nx_phone_brand:'NexoraWeb', nx_phone_pill:'Агентство цифрових рішень',
      nx_phone_title:'Робимо ваш бізнес <em>сильнішим</em><br>у цифровому світі',
      nx_phone_text:'Комплексний підхід до розробки сайтів і веб‑сервісів з фокусом на результат.',
      nx_phone_cta:'Обговорити проєкт <i class="fa-solid fa-arrow-right"></i>',
      nx_phone_s1:'Веб‑розробка', nx_phone_s2:'Інтернет‑магазини', nx_phone_s3:'Веб‑додатки', nx_phone_s4:'Дизайн і брендинг',
      nx_stat1:'проєктів виконано', nx_stat2:'задоволених клієнтів', nx_stat3:'тижні середній строк', nx_stat4:'підтримка і супровід'
    },
    en:{
      nx_pill:'<i class="fa-solid fa-bolt"></i> WEB DEVELOPMENT',
      nx_title:'We create websites<br>that deliver <span>results</span>',
      nx_lead:'We build modern websites and web services that help businesses grow, look more premium, and receive requests.',
      nx_cta:'Discuss project <i class="fa-solid fa-arrow-right"></i>', nx_cases:'View cases <i class="fa-solid fa-play"></i>',
      nx_feat1_title:'Fast start', nx_feat1_text:'we launch projects in short timelines',
      nx_feat2_title:'Business focus', nx_feat2_text:'a structure that leads to a request',
      nx_feat3_title:'Reliability', nx_feat3_text:'secure code and support',
      nx_feat4_title:'Growth & scale', nx_feat4_text:'websites that grow with you',
      nx_phone_brand:'NexoraWeb', nx_phone_pill:'Digital solutions agency',
      nx_phone_title:'We make your business <em>stronger</em><br>in the digital world',
      nx_phone_text:'A complete approach to website and web-service development focused on results.',
      nx_phone_cta:'Discuss project <i class="fa-solid fa-arrow-right"></i>',
      nx_phone_s1:'Web development', nx_phone_s2:'Online stores', nx_phone_s3:'Web apps', nx_phone_s4:'Design & branding',
      nx_stat1:'projects completed', nx_stat2:'happy clients', nx_stat3:'weeks average timeline', nx_stat4:'support and maintenance'
    },
    sk:{
      nx_pill:'<i class="fa-solid fa-bolt"></i> TVORBA WEBOV',
      nx_title:'Tvoríme weby,<br>ktoré prinášajú <span>výsledky</span>',
      nx_lead:'Vyvíjame moderné weby a webové služby, ktoré pomáhajú biznisu rásť, pôsobiť prémiovo a získavať dopyty.',
      nx_cta:'Prediskutovať projekt <i class="fa-solid fa-arrow-right"></i>', nx_cases:'Pozrieť práce <i class="fa-solid fa-play"></i>',
      nx_feat1_title:'Rýchly štart', nx_feat1_text:'projekty spúšťame v krátkom čase',
      nx_feat2_title:'Fokus na biznis', nx_feat2_text:'štruktúra, ktorá vedie k dopytu',
      nx_feat3_title:'Spoľahlivosť', nx_feat3_text:'bezpečný kód a podpora',
      nx_feat4_title:'Rast a škálovanie', nx_feat4_text:'weby, ktoré rastú spolu s vami',
      nx_phone_brand:'NexoraWeb', nx_phone_pill:'Agentúra digitálnych riešení',
      nx_phone_title:'Robíme váš biznis <em>silnejším</em><br>v digitálnom svete',
      nx_phone_text:'Komplexný prístup k tvorbe webov a webových služieb so zameraním na výsledok.',
      nx_phone_cta:'Prediskutovať projekt <i class="fa-solid fa-arrow-right"></i>',
      nx_phone_s1:'Tvorba webov', nx_phone_s2:'E‑shopy', nx_phone_s3:'Webové aplikácie', nx_phone_s4:'Dizajn a branding',
      nx_stat1:'dokončených projektov', nx_stat2:'spokojných klientov', nx_stat3:'týždne priemerný termín', nx_stat4:'podpora a správa'
    }
  };
  function applyNxHeroLang(l){
    const d=nxHeroTr[l]||nxHeroTr.ru;
    document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.dataset.i18n;if(d[k]) el.innerHTML=d[k];});
  }
  const previousSetLang=window.setLang;
  window.setLang=function(l){ if(typeof previousSetLang==='function') previousSetLang(l); applyNxHeroLang(l); localStorage.setItem('nexora_lang',l); };
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>applyNxHeroLang(localStorage.getItem('nexora_lang')||'ru'),90));
})();
