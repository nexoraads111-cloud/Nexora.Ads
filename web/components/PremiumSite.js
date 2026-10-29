'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, useScroll, useTransform } from 'framer-motion';
import { LANGS, dict, aiReply } from '@/components/i18n';

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

const MONO_URL = 'https://send.monobank.ua/24TAxCchRC';
const IBAN = 'SK6002000000005025750257';

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
    const dur = 1100;
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

function ShowcaseCard({ item, t, featured = false, onOrder }) {
  return (
    <article className={`nx-showcase-card ${featured ? 'is-featured' : ''} tone-${item.tone}`}>
      <div className="nx-mock">
        <div className="nx-mock-bar">
          <span />
          <span />
          <span />
          <i>{item.id || 'demo'}.nexora</i>
          <em>{t.showcaseDemo}</em>
        </div>
        <div className="nx-mock-shot">
          <img src={item.img} alt={`${item.niche} — ${t.showcaseDemo}`} loading="lazy" />
        </div>
      </div>
      <div className="nx-showcase-meta">
        <p className="nx-showcase-style">{item.style}</p>
        <h3>{item.niche}</h3>
        <p className="nx-showcase-desc">{item.desc}</p>
        <div className="nx-mock-tags">
          {(item.tags || []).map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
        <button className="nx-btn nx-btn-primary" type="button" onClick={onOrder}>
          {t.showcaseCta} <i className="fa-solid fa-arrow-right" />
        </button>
      </div>
    </article>
  );
}

export default function PremiumSite() {
  const [lang, setLang] = useState('uk');
  const [theme, setTheme] = useState('light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [islandExpanded, setIslandExpanded] = useState(false);
  const [loaderHide, setLoaderHide] = useState(false);
  const [loadPct, setLoadPct] = useState(8);
  const [openFaq, setOpenFaq] = useState(0);
  const [supportOpen, setSupportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatTyping, setChatTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showcaseFilter, setShowcaseFilter] = useState('all');
  const [scrolled, setScrolled] = useState(false);
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const chatEndRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);

  const t = useMemo(() => dict[lang] || dict.uk, [lang]);
  const showcaseItems = useMemo(() => {
    const list = t.showcase || [];
    if (showcaseFilter === 'all') return list;
    return list.filter((x) => x.id === showcaseFilter);
  }, [t.showcase, showcaseFilter]);
  const featured = showcaseItems.find((x) => x.featured) || showcaseItems[0];
  const rest = showcaseItems.filter((x) => x !== featured);

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('nexora_lang');
      const savedTheme = localStorage.getItem('nexora_theme');
      if (savedLang && dict[savedLang]) setLang(savedLang);
      else if (savedLang === 'sk') setLang('uk');
      if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('nexora_lang', lang);
    } catch (_) {}
    document.documentElement.lang = lang;
    setMessages([{ role: 'bot', text: (dict[lang] || dict.uk).chatHello }]);
    setShowcaseFilter('all');
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem('nexora_theme', theme);
    } catch (_) {}
    document.body.classList.add('nx-premium', 'nx-atelier');
    document.body.classList.toggle('nx-light', theme === 'light');
    document.body.classList.toggle('nx-dark', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    return () => {
      document.body.classList.remove('nx-premium', 'nx-atelier', 'nx-light', 'nx-dark');
    };
  }, [theme]);

  useEffect(() => {
    let raf;
    let done = false;
    const start = performance.now();
    const dur = 1000;
    const tick = (now) => {
      const p = Math.min(100, Math.floor(8 + ((now - start) / dur) * 92));
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
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (chatOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatTyping, chatOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen || supportOpen || islandExpanded ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, supportOpen, islandExpanded]);

  const openOrder = () => {
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
    }, 520);
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

  const navLinks = [
    ['#about', t.nav.about],
    ['#services', t.nav.services],
    ['#projects', t.nav.projects],
    ['#showcase', t.nav.showcase],
    ['#pricing', t.nav.pricing],
    ['#reviews', t.nav.reviews],
    ['#contact', t.nav.contact],
  ];

  const closeIsland = () => {
    setIslandExpanded(false);
    setMenuOpen(false);
  };

  return (
    <div ref={rootRef} className="nx-root">
      <div className={`nx-loader ${loaderHide ? 'hide' : ''}`} aria-hidden={loaderHide}>
        <div className="nx-loader-island">
          <div className="nx-loader-pulse" />
          <div className="nx-loader-mark">N</div>
          <div className="nx-loader-copy">
            <b>
              {t.brand}
              <span>{t.brandMark}</span>
            </b>
            <small>{t.loader}</small>
          </div>
          <div className="nx-loader-ring" style={{ '--p': `${loadPct}%` }} />
        </div>
      </div>

      <div className="nx-ambient" aria-hidden>
        <div className="nx-wash nx-wash-a" />
        <div className="nx-wash nx-wash-b" />
        <div className="nx-grain" />
      </div>

      {/* Dynamic Island chrome */}
      <div className={`nx-island-wrap ${scrolled ? 'is-scrolled' : ''} ${islandExpanded || menuOpen ? 'is-open' : ''}`}>
        <motion.div
          className="nx-island"
          layout
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        >
          <button
            type="button"
            className="nx-island-brand"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
              closeIsland();
            }}
            aria-label="Nexora Studio"
          >
            <span className="nx-island-dot" />
            <strong>
              {t.brand} <em>{t.brandMark}</em>
            </strong>
          </button>

          <nav className="nx-island-links" aria-label="nav">
            {navLinks.slice(0, 4).map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>

          <div className="nx-island-actions">
            <div className="nx-lang" role="group" aria-label="Language">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={lang === l.code ? 'active' : ''}
                  onClick={() => setLang(l.code)}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <button
              className="nx-icon-btn"
              type="button"
              aria-label="theme"
              onClick={() => setTheme((x) => (x === 'dark' ? 'light' : 'dark'))}
            >
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
            </button>
            <button className="nx-btn nx-btn-ghost nx-support-btn" type="button" onClick={() => setSupportOpen(true)}>
              <i className="fa-solid fa-heart" /> <span>{t.support}</span>
            </button>
            <button className="nx-btn nx-btn-primary nx-order-desktop" type="button" onClick={openOrder}>
              {t.order}
            </button>
            <button
              className="nx-island-toggle"
              type="button"
              aria-label={t.menu}
              aria-expanded={islandExpanded || menuOpen}
              onClick={() => {
                setIslandExpanded((v) => !v);
                setMenuOpen((v) => !v);
              }}
            >
              <span />
              <span />
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {(islandExpanded || menuOpen) && (
            <motion.div
              className="nx-island-panel"
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {navLinks.map(([href, label]) => (
                <a
                  key={href}
                  href={href}
                  onClick={closeIsland}
                >
                  {label}
                </a>
              ))}
              <div className="nx-island-panel-tools">
                <div className="nx-lang" role="group" aria-label="Language">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      className={lang === l.code ? 'active' : ''}
                      onClick={() => setLang(l.code)}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
                <button
                  className="nx-icon-btn"
                  type="button"
                  aria-label="theme"
                  onClick={() => setTheme((x) => (x === 'dark' ? 'light' : 'dark'))}
                >
                  <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
                </button>
              </div>
              <button
                className="nx-btn nx-btn-ghost nx-btn-block"
                type="button"
                onClick={() => {
                  closeIsland();
                  setSupportOpen(true);
                }}
              >
                <i className="fa-solid fa-heart" /> {t.support}
              </button>
              <button
                className="nx-btn nx-btn-primary nx-btn-block"
                type="button"
                onClick={() => {
                  closeIsland();
                  openOrder();
                }}
              >
                {t.order}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div
        className={`nx-overlay ${islandExpanded || menuOpen ? 'active' : ''}`}
        onClick={closeIsland}
      />

      <main id="top">
        <section className="nx-hero" ref={heroRef}>
          <div className="nx-hero-stage">
            <motion.div className="nx-hero-media" style={{ y: heroY, scale: heroScale }}>
              <img src="/Public/Image/showcase-realty.jpg" alt="Nexora Studio" loading="eager" />
              <div className="nx-hero-veil" />
            </motion.div>
            <div className="nx-container nx-hero-content">
              <motion.p
                className="nx-brand-lockup"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.6 }}
              >
                {t.brand} <em>{t.brandMark}</em>
              </motion.p>
              <motion.p
                className="nx-kicker"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                {t.kicker}
              </motion.p>
              <motion.h1
                className="nx-hero-line"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26, duration: 0.6 }}
              >
                {t.heroTitle}
              </motion.h1>
              <motion.p
                className="nx-lead"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34, duration: 0.5 }}
              >
                {t.heroLead}
              </motion.p>
              <motion.div
                className="nx-hero-actions"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.45 }}
              >
                <button className="nx-btn nx-btn-primary" type="button" onClick={openOrder}>
                  {t.order} <i className="fa-solid fa-arrow-right" />
                </button>
                <a className="nx-btn nx-btn-ghost" href="#projects">
                  {t.portfolio}
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="nx-section" id="about">
          <div className="nx-container nx-about">
            <Reveal>
              <div className="nx-head">
                <p className="nx-kicker">{t.aboutKicker}</p>
                <h2 className="nx-title">{t.aboutTitle}</h2>
              </div>
              <p className="nx-about-text">{t.aboutText}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="nx-about-media">
                <img src="/Public/Image/Ukstav.png" alt="Nexora Studio" loading="lazy" />
              </div>
            </Reveal>
          </div>
        </section>

        <section className="nx-section" id="services">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.servicesKicker}</p>
                <h2 className="nx-title">{t.servicesTitle}</h2>
                <p className="nx-lead">{t.servicesLead}</p>
              </div>
            </Reveal>
            <div className="nx-services">
              {t.services.map((s, i) => (
                <Reveal key={s.title} delay={Math.min(i * 0.03, 0.2)}>
                  <article className="nx-service">
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

        <section className="nx-section" id="projects">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.projectsKicker}</p>
                <h2 className="nx-title">{t.projectsTitle}</h2>
                <p className="nx-lead">{t.projectsLead}</p>
              </div>
            </Reveal>
            <div className="nx-projects" id="projects-container">
              {t.projects.map((p, i) => (
                <Reveal key={p.name} delay={i * 0.05}>
                  <article className="nx-project">
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
                        {t.view} <i className="fa-solid fa-arrow-up-right-from-square" />
                      </a>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="nx-section" id="redesign">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.redesignKicker}</p>
                <h2 className="nx-title">{t.redesignTitle}</h2>
                <p className="nx-lead">{t.redesignLead}</p>
              </div>
            </Reveal>
            <div className="nx-redesign">
              {(t.redesign || []).map((item) => (
                <Reveal key={item.label}>
                  <figure className="nx-redesign-card">
                    <img src={item.img} alt={item.label} loading="lazy" />
                    <figcaption>{item.label}</figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="nx-section nx-showcase-section" id="showcase">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.showcaseKicker}</p>
                <h2 className="nx-title">{t.showcaseTitle}</h2>
                <p className="nx-lead">{t.showcaseLead}</p>
              </div>
            </Reveal>
            <div className="nx-showcase-filters" role="tablist" aria-label="showcase">
              <button
                type="button"
                className={showcaseFilter === 'all' ? 'active' : ''}
                onClick={() => setShowcaseFilter('all')}
              >
                {t.showcaseAll}
              </button>
              {(t.showcase || []).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={showcaseFilter === item.id ? 'active' : ''}
                  onClick={() => setShowcaseFilter(item.id)}
                >
                  {item.niche}
                </button>
              ))}
            </div>
            <div className={`nx-showcase-bento ${showcaseFilter !== 'all' ? 'is-single' : ''}`}>
              {featured && (
                <Reveal className="nx-showcase-featured-wrap">
                  <ShowcaseCard item={featured} t={t} featured onOrder={openOrder} />
                </Reveal>
              )}
              <div className="nx-showcase-grid">
                {rest.map((item, i) => (
                  <Reveal key={item.id} delay={Math.min(i * 0.05, 0.2)}>
                    <ShowcaseCard item={item} t={t} onOrder={openOrder} />
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="nx-section" id="why">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.whyKicker}</p>
                <h2 className="nx-title">{t.whyTitle}</h2>
              </div>
            </Reveal>
            <div className="nx-stats">
              {t.stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 0.05}>
                  <div className="nx-stat">
                    <AnimatedNumber value={s.value} suffix={s.suffix} />
                    <span>{s.label}</span>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.08}>
              <div className="nx-included">
                <h3>{t.includedTitle}</h3>
                <ul>
                  {t.included.map((x) => (
                    <li key={x}>
                      <i className="fa-solid fa-check" /> {x}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="nx-section" id="pricing">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.pricingKicker}</p>
                <h2 className="nx-title">{t.pricingTitle}</h2>
                <p className="nx-lead">{t.pricingLead}</p>
              </div>
            </Reveal>
            <div className="nx-prices" id="pricing-container">
              {t.prices.map((p, i) => (
                <Reveal key={p.name} delay={i * 0.06}>
                  <article className={`nx-price ${p.popular ? 'popular' : ''}`}>
                    {p.popular && <span className="nx-badge">{t.best}</span>}
                    <h3>{p.name}</h3>
                    <div className="nx-price-value">{p.price}</div>
                    <ul>
                      {p.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                    <button className="nx-btn nx-btn-primary nx-btn-block" type="button" onClick={openOrder}>
                      {t.order}
                    </button>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="nx-section" id="process">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.processKicker}</p>
                <h2 className="nx-title">{t.processTitle}</h2>
              </div>
            </Reveal>
            <div className="nx-timeline">
              {t.steps.map((s, i) => (
                <Reveal key={s.t} delay={Math.min(i * 0.04, 0.24)}>
                  <div className="nx-timeline-item">
                    <div className="nx-timeline-num">{String(i + 1).padStart(2, '0')}</div>
                    <div className="nx-timeline-card">
                      <h3>{s.t}</h3>
                      <p>{s.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="nx-section" id="reviews">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.reviewsKicker}</p>
                <h2 className="nx-title">{t.reviewsTitle}</h2>
                <p className="nx-lead">
                  {t.reviewsVerified} • <span id="review-count">3</span>
                </p>
              </div>
            </Reveal>
            <div className="reviews-shell">
              <div className="nx-reviews reviews-carousel" id="reviews-container">
                {t.demoReviews.map((r) => (
                  <article key={r.title} className="nx-review-card review wm-demo-review">
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
                <i className="fa-solid fa-pen" /> {t.leaveReview}
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

        <section className="nx-section" id="tech">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.techKicker}</p>
                <h2 className="nx-title">{t.techTitle}</h2>
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

        <section className="nx-section" id="faq">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.faqKicker}</p>
                <h2 className="nx-title">{t.faqTitle}</h2>
              </div>
            </Reveal>
            <div className="nx-faq">
              {t.faqs.map((f, i) => (
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

        <section className="nx-section" id="contact">
          <div className="nx-container nx-contact">
            <Reveal>
              <div className="nx-contact-card">
                <p className="nx-kicker">{t.contactKicker}</p>
                <h2 className="nx-title nx-contact-title">{t.contactTitle}</h2>
                <p className="nx-lead">{t.contactLead}</p>
                <div className="nx-contact-links">
                  <a className="nx-contact-link" href="tel:+380995228560">
                    <i className="fa-solid fa-phone" />
                    <div>
                      <small>{t.phone}</small>
                      <b>099 522 8560</b>
                    </div>
                  </a>
                  <a className="nx-contact-link" href="tel:+380950761194">
                    <i className="fa-solid fa-phone" />
                    <div>
                      <small>{t.phone}</small>
                      <b>095 076 1194</b>
                    </div>
                  </a>
                  <a className="nx-contact-link" href="mailto:nexora.ads111@gmail.com">
                    <i className="fa-solid fa-envelope" />
                    <div>
                      <small>{t.email}</small>
                      <b>nexora.ads111@gmail.com</b>
                    </div>
                  </a>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="nx-contact-form">
                <h3>{t.formTitle}</h3>
                <form className="nx-form" id="order-form" onSubmit={onContactSubmit}>
                  <input id="order-name" name="name" placeholder={t.name} required autoComplete="name" />
                  <div className="nx-form-row">
                    <input id="order-phone" name="phone" placeholder={t.phone} required autoComplete="tel" />
                    <input id="order-email" name="email" type="email" placeholder={t.email} required autoComplete="email" />
                  </div>
                  <input id="order-contact" type="hidden" defaultValue="" />
                  <input id="order-type" type="hidden" defaultValue="Консультація" />
                  <textarea id="order-message" name="message" placeholder={t.message} />
                  <button className="nx-btn nx-btn-primary nx-btn-block" type="submit">
                    {t.send}
                  </button>
                </form>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="nx-footer">
        <div className="nx-container nx-footer-row">
          <div>
            © 2026 {t.brand} {t.brandMark}
          </div>
          <div className="nx-footer-actions">
            <button type="button" onClick={() => setSupportOpen(true)}>
              {t.support}
            </button>
            <span>{t.footerCopy}</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {supportOpen && (
          <motion.div
            className="nx-support-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSupportOpen(false)}
          >
            <motion.div
              className="nx-support-modal"
              initial={{ scale: 0.96, y: 16, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
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
                  <i className="fa-solid fa-arrow-up-right-from-square" />
                </a>
                <div className="nx-support-card nx-support-iban">
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
          <div className="nx-chat-panel">
            <div className="nx-chat-head">
              <div>
                <b>{t.chatTitle}</b>
                <span>online</span>
              </div>
              <button type="button" className="nx-chat-close" onClick={() => setChatOpen(false)} aria-label={t.close}>
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
        <div className="modal-box">
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
            <input id="modal-contact" placeholder="Email / WhatsApp / phone" required />
            <textarea id="modal-message" placeholder={t.message} />
            <button className="nx-btn nx-btn-primary nx-btn-block" type="submit">
              {t.send}
            </button>
          </form>
        </div>
      </div>

      <div className="modal" id="reviewModal">
        <div className="modal-box">
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
