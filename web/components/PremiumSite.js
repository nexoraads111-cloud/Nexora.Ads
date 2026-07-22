'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LANGS, dict, aiReply } from '@/components/i18n';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
};

function Reveal({ children, className = '', delay = 0 }) {
  return (
    <motion.div
      className={className}
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.18 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedNumber({ value, suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.55 });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf;
    const start = performance.now();
    const dur = 1500;
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

function TiltCard({ children, className = '' }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };
  return (
    <div ref={ref} className={`nx-tilt ${className}`} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  );
}

function ShowcaseMock({ item }) {
  return (
    <div className={`nx-mock tone-${item.tone}`}>
      <div className="nx-mock-bar">
        <span />
        <span />
        <span />
        <i>{item.niche.toLowerCase().replace(/\s/g, '')}.demo</i>
      </div>
      <div className="nx-mock-body">
        <div className="nx-mock-nav" />
        <div className="nx-mock-hero">
          <b>{item.niche}</b>
          <em>{item.style}</em>
          <div className="nx-mock-cta" />
        </div>
        <div className="nx-mock-grid">
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}

export default function PremiumSite() {
  const [lang, setLang] = useState('uk');
  const [theme, setTheme] = useState('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaderHide, setLoaderHide] = useState(false);
  const [loadPct, setLoadPct] = useState(0);
  const [openFaq, setOpenFaq] = useState(0);
  const [supportOpen, setSupportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatTyping, setChatTyping] = useState(false);
  const [bdayShow, setBdayShow] = useState(true);
  const [messages, setMessages] = useState([]);
  const cursorRef = useRef(null);
  const rootRef = useRef(null);
  const chatEndRef = useRef(null);

  const t = useMemo(() => dict[lang] || dict.uk, [lang]);

  useEffect(() => {
    const savedLang = localStorage.getItem('nexora_lang');
    const savedTheme = localStorage.getItem('nexora_theme');
    if (savedLang && dict[savedLang]) setLang(savedLang);
    if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem('nexora_lang', lang);
    document.documentElement.lang = lang === 'uk' ? 'uk' : lang === 'sk' ? 'sk' : 'en';
    setMessages([{ role: 'bot', text: (dict[lang] || dict.uk).chatHello }]);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('nexora_theme', theme);
    document.body.classList.add('nx-premium', 'nx-mega');
    document.body.classList.toggle('nx-light', theme === 'light');
    document.documentElement.setAttribute('data-theme', theme);
    return () => {
      document.body.classList.remove('nx-premium', 'nx-mega', 'nx-light');
    };
  }, [theme]);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(100, Math.floor(((now - start) / 2200) * 100));
      setLoadPct(p);
      if (p < 100) raf = requestAnimationFrame(tick);
      else setTimeout(() => setLoaderHide(true), 280);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const hide = setTimeout(() => setBdayShow(false), 5200);
    return () => clearTimeout(hide);
  }, []);

  useEffect(() => {
    const c = cursorRef.current;
    if (!c) return;
    const move = (e) => gsap.to(c, { x: e.clientX, y: e.clientY, duration: 0.16, ease: 'power3.out' });
    const over = (e) => {
      if (e.target.closest('a, button, .nx-glass, .nx-project, .nx-mock, .nx-price')) c.classList.add('big');
    };
    const out = (e) => {
      if (e.target.closest('a, button, .nx-glass, .nx-project, .nx-mock, .nx-price')) c.classList.remove('big');
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
          y: -48,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      });
      gsap.utils.toArray('.nx-float-y').forEach((el, i) => {
        gsap.to(el, { y: i % 2 ? 12 : -14, duration: 2.8 + i * 0.2, yoyo: true, repeat: -1, ease: 'sine.inOut' });
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatTyping]);

  const openOrder = () => window.openOrderModal?.();
  const openReview = () => window.openReviewModal?.();
  const scrollReviews = (d) => window.scrollReviews?.(d);

  const copyIban = async () => {
    try {
      await navigator.clipboard.writeText(IBAN);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
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
    }, 700 + Math.random() * 600);
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

  return (
    <div ref={rootRef} className="nx-root">
      {/* LOADER */}
      <div className={`nx-loader ${loaderHide ? 'hide' : ''}`} aria-hidden={loaderHide}>
        <div className="nx-loader-orbit" />
        <div className="nx-loader-inner">
          <div className="nx-loader-ring">
            <svg viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" />
              <circle cx="60" cy="60" r="52" style={{ strokeDashoffset: 327 - (327 * loadPct) / 100 }} />
            </svg>
            <strong>{loadPct}%</strong>
          </div>
          <div className="nx-loader-brand">
            Nexora <span>Studio</span>
          </div>
          <p>{t.loader}</p>
        </div>
      </div>

      {/* BIRTHDAY TOAST */}
      <AnimatePresence>
        {bdayShow && loaderHide && (
          <motion.div
            className="nx-bday"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
          >
            {t.birthday}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="nx-cursor" ref={cursorRef} />
      <div className="nx-ambient" aria-hidden>
        <div className="orb orb-a" />
        <div className="orb orb-b" />
        <div className="orb orb-c" />
        <div className="nx-particles">
          {Array.from({ length: 18 }).map((_, i) => (
            <i key={i} style={{ '--i': i }} />
          ))}
        </div>
        <div className="grid" />
      </div>

      <div className={`nx-overlay ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`nx-drawer ${menuOpen ? 'active' : ''}`}>
        <div className="nx-drawer-head">
          <a className="nx-logo" href="#top" onClick={() => setMenuOpen(false)}>
            Nexora<span>.</span>
          </a>
          <button className="nx-drawer-close" type="button" onClick={() => setMenuOpen(false)}>
            ×
          </button>
        </div>
        {navLinks.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setMenuOpen(false)}>
            {label}
          </a>
        ))}
        <button
          className="nx-btn nx-btn-primary nx-btn-block"
          style={{ marginTop: 20 }}
          type="button"
          onClick={() => {
            setMenuOpen(false);
            openOrder();
          }}
        >
          {t.order}
        </button>
      </aside>

      <header className="nx-header">
        <div className="nx-container nx-nav">
          <a className="nx-logo" href="#top">
            Nexora<span>Studio</span>
          </a>
          <nav className="nx-links" aria-label="nav">
            {navLinks.slice(0, 6).map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </nav>
          <div className="nx-nav-actions">
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
              title={theme === 'dark' ? t.themeLight : t.themeDark}
            >
              <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`} />
            </button>
            <button className="nx-btn nx-btn-ghost nx-support-btn" type="button" onClick={() => setSupportOpen(true)}>
              <i className="fa-solid fa-heart" /> {t.support}
            </button>
            <button className="nx-btn nx-btn-primary" type="button" onClick={openOrder}>
              {t.order}
            </button>
            <button className="nx-burger" type="button" aria-label="menu" onClick={() => setMenuOpen(true)}>
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
                <p className="nx-kicker">{t.kicker}</p>
              </Reveal>
              <Reveal delay={0.06}>
                <h1>
                  {(() => {
                    const parts = t.heroTitle.split(',');
                    if (parts.length < 2) return t.heroTitle;
                    return (
                      <>
                        {parts.slice(0, -1).join(',')}, <em>{parts.at(-1).trim()}</em>
                      </>
                    );
                  })()}
                </h1>
              </Reveal>
              <Reveal delay={0.14}>
                <p className="nx-lead">{t.heroLead}</p>
              </Reveal>
              <Reveal delay={0.22}>
                <div className="nx-hero-actions">
                  <button className="nx-btn nx-btn-primary nx-neon" type="button" onClick={openOrder}>
                    {t.order} <i className="fa-solid fa-arrow-right" />
                  </button>
                  <a className="nx-btn nx-btn-ghost" href="#projects">
                    {t.portfolio}
                  </a>
                </div>
              </Reveal>
              <Reveal delay={0.3}>
                <div className="nx-hero-pills">
                  <span>
                    <i className="fa-solid fa-bolt" /> PageSpeed 99+
                  </span>
                  <span>
                    <i className="fa-solid fa-mobile-screen" /> Mobile first
                  </span>
                  <span>
                    <i className="fa-solid fa-globe" /> UA · SK · EN
                  </span>
                </div>
              </Reveal>
            </div>
            <div className="nx-hero-visual nx-parallax">
              <div className="nx-hero-glow" />
              <div className="nx-float-card nx-float-a nx-float-y">
                <i className="fa-solid fa-gauge-high" /> PageSpeed 99+
              </div>
              <div className="nx-float-card nx-float-b nx-float-y">
                <i className="fa-solid fa-shield-halved" /> Turnkey
              </div>
              <div className="nx-float-card nx-float-c nx-float-y">
                <i className="fa-solid fa-sparkles" /> AI assist
              </div>
              <motion.div
                className="nx-laptop"
                initial={{ opacity: 0, y: 50, rotateY: -18 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{ duration: 1.1, delay: 0.25 }}
              >
                <div className="nx-laptop-lid">
                  <div className="nx-laptop-screen">
                    <img src="/Public/Image/DiurdStav.png" alt="Nexora demo" />
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
                <p className="nx-kicker">{t.aboutKicker}</p>
                <h2 className="nx-title">
                  {t.aboutTitle.includes('—') ? (
                    <>
                      {t.aboutTitle.split('—')[0]}— <em>{t.aboutTitle.split('—')[1]}</em>
                    </>
                  ) : (
                    t.aboutTitle
                  )}
                </h2>
              </div>
              <div className="nx-glass nx-about-panel">
                <p>{t.aboutText}</p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="nx-glass nx-about-media">
                <img src="/Public/Image/Ukstav.png" alt="Nexora Studio" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* SERVICES */}
        <section className="nx-section" id="services">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.servicesKicker}</p>
                <h2 className="nx-title">
                  {t.servicesTitle} <em>✦</em>
                </h2>
                <p className="nx-lead">{t.servicesLead}</p>
              </div>
            </Reveal>
            <div className="nx-services nx-services-8">
              {t.services.map((s, i) => (
                <Reveal key={s.title} delay={i * 0.04}>
                  <TiltCard>
                    <article className="nx-glass nx-service">
                      <div className="nx-service-icon">
                        <i className={`fa-solid ${s.icon}`} />
                      </div>
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                    </article>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* PROJECTS */}
        <section className="nx-section" id="projects">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.projectsKicker}</p>
                <h2 className="nx-title">{t.projectsTitle}</h2>
                <p className="nx-lead">{t.projectsLead}</p>
              </div>
            </Reveal>
            <div className="nx-projects">
              {t.projects.map((p, i) => (
                <Reveal key={p.name} delay={i * 0.08}>
                  <TiltCard>
                    <article className="nx-project nx-glass">
                      <div className="nx-project-media">
                        <img src={p.img} alt={p.name} />
                        <span>{p.tag}</span>
                      </div>
                      <div className="nx-project-body">
                        <h3>{p.name}</h3>
                        <p>{p.text}</p>
                        <a className="nx-btn nx-btn-ghost" href={p.href} target="_blank" rel="noreferrer">
                          {t.view} <i className="fa-solid fa-arrow-up-right-from-square" />
                        </a>
                      </div>
                    </article>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* SHOWCASE FAKE WORKS */}
        <section className="nx-section" id="showcase">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.showcaseKicker}</p>
                <h2 className="nx-title">{t.showcaseTitle}</h2>
                <p className="nx-lead">{t.showcaseLead}</p>
              </div>
            </Reveal>
            <div className="nx-showcase">
              {t.showcase.map((item, i) => (
                <Reveal key={item.niche} delay={i * 0.05}>
                  <TiltCard>
                    <article className="nx-glass nx-showcase-card">
                      <ShowcaseMock item={item} />
                      <div className="nx-showcase-meta">
                        <h3>{item.niche}</h3>
                        <p>{item.style}</p>
                      </div>
                    </article>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* STATS */}
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
                <Reveal key={s.label} delay={i * 0.06}>
                  <div className="nx-glass nx-stat">
                    <AnimatedNumber value={s.value} suffix={s.suffix} />
                    <span>{s.label}</span>
                  </div>
                </Reveal>
              ))}
            </div>
            <Reveal delay={0.1}>
              <div className="nx-included nx-glass">
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

        {/* PRICING */}
        <section className="nx-section" id="pricing">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.pricingKicker}</p>
                <h2 className="nx-title">{t.pricingTitle}</h2>
                <p className="nx-lead">{t.pricingLead}</p>
              </div>
            </Reveal>
            <div className="nx-prices">
              {t.prices.map((p, i) => (
                <Reveal key={p.name} delay={i * 0.08}>
                  <article className={`nx-glass nx-price ${p.popular ? 'popular' : ''}`}>
                    {p.popular && <span className="nx-badge">Best</span>}
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

        {/* PROCESS */}
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
                <Reveal key={s.t} delay={i * 0.05}>
                  <div className="nx-timeline-item">
                    <div className="nx-timeline-num">{String(i + 1).padStart(2, '0')}</div>
                    <div className="nx-glass nx-timeline-card">
                      <h3>{s.t}</h3>
                      <p>{s.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* REVIEWS */}
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

        {/* TECH */}
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

        {/* FAQ */}
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

        {/* CONTACT */}
        <section className="nx-section" id="contact">
          <div className="nx-container nx-contact">
            <Reveal>
              <div className="nx-contact-card">
                <p className="nx-kicker">{t.contactKicker}</p>
                <h2 className="nx-title" style={{ fontSize: 'clamp(28px, 3vw, 42px)' }}>
                  {t.contactTitle}
                </h2>
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
            <Reveal delay={0.1}>
              <div className="nx-contact-form">
                <h3 style={{ margin: '0 0 8px', fontSize: 22 }}>{t.formTitle}</h3>
                <form className="nx-form" id="order-form" onSubmit={onContactSubmit}>
                  <input id="order-name" name="name" placeholder={t.name} required />
                  <div className="nx-form-row">
                    <input id="order-phone" name="phone" placeholder={t.phone} required />
                    <input id="order-email" name="email" type="email" placeholder={t.email} required />
                  </div>
                  <input id="order-contact" type="hidden" defaultValue="" />
                  <input id="order-type" type="hidden" defaultValue="Консультація" />
                  <textarea id="order-message" name="message" placeholder={t.message} />
                  <button className="nx-btn nx-btn-primary nx-btn-block nx-neon" type="submit">
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
          <div>© 2026 Nexora Studio</div>
          <div className="nx-footer-actions">
            <button type="button" onClick={() => setSupportOpen(true)}>
              {t.support}
            </button>
            <span>{t.footerCopy}</span>
          </div>
        </div>
      </footer>

      {/* SUPPORT MODAL */}
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
              className="nx-support-modal nx-glass"
              initial={{ scale: 0.92, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="close" type="button" onClick={() => setSupportOpen(false)}>
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

      {/* AI CHAT */}
      <div className={`nx-chat ${chatOpen ? 'open' : ''}`}>
        <button className="nx-chat-fab nx-neon" type="button" onClick={() => setChatOpen((v) => !v)}>
          <i className={`fa-solid ${chatOpen ? 'fa-xmark' : 'fa-robot'}`} />
        </button>
        <div className="nx-chat-panel nx-glass">
          <div className="nx-chat-head">
            <div>
              <b>{t.chatTitle}</b>
              <span>online</span>
            </div>
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
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={t.chatPlaceholder}
            />
            <button type="submit" aria-label={t.chatSend}>
              <i className="fa-solid fa-paper-plane" />
            </button>
          </form>
        </div>
      </div>

      {/* ORDER MODAL */}
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

      {/* REVIEW MODAL */}
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
