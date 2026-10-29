'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { LANGS, dict, aiReply } from '@/components/i18n';
import DemoApps from '@/components/DemoApps';

const MONO_URL = 'https://send.monobank.ua/24TAxCchRC';
const IBAN = 'SK6002000000005025750257';

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.12, margin: '0px 0px -36px 0px' });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const visible = !mounted || inView;
  return (
    <div ref={ref} className={`nx-reveal ${visible ? 'is-in' : 'is-wait'} ${className}`} style={mounted ? { transitionDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  );
}

function CrystalOrb() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-50, 50], [12, -12]), { stiffness: 110, damping: 16 });
  const ry = useSpring(useTransform(mx, [-50, 50], [-16, 16]), { stiffness: 110, damping: 16 });
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      className="nx-crystal-scene"
      onMouseMove={(e) => {
        if (reduce) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width - 0.5) * 100);
        my.set(((e.clientY - r.top) / r.height - 0.5) * 100);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      aria-hidden
    >
      <div className="nx-hero-sky" />
      <div className="nx-hero-rocks" />
      <div className="nx-hero-fog" />
      <motion.div className="nx-crystal" style={{ rotateX: rx, rotateY: ry }}>
        <div className="nx-crystal-glow" />
        <div className="nx-crystal-core">
          <span className="f f1" />
          <span className="f f2" />
          <span className="f f3" />
          <span className="f f4" />
          <span className="f f5" />
          <span className="f f6" />
          <i className="nx-crystal-shine" />
        </div>
        <div className="nx-crystal-ring r1" />
        <div className="nx-crystal-ring r2" />
        <div className="nx-crystal-particles">
          <i /><i /><i /><i /><i /><i />
        </div>
      </motion.div>
    </div>
  );
}

function GlowingN() {
  return (
    <div className="nx-glow-n" aria-hidden>
      <div className="nx-glow-n-bloom" />
      <svg viewBox="0 0 200 220" className="nx-glow-n-svg">
        <defs>
          <linearGradient id="nGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="45%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <filter id="nGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M40 30 V190 H68 V95 L132 190 H160 V30 H132 V125 L68 30 Z"
          fill="url(#nGrad)"
          filter="url(#nGlow)"
          opacity="0.95"
        />
        <path d="M48 38 V178 H60 V88 L136 178 H152 V38 H140 V128 L60 38 Z" fill="none" stroke="#f5e9ff" strokeWidth="1.2" opacity="0.7" />
      </svg>
    </div>
  );
}

export default function PremiumSite() {
  const [lang, setLang] = useState('uk');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loaderHide, setLoaderHide] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [supportOpen, setSupportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatTyping, setChatTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const [activeDemo, setActiveDemo] = useState(null);
  const [activeSection, setActiveSection] = useState('top');
  const [openFaq, setOpenFaq] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [formType, setFormType] = useState('Landing Page');
  const [progress, setProgress] = useState(0);
  const [liveReviewCount, setLiveReviewCount] = useState(0);
  const chatEndRef = useRef(null);
  const starsRef = useRef(null);
  const formRef = useRef(null);

  const t = useMemo(() => dict[lang] || dict.uk, [lang]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexora_lang');
      if (saved && dict[saved]) setLang(saved);
      if (sessionStorage.getItem('nexora_splash_seen') === '1') {
        setShowLoader(false);
        setLoaderHide(true);
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('nexora_lang', lang);
    } catch (_) {}
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('nx-premium', 'nx-full', 'nx-mockup');
    setMessages([{ role: 'bot', text: (dict[lang] || dict.uk).chatHello }]);
    return () => document.body.classList.remove('nx-premium', 'nx-full', 'nx-mockup');
  }, [lang]);

  useEffect(() => {
    if (!showLoader) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const done = () => {
      setLoaderHide(true);
      try {
        sessionStorage.setItem('nexora_splash_seen', '1');
      } catch (_) {}
      setTimeout(() => setShowLoader(false), 500);
    };
    const tmr = setTimeout(done, reduce ? 180 : 1200);
    return () => clearTimeout(tmr);
  }, [showLoader]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (window.scrollY / max) * 100 : 0);
      const ids = ['top', 'projects', 'demos', 'about', 'services', 'workflow', 'skills', 'news', 'reviews', 'faq', 'contact'];
      let current = 'top';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 120) current = id;
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = starsRef.current;
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < 80; i++) {
      const s = document.createElement('i');
      s.style.left = `${Math.random() * 100}%`;
      s.style.top = `${Math.random() * 100}%`;
      s.style.setProperty('--d', `${1.2 + Math.random() * 3}s`);
      s.style.setProperty('--s', `${0.6 + Math.random() * 1.8}px`);
      el.appendChild(s);
    }
  }, []);

  useEffect(() => {
    if (chatOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatTyping, chatOpen]);

  useEffect(() => {
    // Visual-only: keep GAS loadReviews wiring. Live cards go in #reviews-container;
    // static real reviews are fallback only when that box is empty.
    const box = document.getElementById('reviews-container');
    const syncCount = () => {
      const n = box ? box.querySelectorAll('.review, .nx-review-card, article').length : 0;
      setLiveReviewCount(n);
    };
    syncCount();
    const mo = box ? new MutationObserver(syncCount) : null;
    if (box && mo) mo.observe(box, { childList: true, subtree: true });

    const install = () => {
      if (window.renderReviews?.__nxSplit) return true;
      const prev = typeof window.renderReviews === 'function' ? window.renderReviews : null;
      const wrapped = function renderReviewsSplit(reviews) {
        const list = Array.isArray(reviews) ? reviews : [];
        if (!list.length) {
          if (box) box.innerHTML = '';
          setLiveReviewCount(0);
          return;
        }
        if (prev) prev(list);
        else setLiveReviewCount(list.length);
      };
      wrapped.__nxSplit = true;
      window.renderReviews = wrapped;
      return true;
    };
    install();
    const id = setInterval(() => {
      if (install()) clearInterval(id);
      syncCount();
    }, 200);
    const stop = setTimeout(() => clearInterval(id), 10000);
    return () => {
      clearInterval(id);
      clearTimeout(stop);
      mo?.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || supportOpen || activeDemo ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, supportOpen, activeDemo]);

  const openOrder = (type) => {
    if (type) {
      setFormType(type);
      const modalType = document.getElementById('modal-type');
      if (modalType) modalType.value = type;
      window.chooseSiteType?.(type, null);
    }
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => formRef.current?.querySelector('input')?.focus(), 400);
  };

  const openReview = () => {
    if (typeof window.openReviewModal === 'function') window.openReviewModal();
    else document.getElementById('reviewModal')?.classList.add('active');
  };

  const copyIban = async () => {
    try {
      await navigator.clipboard.writeText(IBAN);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (_) {}
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
    }, 450);
  };

  const onContactSubmit = (e) => {
    // Visual UI only — keep existing GAS wiring in public/js/main.js
    e.preventDefault();
    if (submitting) return;
    const fd = new FormData(e.target);
    const type = String(fd.get('type') || formType);
    const budget = String(fd.get('budget') || '');
    const timeline = String(fd.get('timeline') || '');
    const idea = String(fd.get('message') || '').trim();
    const typeEl = document.getElementById('order-type');
    if (typeEl) typeEl.value = type;
    const msgEl = document.getElementById('order-message');
    if (msgEl) msgEl.value = `${idea}\n\nBudget: ${budget}\nTimeline: ${timeline}`;
    setSubmitting(true);
    try {
      if (typeof window.submitOrder === 'function') window.submitOrder(e);
      else if (typeof window.sendApplication === 'function') {
        window.sendApplication(
          {
            name: document.getElementById('order-name')?.value?.trim() || '',
            contact: document.getElementById('order-contact')?.value?.trim() || '',
            company: type,
            plan: type,
            message: document.getElementById('order-message')?.value || idea,
          },
          e.target.querySelector('button[type="submit"]')
        );
        e.target.reset();
      }
    } finally {
      setTimeout(() => {
        setSubmitting(false);
        setFormType('Landing Page');
      }, 800);
    }
  };

  const navLinks = [
    ['#top', t.nav.home, 'top'],
    ['#projects', t.nav.projects, 'projects'],
    ['#about', t.nav.advantages, 'about'],
    ['#services', t.nav.services, 'services'],
    ['#news', t.nav.news, 'news'],
    ['#reviews', t.nav.reviews, 'reviews'],
    ['#contact', t.nav.contact, 'contact'],
  ];

  return (
    <div className="nx-root">
      <div className="nx-progress" style={{ width: `${progress}%` }} aria-hidden />

      {showLoader && (
        <div className={`nx-splash ${loaderHide ? 'hide' : ''}`} aria-hidden={loaderHide}>
          <div className="nx-splash-logo">N</div>
          <div className="nx-splash-word">{t.brand}</div>
          <div className="nx-splash-line" />
          <small>{t.loader}</small>
        </div>
      )}

      <div className="nx-space" aria-hidden>
        <div className="nx-nebula n1" />
        <div className="nx-nebula n2" />
        <div className="nx-stars" ref={starsRef} />
      </div>

      <header className={`nx-top ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="nx-container nx-top-inner">
          <a className="nx-logo" href="#top">
            <span className="nx-logo-mark">N</span>
            {t.brand}
          </a>
          <nav className="nx-nav" aria-label="Primary">
            {navLinks.map(([href, label, id]) => (
              <a key={href} href={href} className={activeSection === id ? 'active' : ''}>
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
            <button className="nx-btn nx-btn-primary nx-support-top" type="button" onClick={() => setSupportOpen(true)}>
              {t.supportHeart}
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
        <a href="#demos" onClick={() => setMenuOpen(false)}>
          {t.nav.demos}
        </a>
        <div className="nx-lang nx-lang-block">
          {LANGS.map((l) => (
            <button key={l.code} type="button" className={lang === l.code ? 'active' : ''} onClick={() => setLang(l.code)}>
              {l.label}
            </button>
          ))}
        </div>
        <button className="nx-btn nx-btn-primary nx-btn-block" type="button" onClick={() => { setMenuOpen(false); setSupportOpen(true); }}>
          {t.supportHeart}
        </button>
        <button className="nx-btn nx-btn-ghost nx-btn-block" type="button" onClick={() => { setMenuOpen(false); openOrder(); }}>
          {t.order}
        </button>
      </aside>

      <main id="top">
        <section className="nx-hero nx-hero-mock">
          <div className="nx-container nx-hero-grid">
            <div className="nx-hero-copy">
              <motion.p className="nx-badge" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                {t.badge}
              </motion.p>
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}>
                {t.heroTitleBefore}
                <span>{t.heroTitleAccent}</span>
                {t.heroTitleAfter}
              </motion.h1>
              <motion.p className="nx-lead" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                {t.heroLead}
              </motion.p>
              <motion.div className="nx-hero-actions" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
                <button className="nx-btn nx-btn-primary" type="button" onClick={() => openOrder()}>
                  {t.order}
                </button>
                <a className="nx-btn nx-btn-ghost" href="#projects">
                  {t.viewProjects}
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
            <CrystalOrb />
          </div>
          <a className="nx-scroll-hint" href="#projects">
            {t.scrollHint}
          </a>
        </section>

        <section className="nx-section" id="projects">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head">
                <p className="nx-kicker">{t.projectsKicker}</p>
                <h2>
                  {t.projectsTitleBefore}
                  <span>{t.projectsTitleAccent}</span>
                </h2>
                <p className="nx-lead">{t.projectsLead}</p>
              </div>
            </Reveal>
            <div className="nx-projects nx-projects-row">
              {t.projects.map((p, i) => (
                <Reveal key={p.name} delay={i * 0.06}>
                  <article className="nx-glass nx-project">
                    <div className="nx-project-media">
                      <img src={p.img} alt={p.name} loading="lazy" />
                      <span>{p.tag}</span>
                    </div>
                    <div className="nx-project-body">
                      <h3>{p.name}</h3>
                      <p>{p.text}</p>
                      <div className="nx-tags">
                        {p.tech.map((tag) => (
                          <em key={tag}>{tag}</em>
                        ))}
                      </div>
                      <a className="nx-btn nx-btn-ghost" href={p.href} target="_blank" rel="noreferrer">
                        {t.viewProject}
                      </a>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="nx-section" id="demos">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.demosKicker}</p>
                <h2>{t.demosTitle}</h2>
                <p className="nx-lead">{t.demosLead}</p>
              </div>
            </Reveal>
            <div className="nx-demos">
              {t.demos.map((d, i) => (
                <Reveal key={d.id} delay={i * 0.05}>
                  <article className="nx-glass nx-demo-card">
                    <div className="nx-demo-media">
                      <img src={d.img} alt={d.title} loading="lazy" />
                    </div>
                    <h3>{d.title}</h3>
                    <p>{d.text}</p>
                    <button className="nx-btn nx-btn-primary" type="button" onClick={() => setActiveDemo(d.id)}>
                      {t.openDemo}
                    </button>
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
                <GlowingN />
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div>
                <p className="nx-kicker">{t.aboutKicker}</p>
                <h2>
                  {t.aboutTitleBefore}
                  <span>{t.aboutTitleAccent}</span>
                </h2>
                <p className="nx-lead">{t.aboutText}</p>
                <ul className="nx-about-points rich">
                  {t.aboutPoints.map((p) => (
                    <li key={p.title}>
                      <i className={`fa-solid ${p.icon}`} />
                      <div>
                        <b>{p.title}</b>
                        <span>{p.text}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="nx-section" id="services">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head">
                <p className="nx-kicker">{t.servicesKicker}</p>
                <h2>{t.servicesTitle}</h2>
                <p className="nx-lead">{t.servicesNote}</p>
              </div>
            </Reveal>
            <div className="nx-services">
              {t.services.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.05}>
                  <article className="nx-glass nx-service">
                    <div className="nx-service-icon">
                      <i className={`fa-solid ${s.icon}`} />
                    </div>
                    <h3>{s.title}</h3>
                    <div className="nx-price">{s.price}</div>
                    <ul>
                      {s.items.map((it) => (
                        <li key={it}>{it}</li>
                      ))}
                    </ul>
                    <button className="nx-btn nx-btn-primary nx-btn-block" type="button" onClick={() => openOrder(s.id)}>
                      {t.discuss}
                    </button>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="nx-section" id="workflow">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head center">
                <p className="nx-kicker">{t.workflowKicker}</p>
                <h2>{t.workflowTitle}</h2>
              </div>
            </Reveal>
            <div className="nx-workflow">
              {t.workflow.map((step, i) => (
                <Reveal key={step.n} delay={i * 0.05}>
                  <article className="nx-glass nx-step">
                    <em>{step.n}</em>
                    <h3>{step.title}</h3>
                    <p>{step.text}</p>
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
            <div className="nx-stack-row">
              {t.skills.map((name) => (
                <div key={name} className="nx-glass nx-stack-pill">
                  {name}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="nx-section" id="news">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head">
                <p className="nx-kicker">{t.newsKicker}</p>
                <h2>{t.newsTitle}</h2>
              </div>
            </Reveal>
            <div className="nx-news">
              {t.news.map((n, i) => (
                <Reveal key={n.title} delay={i * 0.05}>
                  <article className="nx-glass nx-news-card">
                    <span>{n.tag}</span>
                    <h3>{n.title}</h3>
                    <p>{n.text}</p>
                  </article>
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
                <h2>{t.reviewsTitle}</h2>
              </div>
            </Reveal>
            {liveReviewCount === 0 && (
              <div className="nx-reviews nx-reviews-fallback">
                {t.demoReviews.map((r) => (
                  <article key={r.title} className="nx-glass nx-review review wm-demo-review">
                    <p>“{r.text}”</p>
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
            )}
            <div className="nx-reviews" id="reviews-container" />
            <div className="nx-center-actions">
              <button className="nx-btn nx-btn-primary" type="button" onClick={openReview}>
                {t.leaveReview}
              </button>
            </div>
          </div>
        </section>

        <section className="nx-section" id="faq">
          <div className="nx-container nx-faq-wrap">
            <Reveal>
              <div className="nx-head">
                <p className="nx-kicker">{t.faqKicker}</p>
                <h2>{t.faqTitle}</h2>
              </div>
            </Reveal>
            <div className="nx-faq">
              {t.faq.map((item, i) => (
                <div key={item.q} className={`nx-glass nx-faq-item ${openFaq === i ? 'open' : ''}`}>
                  <button type="button" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                    <span>{item.q}</span>
                    <i className="fa-solid fa-chevron-down" />
                  </button>
                  {openFaq === i && <p>{item.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="nx-section nx-support-cta" id="support-block">
          <div className="nx-support-landscape" aria-hidden />
          <div className="nx-container">
            <Reveal>
              <div className="nx-support-banner center">
                <h2>{t.supportTitle}</h2>
                <p className="nx-lead">{t.supportLead}</p>
                <button className="nx-btn nx-btn-primary" type="button" onClick={() => setSupportOpen(true)}>
                  {t.supportHeart}
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="nx-section" id="contact">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head">
                <p className="nx-kicker">{t.contactKicker}</p>
                <h2>{t.ctaTitle}</h2>
                <p className="nx-lead">{t.ctaLead}</p>
              </div>
            </Reveal>
            <div className="nx-contact">
              <Reveal>
                <div className="nx-glass nx-contact-card">
                  <a className="nx-contact-link" href="tel:+380995228560">
                    <i className="fa-solid fa-phone" /> 099 522 8560
                  </a>
                  <a className="nx-contact-link" href="tel:+380950761194">
                    <i className="fa-solid fa-phone" /> 095 076 1194
                  </a>
                  <a className="nx-contact-link" href="mailto:nexora.ads111@gmail.com">
                    <i className="fa-solid fa-envelope" /> nexora.ads111@gmail.com
                  </a>
                  <button className="nx-btn nx-btn-ghost nx-btn-block" type="button" onClick={() => setSupportOpen(true)}>
                    {t.supportHeart}
                  </button>
                </div>
              </Reveal>
              <Reveal delay={0.06}>
                <div className="nx-glass nx-contact-form">
                  <h3>{t.formTitle}</h3>
                  <form className="nx-form" id="order-form" ref={formRef} onSubmit={onContactSubmit}>
                    <input name="name" id="order-name" placeholder={t.name} required autoComplete="name" />
                    <input name="contact" id="order-contact" placeholder={t.contact} required />
                    <input id="order-type" type="hidden" value={formType} readOnly />
                    <label>
                      <span>{t.projectType}</span>
                      <select name="type" value={formType} onChange={(e) => setFormType(e.target.value)}>
                        {t.types.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="nx-form-row">
                      <label>
                        <span>{t.budget}</span>
                        <select name="budget" defaultValue={t.budgetOpts[4]}>
                          {t.budgetOpts.map((b) => (
                            <option key={b}>{b}</option>
                          ))}
                        </select>
                      </label>
                      <label>
                        <span>{t.timeline}</span>
                        <select name="timeline" defaultValue={t.timelineOpts[3]}>
                          {t.timelineOpts.map((b) => (
                            <option key={b}>{b}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <textarea name="message" id="order-message" placeholder={t.message} rows={4} />
                    <button className="nx-btn nx-btn-primary nx-btn-block" type="submit" disabled={submitting}>
                      {submitting ? t.sending : t.sendRequest}
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
          <div>
            <a className="nx-logo" href="#top">
              <span className="nx-logo-mark">N</span>
              {t.brand}
            </a>
            <p>{t.footerBlurb}</p>
          </div>
          <div className="nx-footer-links">
            {navLinks.slice(1).map(([href, label]) => (
              <a key={href} href={href}>
                {label}
              </a>
            ))}
          </div>
          <div className="nx-socials">
            <a href="mailto:nexora.ads111@gmail.com" aria-label="Email">
              <i className="fa-solid fa-envelope" />
            </a>
            <a href="tel:+380995228560" aria-label="Phone">
              <i className="fa-solid fa-phone" />
            </a>
            <button type="button" onClick={() => setSupportOpen(true)} aria-label={t.support}>
              <i className="fa-solid fa-heart" />
            </button>
          </div>
        </div>
        <div className="nx-container nx-footer-copy">
          © 2026 {t.brand}. {t.footerCopy}
          <div className="nx-lang">
            {LANGS.map((l) => (
              <button key={l.code} type="button" className={lang === l.code ? 'active' : ''} onClick={() => setLang(l.code)}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </footer>

      <nav className="nx-dock" aria-label="Mobile">
        <a href="#top"><i className="fa-solid fa-house" /></a>
        <a href="#projects"><i className="fa-solid fa-briefcase" /></a>
        <button type="button" className="nx-dock-cta" onClick={() => openOrder()} aria-label={t.order}>
          <i className="fa-solid fa-plus" />
        </button>
        <a href="#demos"><i className="fa-solid fa-play" /></a>
        <button type="button" onClick={() => setSupportOpen(true)} aria-label={t.support}>
          <i className="fa-solid fa-heart" />
        </button>
      </nav>

      <AnimatePresence>
        {supportOpen && (
          <motion.div className="nx-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSupportOpen(false)}>
            <motion.div className="nx-glass nx-support-modal" initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <button className="close" type="button" onClick={() => setSupportOpen(false)} aria-label={t.close}>×</button>
              <h3>{t.supportTitle}</h3>
              <p className="nx-lead">{t.supportLead}</p>
              <a className="nx-support-card" href={MONO_URL} target="_blank" rel="noreferrer">
                <b>{t.monoTitle}</b>
                <span>{t.monoBtn}</span>
              </a>
              <div className="nx-support-card">
                <b>{t.ibanTitle}</b>
                <span>{t.ibanHint}</span>
                <code>{IBAN}</code>
                <button type="button" className="nx-btn nx-btn-ghost" onClick={copyIban}>
                  {copied ? t.copied : t.copy}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeDemo && (
          <motion.div className="demo-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DemoApps
              demoId={activeDemo}
              onClose={() => setActiveDemo(null)}
              labels={{
                desktop: t.demoDeviceDesktop,
                tablet: t.demoDeviceTablet,
                mobile: t.demoDeviceMobile,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`nx-chat ${chatOpen ? 'open' : ''}`}>
        {chatOpen && (
          <div className="nx-glass nx-chat-panel">
            <div className="nx-chat-head">
              <b>{t.chatTitle}</b>
              <button type="button" onClick={() => setChatOpen(false)} aria-label={t.close}>×</button>
            </div>
            <div className="nx-chat-body">
              {messages.map((m, i) => (
                <div key={i} className={`nx-chat-msg ${m.role}`}>{m.text}</div>
              ))}
              {chatTyping && <div className="nx-chat-msg bot typing">•••</div>}
              <div ref={chatEndRef} />
            </div>
            <div className="nx-chat-hints">
              {t.chatHints.map((h) => (
                <button key={h} type="button" onClick={() => sendChat(h)}>{h}</button>
              ))}
            </div>
            <form className="nx-chat-form" onSubmit={(e) => { e.preventDefault(); sendChat(); }}>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={t.chatPlaceholder} />
              <button type="submit" aria-label={t.chatSend}><i className="fa-solid fa-paper-plane" /></button>
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
            <button className="close" type="button" onClick={() => window.closeOrderModal?.()}>×</button>
          </div>
          <form className="wm-form" onSubmit={(e) => { if (typeof window.submitModalOrder === 'function') window.submitModalOrder(e); }}>
            <input id="modal-type" type="hidden" defaultValue="Landing Page" />
            <div className="wm-choice-grid">
              {['Landing Page', 'Business Website', 'Online Store', 'Redesign'].map((type, idx) => (
                <button key={type} className={`wm-choice ${idx === 0 ? 'active' : ''}`} type="button" onClick={(e) => window.chooseSiteType?.(type, e.currentTarget)}>
                  <b>{type}</b>
                </button>
              ))}
            </div>
            <input id="modal-name" placeholder={t.name} required />
            <input id="modal-contact" placeholder={t.contact} required />
            <textarea id="modal-message" placeholder={t.message} />
            <button className="nx-btn nx-btn-primary nx-btn-block" type="submit">{t.sendRequest}</button>
          </form>
        </div>
      </div>

      <div className="modal" id="reviewModal">
        <div className="modal-box nx-glass">
          <div className="modal-head">
            <div>
              <h3>{t.modalReview}</h3>
              <p className="nx-lead" style={{ margin: 0 }}>{t.modalReviewLead}</p>
            </div>
            <button className="close" type="button" onClick={() => window.closeReviewModal?.()}>×</button>
          </div>
          <div className="review-quick-rating" id="ratingStars">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className="star active" onClick={() => window.setRating?.(n)}>★</span>
            ))}
          </div>
          <form className="wm-form" id="review-form">
            <input id="review-type" type="hidden" defaultValue="Создание сайта" />
            <input id="review-name" placeholder={t.name} required />
            <input id="review-title" placeholder="Title" />
            <textarea id="review-text" placeholder={t.message} required rows={3} />
            <div className="wm-form-row">
              <button className="nx-btn nx-btn-ghost" type="button" onClick={() => window.closeReviewModal?.()}>{t.cancel}</button>
              <button className="nx-btn nx-btn-primary" type="submit">{t.send}</button>
            </div>
          </form>
        </div>
      </div>

      <div className="toast" id="toast" />
      <div id="overlay" style={{ display: 'none' }} />
    </div>
  );
}
