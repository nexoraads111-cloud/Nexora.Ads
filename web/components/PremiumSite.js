'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { LANGS, dict } from '@/components/i18n';
import DemoApps from '@/components/DemoApps';
import NexoraChat from '@/components/NexoraChat';

const MONO_URL = 'https://send.monobank.ua/24TAxCchRC';
const IBAN = 'SK6002000000005025750257';

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.12, margin: '0px 0px -40px 0px' });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const visible = !mounted || inView;
  return (
    <div ref={ref} className={`nx-reveal ${visible ? 'is-in' : 'is-wait'} ${className}`} style={mounted ? { transitionDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  );
}

function HeroVisual({ growthCard, growthHint }) {
  return (
    <div className="nx-hero-visual" aria-hidden>
      <div className="nx-hero-glow" />
      <div className="nx-hero-arrow" />
      <div className="nx-phone">
        <div className="nx-phone-notch" />
        <div className="nx-phone-screen">
          <img src="/Public/Image/NexoraMobilePreview.png" alt="" />
        </div>
      </div>
      <div className="nx-float-chip meta"><i className="fa-brands fa-meta" /></div>
      <div className="nx-float-chip ig"><i className="fa-brands fa-instagram" /></div>
      <div className="nx-float-chip tt"><i className="fa-brands fa-tiktok" /></div>
      <div className="nx-growth-card">
        <svg viewBox="0 0 120 48" className="nx-sparkline">
          <path d="M4 40 C24 36, 30 20, 48 22 S78 8, 116 6" fill="none" stroke="#a855f7" strokeWidth="3" />
          <path d="M4 40 C24 36, 30 20, 48 22 S78 8, 116 6 L116 48 L4 48 Z" fill="url(#sg)" opacity="0.35" />
          <defs>
            <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
        <b>{growthCard}</b>
        <small>{growthHint}</small>
      </div>
    </div>
  );
}

export default function PremiumSite() {
  const [lang, setLang] = useState('uk');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);
  const [activeSection, setActiveSection] = useState('top');
  const [submitting, setSubmitting] = useState(false);
  const [formType, setFormType] = useState('Landing Page');
  const [liveReviewCount, setLiveReviewCount] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const formRef = useRef(null);

  const t = useMemo(() => dict[lang] || dict.uk, [lang]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexora_lang');
      if (saved && dict[saved]) setLang(saved);
    } catch (_) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('nexora_lang', lang);
    } catch (_) {}
    document.documentElement.lang = lang;
    document.documentElement.setAttribute('data-theme', 'dark');
    document.body.classList.add('nx-premium', 'nx-ads');
    return () => document.body.classList.remove('nx-premium', 'nx-ads');
  }, [lang]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      const ids = ['top', 'offers', 'portfolio', 'demos', 'about', 'pricing', 'reviews', 'contact'];
      let current = 'top';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 110) current = id;
      }
      setActiveSection(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || supportOpen || activeDemo ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen, supportOpen, activeDemo]);

  useEffect(() => {
    const box = document.getElementById('reviews-container');
    const syncCount = () => {
      const n = box ? box.querySelectorAll('.review, .nx-review-card, article').length : 0;
      setLiveReviewCount(n);
    };
    syncCount();
    const mo = box ? new MutationObserver(syncCount) : null;
    if (box && mo) mo.observe(box, { childList: true, subtree: true });
    const install = () => {
      if (window.renderReviews?.__nxAds) return true;
      const prev = typeof window.renderReviews === 'function' ? window.renderReviews : null;
      const wrapped = function renderReviewsAds(reviews) {
        const list = Array.isArray(reviews) ? reviews : [];
        if (!list.length) {
          if (box) box.innerHTML = '';
          setLiveReviewCount(0);
          return;
        }
        if (prev) prev(list);
        else setLiveReviewCount(list.length);
      };
      wrapped.__nxAds = true;
      window.renderReviews = wrapped;
      return true;
    };
    install();
    const id = setInterval(() => {
      install();
      syncCount();
    }, 250);
    const stop = setTimeout(() => clearInterval(id), 10000);
    return () => {
      clearInterval(id);
      clearTimeout(stop);
      mo?.disconnect();
    };
  }, []);

  const openOrder = (type) => {
    if (type) {
      setFormType(type);
      const modalType = document.getElementById('modal-type');
      if (modalType) modalType.value = type;
      window.chooseSiteType?.(type, null);
    }
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => formRef.current?.querySelector('input')?.focus(), 350);
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

  const onContactSubmit = (e) => {
    // Visual UI only — existing GAS wiring in public/js/main.js
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
    ['#offers', t.nav.services, 'offers'],
    ['#portfolio', t.nav.portfolio, 'portfolio'],
    ['#reviews', t.nav.reviews, 'reviews'],
    ['#contact', t.nav.contact, 'contact'],
  ];

  const fallbackReviews = t.demoReviews;
  const shownReview = fallbackReviews[reviewIndex % fallbackReviews.length];

  return (
    <div className="nx-root ads">
      <header className={`nx-header ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="nx-container nx-header-inner">
          <a className="nx-logo" href="#top">
            <span className="nx-logo-mark" aria-hidden>
              <i /><i />
            </span>
            {t.brand}
          </a>
          <nav className="nx-nav" aria-label="Primary">
            {navLinks.map(([href, label, id]) => (
              <a key={href} href={href} className={activeSection === id ? 'active' : ''}>{label}</a>
            ))}
          </nav>
          <div className="nx-header-actions">
            <div className="nx-lang" role="group" aria-label="Language">
              {LANGS.map((l) => (
                <button key={l.code} type="button" className={lang === l.code ? 'active' : ''} onClick={() => setLang(l.code)}>
                  {l.label}
                </button>
              ))}
            </div>
            <button className="nx-btn nx-btn-outline nx-hide-sm" type="button" onClick={() => openOrder()}>
              {t.discussArrow}
            </button>
            <button className="nx-btn nx-btn-ghost nx-hide-sm" type="button" onClick={() => setSupportOpen(true)}>
              {t.support}
            </button>
            <button className="nx-burger" type="button" aria-label={t.menu} onClick={() => setMenuOpen(true)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
      </header>

      <div className={`nx-overlay ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(false)} />
      <aside className={`nx-drawer ${menuOpen ? 'active' : ''}`}>
        <div className="nx-drawer-head">
          <a className="nx-logo" href="#top" onClick={() => setMenuOpen(false)}>
            <span className="nx-logo-mark"><i /><i /></span>
            {t.brand}
          </a>
          <button type="button" className="nx-icon-btn" onClick={() => setMenuOpen(false)} aria-label={t.close}>×</button>
        </div>
        {navLinks.map(([href, label]) => (
          <a key={href} href={href} onClick={() => setMenuOpen(false)}>{label}</a>
        ))}
        <a href="#demos" onClick={() => setMenuOpen(false)}>{t.nav.demos}</a>
        <a href="#pricing" onClick={() => setMenuOpen(false)}>{t.nav.pricing}</a>
        <div className="nx-lang nx-lang-block">
          {LANGS.map((l) => (
            <button key={l.code} type="button" className={lang === l.code ? 'active' : ''} onClick={() => setLang(l.code)}>{l.label}</button>
          ))}
        </div>
        <button className="nx-btn nx-btn-primary nx-btn-block" type="button" onClick={() => { setMenuOpen(false); openOrder(); }}>{t.discussArrow}</button>
        <button className="nx-btn nx-btn-ghost nx-btn-block" type="button" onClick={() => { setMenuOpen(false); setSupportOpen(true); }}>{t.supportHeart}</button>
      </aside>

      <main id="top">
        <section className="nx-hero">
          <div className="nx-container nx-hero-grid">
            <div>
              <motion.p className="nx-badge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{t.badge}</motion.p>
              <motion.h1 initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                {t.heroTitleBefore}<span>{t.heroTitleAccent}</span>
              </motion.h1>
              <motion.p className="nx-lead" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}>
                {t.heroLead}
              </motion.p>
              <motion.div className="nx-hero-actions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                <button className="nx-btn nx-btn-primary" type="button" onClick={() => openOrder()}>{t.discussArrow}</button>
                <a className="nx-btn nx-btn-ghost" href="#offers"><i className="fa-solid fa-play" /> {t.learnMore}</a>
              </motion.div>
            </div>
            <HeroVisual growthCard={t.growthCard} growthHint={t.growthHint} />
          </div>
        </section>

        <section className="nx-section" id="offers">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head">
                <p className="nx-kicker">{t.offerKicker}</p>
                <h2>{t.offerTitle}</h2>
              </div>
            </Reveal>
            <div className="nx-offers">
              {t.offers.map((o, i) => (
                <Reveal key={o.title} delay={i * 0.05}>
                  <article className="nx-offer-card">
                    <div className="nx-offer-icon"><i className={`fa-solid ${o.icon}`} /></div>
                    <h3>{o.title}</h3>
                    <p>{o.text}</p>
                    <a href="#pricing">{t.learnMoreArrow}</a>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="nx-stats-bar">
          <div className="nx-container nx-stats">
            {t.stats.map((s) => (
              <div key={s.label} className="nx-stat">
                <i className={`fa-solid ${s.icon}`} />
                <div>
                  <b>{s.value}</b>
                  <span>{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="nx-section" id="portfolio">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head row">
                <div>
                  <p className="nx-kicker">{t.portfolioKicker}</p>
                  <h2>{t.portfolioTitle}</h2>
                </div>
                <a className="nx-btn nx-btn-outline" href="#demos">{t.viewAllProjects}</a>
              </div>
            </Reveal>
            <div className="nx-portfolio">
              {t.projects.map((p, i) => (
                <Reveal key={p.name} delay={i * 0.05}>
                  <article className="nx-port-card">
                    <div className="nx-port-media">
                      <img src={p.img} alt={p.name} loading="lazy" />
                      <span>{p.tag}</span>
                    </div>
                    <div className="nx-port-body">
                      <h3>{p.name}</h3>
                      <p>{p.text}</p>
                      <a className="nx-btn nx-btn-ghost" href={p.href} target="_blank" rel="noreferrer">{t.viewProject}</a>
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
                  <article className="nx-demo-card">
                    <div className="nx-demo-media"><img src={d.img} alt={d.title} loading="lazy" /></div>
                    <h3>{d.title}</h3>
                    <p>{d.text}</p>
                    <button className="nx-btn nx-btn-primary" type="button" onClick={() => setActiveDemo(d.id)}>{t.openDemo}</button>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="nx-section" id="about">
          <div className="nx-container nx-about">
            <Reveal>
              <div className="nx-about-art">
                <span>N</span>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div>
                <p className="nx-kicker">{t.aboutKicker}</p>
                <h2>{t.aboutTitle}</h2>
                <p className="nx-lead">{t.aboutText}</p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="nx-section" id="pricing">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head">
                <p className="nx-kicker">{t.pricingKicker}</p>
                <h2>{t.pricingTitle}</h2>
                <p className="nx-lead">{t.pricingNote}</p>
              </div>
            </Reveal>
            <div className="nx-pricing">
              {t.services.map((s, i) => (
                <Reveal key={s.id} delay={i * 0.04}>
                  <article className="nx-price-card">
                    <h3>{s.title}</h3>
                    <div className="nx-price">{s.price}</div>
                    <ul>{s.items.map((it) => <li key={it}>{it}</li>)}</ul>
                    <button className="nx-btn nx-btn-primary nx-btn-block" type="button" onClick={() => openOrder(s.id)}>{t.orderService}</button>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="nx-section" id="reviews">
          <div className="nx-container">
            <Reveal>
              <div className="nx-head row">
                <div>
                  <p className="nx-kicker">{t.reviewsKicker}</p>
                  <h2>{t.reviewsTitle}</h2>
                </div>
                {liveReviewCount === 0 && (
                  <div className="nx-review-controls">
                    <button type="button" aria-label="Prev" onClick={() => setReviewIndex((i) => (i - 1 + fallbackReviews.length) % fallbackReviews.length)}>‹</button>
                    <button type="button" aria-label="Next" onClick={() => setReviewIndex((i) => (i + 1) % fallbackReviews.length)}>›</button>
                  </div>
                )}
              </div>
            </Reveal>

            {liveReviewCount === 0 && (
              <div className="nx-reviews nx-reviews-fallback">
                {fallbackReviews.map((r) => (
                  <article key={r.title} className={`nx-review-card review wm-demo-review ${shownReview.title === r.title ? 'focus' : ''}`}>
                    <div className="nx-review-top">
                      <div className="avatar">{r.name[0]}</div>
                      <div>
                        <b>{r.name}</b>
                        <span>{r.title}</span>
                      </div>
                    </div>
                    <div className="nx-stars">★★★★★</div>
                    <p>“{r.text}”</p>
                  </article>
                ))}
              </div>
            )}
            <div className="nx-reviews" id="reviews-container" />
            <div className="nx-center">
              <button className="nx-btn nx-btn-primary" type="button" onClick={openReview}>{t.leaveReview}</button>
            </div>
          </div>
        </section>

        <section className="nx-section">
          <div className="nx-container">
            <Reveal>
              <div className="nx-cta-banner">
                <div className="nx-cta-icon"><i className="fa-solid fa-paper-plane" /></div>
                <h2>{t.ctaBanner}</h2>
                <button className="nx-btn nx-btn-primary" type="button" onClick={() => openOrder()}>{t.contactUs}</button>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="nx-section" id="contact">
          <div className="nx-container nx-contact">
            <Reveal>
              <div className="nx-contact-side">
                <h2>{t.formTitle}</h2>
                <a className="nx-contact-link" href="tel:+380995228560"><i className="fa-solid fa-phone" /> 099 522 8560</a>
                <a className="nx-contact-link" href="tel:+380950761194"><i className="fa-solid fa-phone" /> 095 076 1194</a>
                <a className="nx-contact-link" href="mailto:nexora.ads111@gmail.com"><i className="fa-solid fa-envelope" /> nexora.ads111@gmail.com</a>
                <button className="nx-btn nx-btn-ghost nx-btn-block" type="button" onClick={() => setSupportOpen(true)}>{t.supportHeart}</button>
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <form className="nx-form-card" id="order-form" ref={formRef} onSubmit={onContactSubmit}>
                <input name="name" id="order-name" placeholder={t.name} required autoComplete="name" />
                <input name="contact" id="order-contact" placeholder={t.contact} required />
                <input id="order-type" type="hidden" value={formType} readOnly />
                <label>
                  <span>{t.projectType}</span>
                  <select name="type" value={formType} onChange={(e) => setFormType(e.target.value)}>
                    {t.types.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </label>
                <div className="nx-form-row">
                  <label>
                    <span>{t.budget}</span>
                    <select name="budget" defaultValue={t.budgetOpts[4]}>
                      {t.budgetOpts.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </label>
                  <label>
                    <span>{t.timeline}</span>
                    <select name="timeline" defaultValue={t.timelineOpts[3]}>
                      {t.timelineOpts.map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </label>
                </div>
                <textarea name="message" id="order-message" placeholder={t.message} rows={4} />
                <button className="nx-btn nx-btn-primary nx-btn-block" type="submit" disabled={submitting}>
                  {submitting ? t.sending : t.sendRequest}
                </button>
              </form>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="nx-footer">
        <div className="nx-container nx-footer-top">
          <a className="nx-logo" href="#top">
            <span className="nx-logo-mark"><i /><i /></span>
            {t.brand}
          </a>
          <div className="nx-footer-links">
            {navLinks.map(([href, label]) => <a key={href} href={href}>{label}</a>)}
          </div>
          <div className="nx-socials">
            <a href="mailto:nexora.ads111@gmail.com" aria-label="Email"><i className="fa-solid fa-envelope" /></a>
            <a href="tel:+380995228560" aria-label="Phone"><i className="fa-solid fa-phone" /></a>
            <button type="button" onClick={() => setSupportOpen(true)} aria-label={t.support}><i className="fa-solid fa-heart" /></button>
          </div>
        </div>
        <div className="nx-container nx-footer-bottom">
          <p>{t.footerBlurb}</p>
          <span>© 2026 {t.brand}. {t.footerCopy}</span>
          <div className="nx-lang">
            {LANGS.map((l) => (
              <button key={l.code} type="button" className={lang === l.code ? 'active' : ''} onClick={() => setLang(l.code)}>{l.label}</button>
            ))}
          </div>
        </div>
      </footer>

      <nav className="nx-dock" aria-label="Mobile">
        <a href="#top"><i className="fa-solid fa-house" /></a>
        <a href="#portfolio"><i className="fa-solid fa-briefcase" /></a>
        <button type="button" className="nx-dock-cta" onClick={() => openOrder()} aria-label={t.discuss}><i className="fa-solid fa-plus" /></button>
        <a href="#demos"><i className="fa-solid fa-play" /></a>
        <button type="button" onClick={() => setSupportOpen(true)} aria-label={t.support}><i className="fa-solid fa-heart" /></button>
      </nav>

      <NexoraChat t={t} lang={lang} onOrder={() => openOrder()} />

      <AnimatePresence>
        {supportOpen && (
          <motion.div className="nx-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSupportOpen(false)}>
            <motion.div className="nx-support-modal" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.stopPropagation()}>
              <button className="close" type="button" onClick={() => setSupportOpen(false)} aria-label={t.close}>×</button>
              <h3>{t.supportTitle}</h3>
              <p>{t.supportLead}</p>
              <a className="nx-support-card" href={MONO_URL} target="_blank" rel="noreferrer">
                <b>{t.monoTitle}</b><span>{t.monoBtn}</span>
              </a>
              <div className="nx-support-card">
                <b>{t.ibanTitle}</b><span>{t.ibanHint}</span>
                <code>{IBAN}</code>
                <button type="button" className="nx-btn nx-btn-ghost" onClick={copyIban}>{copied ? t.copied : t.copy}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeDemo && (
          <motion.div className="demo-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DemoApps demoId={activeDemo} onClose={() => setActiveDemo(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="modal" id="orderModal">
        <div className="modal-box">
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
        <div className="modal-box">
          <div className="modal-head">
            <div>
              <h3>{t.modalReview}</h3>
              <p style={{ margin: 0, color: 'var(--muted)' }}>{t.modalReviewLead}</p>
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
