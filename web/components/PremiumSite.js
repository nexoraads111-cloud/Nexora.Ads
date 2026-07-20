'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const services = [
  { icon: 'fa-rocket', title: 'Landing Page', text: 'Продаюча сторінка для однієї послуги чи запуску реклами.' },
  { icon: 'fa-briefcase', title: 'Бізнес-сайт', text: 'Сайт компанії з послугами, перевагами та заявками.' },
  { icon: 'fa-building', title: 'Корпоративний сайт', text: 'Повноцінна структура для бренду та довіри клієнтів.' },
  { icon: 'fa-cart-shopping', title: 'Інтернет-магазин', text: 'Каталог, картки товарів і зручне оформлення замовлень.' },
  { icon: 'fa-wand-magic-sparkles', title: 'Редизайн сайтів', text: 'Оновлення вигляду та UX без втрати вашого стилю.' },
  { icon: 'fa-magnifying-glass-chart', title: 'SEO-оптимізація', text: 'Базове SEO, щоб сайт було легше знаходити в Google.' },
  { icon: 'fa-headset', title: 'Підтримка та оновлення', text: 'Супровід після запуску: правки, швидкість, розвиток.' },
];

const projects = [
  {
    name: 'Stroplook.sk',
    tag: 'Корпоративний сайт',
    text: 'Сайт будівельної компанії з фокусом на довіру та заявки.',
    href: 'https://stroplook.sk',
    img: '/Public/Image/Stroplooksk.png',
  },
  {
    name: 'Ukstav.sk',
    tag: 'Корпоративний сайт',
    text: 'Послуги у будівельній сфері — зручно на телефоні.',
    href: 'https://ukstav.sk',
    img: '/Public/Image/Ukstav.png',
  },
  {
    name: 'DiurdStav.sk',
    tag: 'Корпоративний сайт',
    text: 'Сайт будівельної компанії в Братиславі — послуги та заявки.',
    href: 'https://diurdstav.sk',
    img: '/Public/Image/DiurdStav.png',
  },
];

const stats = [
  { value: 3, suffix: '+', label: 'Успішно виконані проєкти' },
  { value: 100, suffix: '%', label: 'Адаптивність' },
  { value: 99, suffix: '+', label: 'Google PageSpeed' },
  { value: 24, suffix: '/7', label: 'Підтримка клієнтів' },
];

const steps = [
  { t: 'Обговорення проєкту', d: 'Уточнюємо цілі, нішу та очікуваний результат.' },
  { t: 'Аналіз вимог', d: 'Збираємо структуру, референси та ключові блоки.' },
  { t: 'Дизайн', d: 'Створюю сучасний візуал і зручну мобільну версію.' },
  { t: 'Розробка', d: 'Верстка, форми, швидкість і чистий код.' },
  { t: 'Тестування', d: 'Перевірка на телефонах, планшетах і десктопі.' },
  { t: 'Запуск', d: 'Підключення домену та фінальна перевірка.' },
  { t: 'Підтримка', d: 'Правки та супровід після релізу.' },
];

const techs = [
  ['fa-brands fa-html5', 'HTML5'],
  ['fa-brands fa-css3-alt', 'CSS3'],
  ['fa-brands fa-js', 'JavaScript'],
  ['fa-brands fa-react', 'React'],
  ['fa-solid fa-n', 'Next.js'],
  ['fa-solid fa-wind', 'Tailwind CSS'],
  ['fa-solid fa-code', 'TypeScript'],
  ['fa-solid fa-film', 'Framer Motion'],
  ['fa-solid fa-bolt', 'GSAP'],
  ['fa-brands fa-figma', 'Figma'],
];

const faqs = [
  { q: 'Скільки коштує сайт?', a: 'Landing — від 150€, бізнес-сайт — від 300€, інтернет-магазин — від 600€. Точну суму скажу після короткого брифу.' },
  { q: 'Які терміни розробки?', a: 'Лендинг — 2–5 днів, бізнес-сайт — 5–10 днів, магазин — 10–20 днів залежно від обсягу.' },
  { q: 'Чи буде сайт адаптивним?', a: 'Так. Усі сайти коректно працюють на телефоні, планшеті та комп’ютері.' },
  { q: 'Чи можна внести зміни після запуску?', a: 'Так. 30 днів безкоштовних технічних правок після запуску.' },
  { q: 'Чи допомагаєте із хостингом?', a: 'Так. Підкажу варіанти хостингу/домену та допоможу з базовим підключенням.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } },
};

function Reveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedNumber({ value, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const dur = 1400;
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 0.5 - Math.cos(Math.PI * p) / 2;
      setN(Math.floor(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setN(value);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <strong ref={ref}>
      {n}
      {suffix}
    </strong>
  );
}

export default function PremiumSite() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaderHide, setLoaderHide] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const cursorRef = useRef(null);
  const rootRef = useRef(null);

  useEffect(() => {
    document.body.classList.add('nx-premium');
    document.body.classList.remove('nx-v15', 'nx-v14');
    const t = setTimeout(() => setLoaderHide(true), 1600);
    return () => {
      clearTimeout(t);
      document.body.classList.remove('nx-premium');
    };
  }, []);

  useEffect(() => {
    const c = cursorRef.current;
    if (!c) return;
    const move = (e) => {
      gsap.to(c, { x: e.clientX, y: e.clientY, duration: 0.18, ease: 'power3.out' });
    };
    const over = (e) => {
      if (e.target.closest('a, button, .nx-glass, .nx-project, summary')) c.classList.add('big');
    };
    const out = (e) => {
      if (e.target.closest('a, button, .nx-glass, .nx-project, summary')) c.classList.remove('big');
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseover', over);
    window.addEventListener('mouseout', out);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      window.removeEventListener('mouseout', out);
    };
  }, []);

  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.nx-parallax').forEach((el) => {
        gsap.to(el, {
          y: -40,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  const openOrder = () => {
    if (typeof window.openOrderModal === 'function') window.openOrderModal();
  };
  const openReview = () => {
    if (typeof window.openReviewModal === 'function') window.openReviewModal();
  };
  const scrollReviews = (d) => {
    if (typeof window.scrollReviews === 'function') window.scrollReviews(d);
  };

  const onContactSubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('order-name')?.value?.trim() || '';
    const phone = document.getElementById('order-phone')?.value?.trim() || '';
    const email = document.getElementById('order-email')?.value?.trim() || '';
    const message = document.getElementById('order-message')?.value?.trim() || '';
    const contact = [phone, email].filter(Boolean).join(' | ');
    const typeEl = document.getElementById('order-type');
    if (typeEl) typeEl.value = 'Консультація';
    const fakeContact = document.getElementById('order-contact');
    if (fakeContact) fakeContact.value = contact;
    if (typeof window.sendApplication === 'function') {
      window.sendApplication(
        { name, contact, company: 'Консультація', plan: 'Консультація', message },
        e.target.querySelector('button[type="submit"]')
      );
      e.target.reset();
    } else if (typeof window.submitOrder === 'function') {
      window.submitOrder(e);
    }
  };

  return (
    <div ref={rootRef}>
      <div className={`nx-loader ${loaderHide ? 'hide' : ''}`} aria-hidden={loaderHide}>
        <div className="nx-loader-inner">
          <div className="nx-loader-brand">
            Nexora <span>Studio</span>
          </div>
          <div className="nx-loader-bar">
            <i />
          </div>
        </div>
      </div>

      <div className="nx-cursor" ref={cursorRef} />
      <div className="nx-ambient" aria-hidden>
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
        <div className="grid" />
      </div>

      <div
        className={`nx-overlay ${menuOpen ? 'active' : ''}`}
        onClick={() => setMenuOpen(false)}
      />
      <aside className={`nx-drawer ${menuOpen ? 'active' : ''}`} id="mobileMenu">
        <div className="nx-drawer-head">
          <a className="nx-logo" href="#top" onClick={() => setMenuOpen(false)}>
            Nexora<span>.</span>
          </a>
          <button className="nx-drawer-close" type="button" onClick={() => setMenuOpen(false)}>
            ×
          </button>
        </div>
        <a href="#top" onClick={() => setMenuOpen(false)}>Головна</a>
        <a href="#about" onClick={() => setMenuOpen(false)}>Про мене</a>
        <a href="#services" onClick={() => setMenuOpen(false)}>Послуги</a>
        <a href="#projects" onClick={() => setMenuOpen(false)}>Проєкти</a>
        <a href="#reviews" onClick={() => setMenuOpen(false)}>Відгуки</a>
        <a href="#faq" onClick={() => setMenuOpen(false)}>FAQ</a>
        <a href="#contact" onClick={() => setMenuOpen(false)}>Контакти</a>
        <button className="nx-btn nx-btn-primary nx-btn-block" style={{ marginTop: 24 }} type="button" onClick={() => { setMenuOpen(false); openOrder(); }}>
          Замовити сайт
        </button>
      </aside>

      <header className="nx-header">
        <div className="nx-container nx-nav">
          <a className="nx-logo" href="#top">
            Nexora<span>Studio</span>
          </a>
          <nav className="nx-links" aria-label="Навігація">
            <a href="#about">Про мене</a>
            <a href="#services">Послуги</a>
            <a href="#projects">Проєкти</a>
            <a href="#process">Етапи</a>
            <a href="#reviews">Відгуки</a>
            <a href="#contact">Контакти</a>
          </nav>
          <div className="nx-nav-actions">
            <button className="nx-btn nx-btn-primary" type="button" onClick={openOrder}>
              Замовити сайт
            </button>
            <button className="nx-burger" type="button" aria-label="Меню" onClick={() => setMenuOpen(true)}>
              ☰
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="nx-hero">
          <div className="nx-container nx-hero-grid">
            <div>
              <Reveal>
                <p className="nx-kicker">Веброзробник • Nexora Studio</p>
              </Reveal>
              <Reveal delay={0.08}>
                <h1>
                  Створюю сучасні сайти для бізнесу, які допомагають <em>залучати нових клієнтів</em>.
                </h1>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="nx-lead">
                  Розробка стильних, швидких та адаптивних сайтів під ключ. Від лендингів до корпоративних сайтів.
                </p>
              </Reveal>
              <Reveal delay={0.24}>
                <div className="nx-hero-actions">
                  <button className="nx-btn nx-btn-primary" type="button" onClick={openOrder}>
                    Замовити сайт <i className="fa-solid fa-arrow-right" />
                  </button>
                  <a className="nx-btn nx-btn-ghost" href="#projects">
                    Переглянути портфоліо
                  </a>
                </div>
              </Reveal>
            </div>
            <div className="nx-hero-visual nx-parallax">
              <div className="nx-hero-glow" />
              <div className="nx-float-card nx-float-a">
                <i className="fa-solid fa-gauge-high" /> PageSpeed 99+
              </div>
              <div className="nx-float-card nx-float-b">
                <i className="fa-solid fa-shield-halved" /> Під ключ
              </div>
              <motion.div
                className="nx-laptop"
                initial={{ opacity: 0, y: 40, rotateY: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                <div className="nx-laptop-lid">
                  <div className="nx-laptop-screen">
                    <img src="/Public/Image/DiurdStav.png" alt="Приклад сайту" />
                  </div>
                </div>
                <div className="nx-laptop-base" />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section className="nx-section" id="about">
          <div className="nx-container nx-about">
            <Reveal>
              <div className="nx-head">
                <p className="nx-kicker">Про мене</p>
                <h2 className="nx-title">
                  Не просто дизайн — <em>сайт, який продає</em>
                </h2>
              </div>
              <div className="nx-glass nx-about-panel">
                <p>
                  Привіт! Я займаюся створенням сучасних сайтів для бізнесу. Моє головне завдання — зробити не просто
                  красивий дизайн, а сайт, який буде продавати послуги та викликати довіру у клієнтів.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="nx-glass" style={{ overflow: 'hidden', padding: 0 }}>
                <img
                  src="/Public/Image/Ukstav.png"
                  alt="Роботи Nexora Studio"
                  style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', objectPosition: 'top' }}
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* SERVICES */}
        <section className="nx-section" id="services">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">Послуги</p>
                <h2 className="nx-title">
                  Мої <em>послуги</em>
                </h2>
                <p className="nx-lead">Повний цикл: від ідеї та дизайну до запуску і підтримки.</p>
              </div>
            </Reveal>
            <div className="nx-services">
              {services.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.05}>
                  <article className="nx-glass nx-service">
                    <div className="nx-service-icon">
                      <i className={`fa-solid ${s.icon}`} />
                    </div>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section className="nx-section" id="projects">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head">
                <p className="nx-kicker">Портфоліо</p>
                <h2 className="nx-title">
                  Уже виконано <em>3 успішні проєкти</em>
                </h2>
                <p className="nx-lead">Живі сайти, які можна відкрити та перевірити.</p>
              </div>
            </Reveal>
            <div className="nx-projects">
              {projects.map((p, i) => (
                <Reveal key={p.name} delay={i * 0.08}>
                  <article className="nx-glass nx-project">
                    <div className="nx-project-img">
                      <img src={p.img} alt={p.name} loading="lazy" />
                    </div>
                    <div className="nx-project-body">
                      <span>{p.tag}</span>
                      <h3>{p.name}</h3>
                      <p>{p.text}</p>
                      <a className="nx-btn nx-btn-ghost" href={p.href} target="_blank" rel="noopener">
                        Переглянути <i className="fa-solid fa-arrow-right" />
                      </a>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* WHY */}
        <section className="nx-section" id="why">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">Переваги</p>
                <h2 className="nx-title">
                  Чому обирають <em>мене</em>
                </h2>
              </div>
            </Reveal>
            <div className="nx-stats">
              {stats.map((s) => (
                <Reveal key={s.label}>
                  <div className="nx-glass nx-stat">
                    <AnimatedNumber value={s.value} suffix={s.suffix} />
                    <span>{s.label}</span>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="nx-section" id="process">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">Етапи роботи</p>
                <h2 className="nx-title">
                  Прозорий <em>процес</em>
                </h2>
              </div>
            </Reveal>
            <div className="nx-timeline">
              {steps.map((s, i) => (
                <Reveal key={s.t} delay={i * 0.04}>
                  <div className="nx-step">
                    <div className="nx-step-dot" />
                    <span className="nx-step-num">0{i + 1}</span>
                    <h3>{s.t}</h3>
                    <p>{s.d}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* REVIEWS — keep same IDs/functionality */}
        <section className="nx-section" id="reviews">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">Відгуки</p>
                <h2 className="nx-title">
                  Що кажуть <em>клієнти</em>
                </h2>
                <p className="nx-lead">
                  Підтверджені відгуки • <span id="review-count">3</span>
                </p>
              </div>
            </Reveal>
            <div className="reviews-shell">
              <div className="nx-reviews reviews-carousel" id="reviews-container">
                <article className="nx-review-card review wm-demo-review">
                  <div className="nx-review-stars">★★★★★</div>
                  <p>Сайт зробили швидко і красиво. Зручно на телефоні, заявки йдуть.</p>
                  <div className="wm-review-author">
                    <div className="avatar">S</div>
                    <div>
                      <b>Клієнт</b>
                      <span>Stroplook.sk</span>
                    </div>
                  </div>
                </article>
                <article className="nx-review-card review wm-demo-review">
                  <div className="nx-review-stars">★★★★★</div>
                  <p>Все зрозуміло, виглядає сучасно. Клієнти самі відзначають зручність сайту.</p>
                  <div className="wm-review-author">
                    <div className="avatar">U</div>
                    <div>
                      <b>Клієнт</b>
                      <span>Ukstav.sk</span>
                    </div>
                  </div>
                </article>
                <article className="nx-review-card review wm-demo-review">
                  <div className="nx-review-stars">★★★★★</div>
                  <p>Нормально пояснили етапи, зробили без води. Результатом задоволені.</p>
                  <div className="wm-review-author">
                    <div className="avatar">D</div>
                    <div>
                      <b>Клієнт</b>
                      <span>DiurdStav.sk</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>
            <div className="nx-reviews-actions">
              <button className="nx-btn nx-btn-primary" type="button" onClick={openReview}>
                <i className="fa-solid fa-pen" /> Залишити відгук
              </button>
              <div className="nx-arrows" id="review-slider-controls">
                <button type="button" className="arrow" onClick={() => scrollReviews(-1)} aria-label="Назад">
                  ←
                </button>
                <button type="button" className="arrow" onClick={() => scrollReviews(1)} aria-label="Вперед">
                  →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* TECH */}
        <section className="nx-section" id="tech">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">Технології</p>
                <h2 className="nx-title">
                  Стек, з яким <em>працюю</em>
                </h2>
              </div>
            </Reveal>
            <div className="nx-tech-wrap" aria-hidden>
              <div className="nx-tech-track">
                {[...techs, ...techs].map(([icon, name], i) => (
                  <div className="nx-tech-item" key={`${name}-${i}`}>
                    <i className={icon} />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="nx-section" id="faq">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">FAQ</p>
                <h2 className="nx-title">
                  Часті <em>питання</em>
                </h2>
              </div>
            </Reveal>
            <div className="nx-faq">
              {faqs.map((f, i) => (
                <div key={f.q} className={`nx-faq-item ${openFaq === i ? 'open' : ''}`}>
                  <button className="nx-faq-q" type="button" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                    <span>{f.q}</span>
                    <i className="fa-solid fa-chevron-down" />
                  </button>
                  <div className="nx-faq-a">{f.a}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT */}
        <section className="nx-section" id="contact">
          <div className="nx-container nx-contact">
            <Reveal>
              <div className="nx-contact-card">
                <p className="nx-kicker">Контакти</p>
                <h2 className="nx-title" style={{ fontSize: 'clamp(28px, 3vw, 40px)' }}>
                  Давайте обговоримо <em>ваш проєкт</em>
                </h2>
                <p className="nx-lead">Напишіть — відповім із форматом, терміном і орієнтиром по ціні.</p>
                <div className="nx-contact-links">
                  <a className="nx-contact-link" href="tel:+380995228560">
                    <i className="fa-solid fa-phone" />
                    <div>
                      <small>Телефон</small>
                      <b>099 522 8560</b>
                    </div>
                  </a>
                  <a className="nx-contact-link" href="tel:+380950761194">
                    <i className="fa-solid fa-phone" />
                    <div>
                      <small>Телефон</small>
                      <b>095 076 1194</b>
                    </div>
                  </a>
                  <a className="nx-contact-link" href="mailto:nexora.ads111@gmail.com">
                    <i className="fa-solid fa-envelope" />
                    <div>
                      <small>Email</small>
                      <b>nexora.ads111@gmail.com</b>
                    </div>
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="nx-contact-form">
                <h3 style={{ margin: '0 0 8px', fontSize: 22 }}>Надіслати заявку</h3>
                <form className="nx-form" id="order-form" onSubmit={onContactSubmit}>
                  <input id="order-name" name="name" placeholder="Ім'я" required />
                  <div className="nx-form-row">
                    <input id="order-phone" name="phone" placeholder="Телефон" required />
                    <input id="order-email" name="email" type="email" placeholder="Email" required />
                  </div>
                  <input id="order-contact" type="hidden" defaultValue="" />
                  <input id="order-type" type="hidden" defaultValue="Консультація" />
                  <textarea id="order-message" name="message" placeholder="Повідомлення" />
                  <button className="nx-btn nx-btn-primary nx-btn-block" type="submit">
                    Надіслати
                  </button>
                </form>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="nx-footer">
        <div className="nx-container nx-footer-row">
          <div>© 2026 Nexora Studio</div>
          <div>Усі права захищені.</div>
        </div>
      </footer>

      {/* ORDER MODAL */}
      <div className="modal" id="orderModal">
        <div className="modal-box">
          <div className="modal-head">
            <div>
              <p className="nx-kicker">Нова заявка</p>
              <h3>Замовити сайт</h3>
            </div>
            <button className="close" type="button" onClick={() => window.closeOrderModal?.()}>
              ×
            </button>
          </div>
          <form
            className="wm-form"
            onSubmit={(e) => {
              if (typeof window.submitModalOrder === 'function') window.submitModalOrder(e);
            }}
          >
            <input id="modal-type" type="hidden" defaultValue="Landing Page" />
            <div className="wm-choice-grid">
              <button className="wm-choice active" type="button" onClick={(e) => window.chooseSiteType?.('Landing Page', e.currentTarget)}>
                <b>Landing</b>
                <span>одна послуга</span>
              </button>
              <button className="wm-choice" type="button" onClick={(e) => window.chooseSiteType?.('Сайт для бизнеса', e.currentTarget)}>
                <b>Бізнес</b>
                <span>компанія</span>
              </button>
              <button className="wm-choice" type="button" onClick={(e) => window.chooseSiteType?.('Интернет-магазин', e.currentTarget)}>
                <b>Магазин</b>
                <span>каталог</span>
              </button>
              <button className="wm-choice" type="button" onClick={(e) => window.chooseSiteType?.('Консультация', e.currentTarget)}>
                <b>Консультація</b>
                <span>підібрати</span>
              </button>
            </div>
            <input id="modal-name" placeholder="Ім'я" required />
            <input id="modal-contact" placeholder="Email / WhatsApp / телефон" required />
            <textarea id="modal-message" placeholder="Коротко про проєкт" />
            <button className="nx-btn nx-btn-primary nx-btn-block" type="submit">
              Надіслати заявку
            </button>
          </form>
        </div>
      </div>

      {/* REVIEW MODAL */}
      <div className="modal" id="reviewModal">
        <div className="modal-box">
          <div className="modal-head">
            <div>
              <h3>Залишити відгук</h3>
              <p className="nx-lead" style={{ margin: 0 }}>
                Швидка форма — 30 секунд
              </p>
            </div>
            <button className="close" type="button" onClick={() => window.closeReviewModal?.()}>
              ×
            </button>
          </div>
          <div className="review-quick-rating" id="ratingStars">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className="star active" onClick={() => window.setRating?.(n)}>
                ★
              </span>
            ))}
          </div>
          <div className="review-type-scroll">
            <button className="review-type-chip active" type="button" onClick={(e) => window.selectReviewType?.('Создание сайта', e.currentTarget)}>
              Створення сайту
            </button>
            <button className="review-type-chip" type="button" onClick={(e) => window.selectReviewType?.('Работа с менеджером', e.currentTarget)}>
              Менеджер
            </button>
            <button className="review-type-chip" type="button" onClick={(e) => window.selectReviewType?.('Поддержка', e.currentTarget)}>
              Підтримка
            </button>
            <button className="review-type-chip" type="button" onClick={(e) => window.selectReviewType?.('Общее впечатление', e.currentTarget)}>
              Враження
            </button>
          </div>
          <form
            className="wm-form"
            id="review-form"
            onSubmit={(e) => {
              if (typeof window.submitReview === 'function') return window.submitReview(e);
              return false;
            }}
          >
            <input id="review-type" type="hidden" defaultValue="Создание сайта" />
            <input id="review-name" placeholder="Ваше ім'я" required />
            <input id="review-title" placeholder="Короткий заголовок" />
            <textarea id="review-text" placeholder="Ваш відгук" required rows={3} />
            <div className="wm-form-row">
              <button className="nx-btn nx-btn-ghost" type="button" onClick={() => window.closeReviewModal?.()}>
                Скасувати
              </button>
              <button className="nx-btn nx-btn-primary" type="submit">
                Надіслати
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="toast" id="toast" />
      <div id="overlay" style={{ display: 'none' }} />
    </div>
  );
}
