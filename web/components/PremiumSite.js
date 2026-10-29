'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import { LANGS, dict, aiReply } from '@/components/i18n';

const MONO_URL = 'https://send.monobank.ua/24TAxCchRC';
const IBAN = 'SK6002000000005025750257';

const TECHS = [
  ['fa-brands fa-html5', 'HTML'],
  ['fa-brands fa-css3-alt', 'CSS'],
  ['fa-brands fa-js', 'JS'],
  ['fa-solid fa-code', 'TS'],
  ['fa-brands fa-python', 'Python'],
  ['fa-brands fa-react', 'React'],
  ['fa-solid fa-n', 'Next'],
  ['fa-solid fa-wind', 'Tailwind'],
  ['fa-brands fa-github', 'GitHub'],
];

const PLANS = [
  { id: 'Landing Page', price: 150, labelKey: 'planLanding' },
  { id: 'Сайт для бизнеса', price: 300, labelKey: 'planBusiness' },
  { id: 'Интернет-магазин', price: 600, labelKey: 'planStore' },
  { id: 'Другое', price: null, labelKey: 'planOther' },
];

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.12, margin: '0px 0px -40px 0px' });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const visible = !mounted || inView;
  return (
    <div
      ref={ref}
      className={`nx-reveal ${visible ? 'is-in' : 'is-wait'} ${className}`}
      style={mounted ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

function AnimatedNumber({ value, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const [n, setN] = useState(value);
  useEffect(() => {
    if (!inView) return;
    setN(0);
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 1100);
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

function NeonCube() {
  return (
    <div className="nx-cube-scene" aria-hidden>
      <div className="nx-cube">
        <div className="nx-cube-face front">N</div>
        <div className="nx-cube-face back">N</div>
        <div className="nx-cube-face right">N</div>
        <div className="nx-cube-face left">N</div>
        <div className="nx-cube-face top" />
        <div className="nx-cube-face bottom" />
      </div>
      <div className="nx-cube-glow" />
      <i className="nx-spark s1" />
      <i className="nx-spark s2" />
      <i className="nx-spark s3" />
      <i className="nx-rock r1" />
      <i className="nx-rock r2" />
      <i className="nx-rock r3" />
    </div>
  );
}

export default function PremiumSite() {
  const [lang, setLang] = useState('ru');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaderHide, setLoaderHide] = useState(false);
  const [loadPct, setLoadPct] = useState(10);
  const [supportOpen, setSupportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatTyping, setChatTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [plan, setPlan] = useState(PLANS[0].id);
  const [heroStep, setHeroStep] = useState(0);
  const [heroName, setHeroName] = useState('');
  const [heroContact, setHeroContact] = useState('');
  const [heroMessage, setHeroMessage] = useState('');
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const chatEndRef = useRef(null);
  const starsRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const planetY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const cubeY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  const t = useMemo(() => dict[lang] || dict.ru, [lang]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexora_lang');
      if (saved && dict[saved]) setLang(saved);
      else if (saved === 'sk') setLang('uk');
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('nexora_lang', lang);
    } catch (_) {}
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('nx-premium', 'nx-cosmic');
    setMessages([{ role: 'bot', text: (dict[lang] || dict.ru).chatHello }]);
    return () => document.body.classList.remove('nx-premium', 'nx-cosmic');
  }, [lang]);

  useEffect(() => {
    let raf;
    let done = false;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(100, Math.floor(10 + ((now - start) / 1000) * 90));
      setLoadPct(p);
      if (p < 100) raf = requestAnimationFrame(tick);
      else if (!done) {
        done = true;
        setTimeout(() => setLoaderHide(true), 180);
      }
    };
    raf = requestAnimationFrame(tick);
    const force = setTimeout(() => setLoaderHide(true), 1700);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(force);
    };
  }, []);

  useEffect(() => {
    const el = starsRef.current;
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < 80; i++) {
      const s = document.createElement('i');
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.setProperty('--d', `${1.5 + Math.random() * 3}s`);
      s.style.setProperty('--s', `${0.6 + Math.random() * 1.8}px`);
      el.appendChild(s);
    }
  }, []);

  useEffect(() => {
    if (chatOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatTyping, chatOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen || supportOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, supportOpen]);

  const openOrder = (type) => {
    if (type) {
      const modalType = document.getElementById('modal-type');
      if (modalType) modalType.value = type;
      window.chooseSiteType?.(type, null);
    }
    if (typeof window.openOrderModal === 'function') window.openOrderModal();
    else document.getElementById('orderModal')?.classList.add('active');
  };
  const openReview = () => {
    if (typeof window.openReviewModal === 'function') window.openReviewModal();
    else document.getElementById('reviewModal')?.classList.add('active');
  };
  const scrollReviews = (d) => window.scrollReviews?.(d);

  const copyIban = async () => {
    try {
      await navigator.clipboard.writeText(IBAN);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch (_) {
      setCopied(false);
    }
  };

  const sendChat = (raw) => {
    const text = (raw ?? chatInput).trim();
    if (!text) return;
    setChatInput('');
    setMessages((m) => [...m, { role: 'user', text }]);
    setChatTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { role: 'bot', text: aiReply(lang, text) }]);
      setChatTyping(false);
    }, 480);
  };

  const submitHeroOrder = (e) => {
    e.preventDefault();
    if (heroStep === 0) {
      setHeroStep(1);
      return;
    }
    const name = heroName.trim();
    const contact = heroContact.trim();
    const message = heroMessage.trim();
    const btn = e.target.querySelector('button[type="submit"]');
    if (typeof window.sendApplication === 'function') {
      window.sendApplication({ name, contact, company: plan, plan, message }, btn);
      setHeroStep(0);
      setHeroName('');
      setHeroContact('');
      setHeroMessage('');
    } else {
      openOrder(plan);
    }
  };

  const onContactSubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('order-name')?.value?.trim() || '';
    const phone = document.getElementById('order-phone')?.value?.trim() || '';
    const email = document.getElementById('order-email')?.value?.trim() || '';
    const message = document.getElementById('order-message')?.value?.trim() || '';
    const contact = [phone, email].filter(Boolean).join(' | ');
    const typeEl = document.getElementById('order-type');
    if (typeEl) typeEl.value = plan || 'Консультація';
    const fakeContact = document.getElementById('order-contact');
    if (fakeContact) fakeContact.value = contact;
    if (typeof window.sendApplication === 'function') {
      window.sendApplication(
        { name, contact, company: plan || 'Консультація', plan: plan || 'Консультація', message },
        e.target.querySelector('button[type="submit"]')
      );
      e.target.reset();
    }
  };

  const navLinks = [
    ['#top', t.nav.home],
    ['#projects', t.nav.projects],
    ['#about', t.nav.about],
    ['#services', t.nav.services],
    ['#skills', t.nav.skills],
    ['#reviews', t.nav.reviews],
    ['#contact', t.nav.contact],
  ];

  return (
    <div ref={rootRef} className="nx-root">
      <div className={`nx-loader ${loaderHide ? 'hide' : ''}`} aria-hidden={loaderHide}>
        <div className="nx-loader-core">
          <div className="nx-loader-n">N</div>
          <div className="nx-loader-ring" style={{ '--p': `${loadPct}%` }} />
          <b>{t.brand}</b>
          <small>{t.loader}</small>
        </div>
      </div>

      <div className="nx-space" aria-hidden>
        <div className="nx-nebula n1" />
        <div className="nx-nebula n2" />
        <div className="nx-nebula n3" />
        <div className="nx-stars" ref={starsRef} />
        <motion.div className="nx-planet" style={{ y: planetY }} />
      </div>

      <header className="nx-top">
        <div className="nx-container nx-top-inner">
          <a className="nx-logo" href="#top">
            <span className="nx-logo-mark">N</span>
            {t.brand}
          </a>
          <nav className="nx-nav-desktop" aria-label="nav">
            {navLinks.map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
          <div className="nx-top-actions">
            <div className="nx-lang" role="group" aria-label="Language">
              {LANGS.map((l) => (
                <button key={l.code} type="button" className={lang === l.code ? 'active' : ''} onClick={() => setLang(l.code)}>
                  {l.label}
                </button>
              ))}
            </div>
            <button className="nx-icon-btn nx-support-mini" type="button" onClick={() => setSupportOpen(true)} aria-label={t.support}>
              <i className="fa-solid fa-heart" />
            </button>
            <button className="nx-burger" type="button" aria-label={t.menu} onClick={() => setMenuOpen(true)}>
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      <div className={`nx-overlay ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`nx-drawer ${menuOpen ? 'active' : ''}`}>
        <div className="nx-drawer-head">
          <a className="nx-logo" href="#top" onClick={() => setMenuOpen(false)}>
            <span className="nx-logo-mark">N</span>
            {t.brand}
          </a>
          <button type="button" className="nx-icon-btn" onClick={() => setMenuOpen(false)} aria-label={t.close}>
            ×
          </button>
        </div>
        {navLinks.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setMenuOpen(false)}>
            {label}
          </a>
        ))}
        <div className="nx-lang nx-lang-block" role="group">
          {LANGS.map((l) => (
            <button key={l.code} type="button" className={lang === l.code ? 'active' : ''} onClick={() => setLang(l.code)}>
              {l.label}
            </button>
          ))}
        </div>
        <button className="nx-btn nx-btn-ghost nx-btn-block" type="button" onClick={() => { setMenuOpen(false); setSupportOpen(true); }}>
          <i className="fa-solid fa-heart" /> {t.support}
        </button>
        <button className="nx-btn nx-btn-primary nx-btn-block" type="button" onClick={() => { setMenuOpen(false); openOrder(plan); }}>
          {t.order}
        </button>
      </aside>

      <main id="top">
        <section className="nx-hero" ref={heroRef}>
          <div className="nx-container nx-hero-grid">
            <div className="nx-hero-copy">
              <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
                {t.heroTitle}
              </motion.h1>
              <motion.p className="nx-lead" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.6 }}>
                {t.heroLead}
              </motion.p>
              <motion.div className="nx-hero-actions" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
                <button className="nx-btn nx-btn-primary" type="button" onClick={() => openOrder(plan)}>
                  {t.order} <i className="fa-solid fa-arrow-right" />
                </button>
                <a className="nx-btn nx-btn-ghost" href="#projects">
                  {t.viewProjects} <i className="fa-solid fa-chevron-right" />
                </a>
              </motion.div>
              <div className="nx-trust">
                {t.trust.map((item) => (
                  <div key={item.label} className="nx-trust-item">
                    <i className={`fa-solid ${item.icon}`} />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <motion.div className="nx-hero-visual" style={{ y: cubeY }}>
              <NeonCube />
            </motion.div>

            <motion.form
              className="nx-glass nx-hero-order"
              onSubmit={submitHeroOrder}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.65 }}
            >
              <h3>{t.heroOrderTitle}</h3>
              {heroStep === 0 ? (
                <div className="nx-plan-list" role="radiogroup">
                  {PLANS.map((p) => (
                    <label key={p.id} className={`nx-plan ${plan === p.id ? 'active' : ''}`}>
                      <input type="radio" name="plan" checked={plan === p.id} onChange={() => setPlan(p.id)} />
                      <span className="nx-plan-dot" />
                      <span className="nx-plan-text">
                        <b>{t[p.labelKey]}</b>
                        {p.price != null && (
                          <em>
                            {t.from} {p.price}€
                          </em>
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <div className="nx-hero-fields">
                  <input value={heroName} onChange={(e) => setHeroName(e.target.value)} placeholder={t.name} required />
                  <input value={heroContact} onChange={(e) => setHeroContact(e.target.value)} placeholder={t.contact} required />
                  <textarea value={heroMessage} onChange={(e) => setHeroMessage(e.target.value)} placeholder={t.message} rows={3} />
                </div>
              )}
              <button className="nx-btn nx-btn-primary nx-btn-block" type="submit">
                {heroStep === 0 ? t.orderNext : t.send} <i className="fa-solid fa-arrow-right" />
              </button>
              {heroStep === 1 && (
                <button className="nx-link-back" type="button" onClick={() => setHeroStep(0)}>
                  ←
                </button>
              )}
            </motion.form>
          </div>
        </section>

        <section className="nx-section" id="projects">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head">
                <p className="nx-kicker">{t.projectsKicker}</p>
                <h2>{t.projectsTitle}</h2>
                <p className="nx-lead">{t.projectsLead}</p>
              </div>
            </Reveal>
            <div className="nx-projects" id="projects-container">
              {t.projects.map((p, i) => (
                <Reveal key={p.name} delay={i * 0.05}>
                  <article className="nx-glass nx-project">
                    <div className="nx-project-media">
                      <img src={p.img} alt={p.name} loading="lazy" />
                      <span>{p.tag}</span>
                    </div>
                    <div className="nx-project-body">
                      <h3>{p.name}</h3>
                      <p>{p.text}</p>
                      <a
                        className="nx-btn nx-btn-ghost"
                        href={p.href}
                        target={p.href.startsWith('http') ? '_blank' : undefined}
                        rel={p.href.startsWith('http') ? 'noreferrer' : undefined}
                      >
                        {t.viewSite} <i className="fa-solid fa-arrow-right" />
                      </a>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="nx-section" id="skills">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.skillsKicker}</p>
                <h2>{t.skillsTitle}</h2>
              </div>
            </Reveal>
            <div className="nx-skills-orbit">
              <div className="nx-skills-track">
                {[...TECHS, ...TECHS].map(([icon, name], i) => (
                  <div className="nx-skill-bubble" key={`${name}-${i}`}>
                    <i className={icon} />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="nx-section" id="services">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.nav.services}</p>
                <h2>{t.servicesTitle}</h2>
              </div>
            </Reveal>
            <div className="nx-services">
              {t.services.map((s, i) => (
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

        <section className="nx-section" id="about">
          <div className="nx-container nx-about">
            <Reveal>
              <div className="nx-about-visual">
                <div className="nx-silhouette">
                  <span className="nx-silhouette-n">N</span>
                </div>
                <img src="/Public/Image/NexoraMobilePreview.png" alt="Nexora" loading="lazy" />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div>
                <p className="nx-kicker">{t.aboutKicker}</p>
                <h2>{t.aboutTitle}</h2>
                <p className="nx-lead">{t.aboutText}</p>
                <div className="nx-stats">
                  {t.stats.map((s) => (
                    <div key={s.label} className="nx-stat">
                      <AnimatedNumber value={s.value} suffix={s.suffix} />
                      <span>{s.label}</span>
                    </div>
                  ))}
                </div>
                <p className="nx-kicker" style={{ marginTop: 28 }}>
                  {t.gallery}
                </p>
                <div className="nx-gallery">
                  {t.projects.slice(0, 4).map((p) => (
                    <img key={p.name} src={p.img} alt={p.name} loading="lazy" />
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="nx-section" id="reviews">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.reviewsKicker}</p>
                <h2>{t.reviewsTitle}</h2>
              </div>
            </Reveal>
            <div className="reviews-shell">
              <div className="nx-reviews reviews-carousel" id="reviews-container">
                {t.demoReviews.map((r) => (
                  <article key={r.title} className="nx-glass nx-review-card review wm-demo-review">
                    <div className="nx-review-stars">★★★★★</div>
                    <p>{r.text}</p>
                    <div className="wm-review-author">
                      <div className="avatar">{r.name[0]}</div>
                      <div>
                        <b>{r.name}</b>
                        <span>{r.title}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="nx-reviews-actions">
              <button className="nx-btn nx-btn-primary" type="button" onClick={openReview}>
                {t.leaveReview}
              </button>
              <div className="nx-arrows" id="review-slider-controls">
                <button type="button" className="arrow" onClick={() => scrollReviews(-1)} aria-label="prev">
                  ←
                </button>
                <button type="button" className="arrow" onClick={() => scrollReviews(1)} aria-label="next">
                  →
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="nx-section" id="contact">
          <div className="nx-container">
            <Reveal>
              <div className="nx-glass nx-cta-banner">
                <div>
                  <h2>{t.ctaTitle}</h2>
                  <p>{t.ctaLead}</p>
                </div>
                <button className="nx-btn nx-btn-primary" type="button" onClick={() => openOrder(plan)}>
                  {t.order}
                </button>
              </div>
            </Reveal>
            <div className="nx-contact">
              <Reveal>
                <div className="nx-glass nx-contact-card">
                  <h3>{t.nav.contact}</h3>
                  <a className="nx-contact-link" href="tel:+380995228560">
                    <i className="fa-solid fa-phone" /> 099 522 8560
                  </a>
                  <a className="nx-contact-link" href="tel:+380950761194">
                    <i className="fa-solid fa-phone" /> 095 076 1194
                  </a>
                  <a className="nx-contact-link" href="mailto:nexora.ads111@gmail.com">
                    <i className="fa-solid fa-envelope" /> nexora.ads111@gmail.com
                  </a>
                </div>
              </Reveal>
              <Reveal delay={0.08}>
                <div className="nx-glass nx-contact-form">
                  <h3>{t.formTitle}</h3>
                  <form className="nx-form" id="order-form" onSubmit={onContactSubmit}>
                    <input id="order-name" name="name" placeholder={t.name} required autoComplete="name" />
                    <div className="nx-form-row">
                      <input id="order-phone" name="phone" placeholder={t.phone} required autoComplete="tel" />
                      <input id="order-email" name="email" type="email" placeholder={t.email} required autoComplete="email" />
                    </div>
                    <input id="order-contact" type="hidden" defaultValue="" />
                    <input id="order-type" type="hidden" defaultValue="Landing Page" />
                    <textarea id="order-message" name="message" placeholder={t.message} />
                    <button className="nx-btn nx-btn-primary nx-btn-block" type="submit">
                      {t.send}
                    </button>
                  </form>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <footer className="nx-footer">
        <div className="nx-container nx-footer-grid">
          <a className="nx-logo" href="#top">
            <span className="nx-logo-mark">N</span>
            {t.brand}
          </a>
          <div className="nx-footer-links">
            {navLinks.slice(1).map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </div>
          <div className="nx-socials">
            <a href="https://t.me/" target="_blank" rel="noreferrer" aria-label="Telegram">
              <i className="fa-brands fa-telegram" />
            </a>
            <a href="https://instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
              <i className="fa-brands fa-instagram" />
            </a>
            <a href="mailto:nexora.ads111@gmail.com" aria-label="Email">
              <i className="fa-solid fa-envelope" />
            </a>
            <button type="button" onClick={() => setSupportOpen(true)} aria-label={t.support}>
              <i className="fa-solid fa-heart" />
            </button>
          </div>
        </div>
        <div className="nx-container nx-footer-copy">© 2026 {t.brand}. {t.footerCopy}</div>
      </footer>

      <nav className="nx-dock" aria-label="mobile">
        <a href="#top" aria-label={t.nav.home}>
          <i className="fa-solid fa-house" />
        </a>
        <a href="#projects" aria-label={t.nav.projects}>
          <i className="fa-solid fa-briefcase" />
        </a>
        <button type="button" className="nx-dock-cta" onClick={() => openOrder(plan)} aria-label={t.order}>
          <i className="fa-solid fa-plus" />
        </button>
        <a href="#reviews" aria-label={t.nav.reviews}>
          <i className="fa-solid fa-star" />
        </a>
        <button type="button" onClick={() => setSupportOpen(true)} aria-label={t.support}>
          <i className="fa-solid fa-heart" />
        </button>
      </nav>

      <AnimatePresence>
        {supportOpen && (
          <motion.div className="nx-support-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSupportOpen(false)}>
            <motion.div
              className="nx-glass nx-support-modal"
              initial={{ scale: 0.96, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close" type="button" onClick={() => setSupportOpen(false)} aria-label={t.close}>
                ×
              </button>
              <p className="nx-kicker">{t.support}</p>
              <h3>{t.supportTitle}</h3>
              <p className="nx-lead">{t.supportLead}</p>
              <div className="nx-support-grid">
                <a className="nx-support-card" href={MONO_URL} target="_blank" rel="noreferrer">
                  <i className="fa-solid fa-credit-card" />
                  <div>
                    <b>{t.monoTitle}</b>
                    <span>{t.monoBtn}</span>
                  </div>
                </a>
                <div className="nx-support-card">
                  <i className="fa-solid fa-building-columns" />
                  <div>
                    <b>{t.ibanTitle}</b>
                    <span>{t.ibanHint}</span>
                    <code>{IBAN}</code>
                  </div>
                  <button type="button" className="nx-btn nx-btn-ghost" onClick={copyIban}>
                    {copied ? t.copied : t.copy}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`nx-chat ${chatOpen ? 'open' : ''}`}>
        {chatOpen && (
          <div className="nx-glass nx-chat-panel">
            <div className="nx-chat-head">
              <b>{t.chatTitle}</b>
              <button type="button" onClick={() => setChatOpen(false)} aria-label={t.close}>
                ×
              </button>
            </div>
            <div className="nx-chat-body">
              {messages.map((m, i) => (
                <div key={i} className={`nx-chat-msg ${m.role}`}>
                  {m.text}
                </div>
              ))}
              {chatTyping && <div className="nx-chat-msg bot typing">•••</div>}
              <div ref={chatEndRef} />
            </div>
            <div className="nx-chat-hints">
              {t.chatHints.map((h) => (
                <button key={h} type="button" onClick={() => sendChat(h)}>
                  {h}
                </button>
              ))}
            </div>
            <form
              className="nx-chat-form"
              onSubmit={(e) => {
                e.preventDefault();
                sendChat();
              }}
            >
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={t.chatPlaceholder} />
              <button type="submit" aria-label={t.chatSend}>
                <i className="fa-solid fa-paper-plane" />
              </button>
            </form>
          </div>
        )}
        <button className="nx-chat-fab" type="button" onClick={() => setChatOpen((v) => !v)} aria-label={t.chatTitle}>
          <i className={`fa-solid ${chatOpen ? 'fa-xmark' : 'fa-robot'}`} />
        </button>
      </div>

      <div className="modal" id="orderModal">
        <div className="modal-box nx-glass">
          <div className="modal-head">
            <div>
              <p className="nx-kicker">{t.modalNew}</p>
              <h3>{t.modalOrder}</h3>
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
                <b>{t.choose.landing}</b>
              </button>
              <button className="wm-choice" type="button" onClick={(e) => window.chooseSiteType?.('Сайт для бизнеса', e.currentTarget)}>
                <b>{t.choose.business}</b>
              </button>
              <button className="wm-choice" type="button" onClick={(e) => window.chooseSiteType?.('Интернет-магазин', e.currentTarget)}>
                <b>{t.choose.shop}</b>
              </button>
              <button className="wm-choice" type="button" onClick={(e) => window.chooseSiteType?.('Консультация', e.currentTarget)}>
                <b>{t.choose.consult}</b>
              </button>
            </div>
            <input id="modal-name" placeholder={t.name} required />
            <input id="modal-contact" placeholder={t.contact} required />
            <textarea id="modal-message" placeholder={t.message} />
            <button className="nx-btn nx-btn-primary nx-btn-block" type="submit">
              {t.send}
            </button>
          </form>
        </div>
      </div>

      <div className="modal" id="reviewModal">
        <div className="modal-box nx-glass">
          <div className="modal-head">
            <div>
              <h3>{t.modalReview}</h3>
              <p className="nx-lead" style={{ margin: 0 }}>
                {t.modalReviewLead}
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
              Web
            </button>
            <button className="review-type-chip" type="button" onClick={(e) => window.selectReviewType?.('Работа с менеджером', e.currentTarget)}>
              Manager
            </button>
            <button className="review-type-chip" type="button" onClick={(e) => window.selectReviewType?.('Поддержка', e.currentTarget)}>
              Support
            </button>
            <button className="review-type-chip" type="button" onClick={(e) => window.selectReviewType?.('Общее впечатление', e.currentTarget)}>
              Impression
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
            <input id="review-name" placeholder={t.name} required />
            <input id="review-title" placeholder="Title" />
            <textarea id="review-text" placeholder={t.message} required rows={3} />
            <div className="wm-form-row">
              <button className="nx-btn nx-btn-ghost" type="button" onClick={() => window.closeReviewModal?.()}>
                {t.cancel}
              </button>
              <button className="nx-btn nx-btn-primary" type="submit">
                {t.send}
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
