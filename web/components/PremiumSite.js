'use client';

import { useEffect, useRef, useState } from 'react';
import { LANGS, dict } from '@/components/i18n';
import DemoGallery from '@/components/DemoGallery';
import NexoraChat from '@/components/NexoraChat';

const MONO_URL = 'https://send.monobank.ua/jar/A5b5mA3d2';
const IBAN = 'SK60 0200 0000 0050 2575 0257';

function useReviews(fallback) {
  const [items, setItems] = useState(fallback);
  useEffect(() => {
    setItems(fallback);
  }, [fallback]);

  useEffect(() => {
    const sync = () => {
      const root = document.getElementById('reviews-container');
      if (!root) return;
      const cards = [...root.querySelectorAll('.review-card, [data-review], article')];
      const parsed = cards
        .map((card) => {
          const text =
            card.querySelector('.review-text, p, blockquote')?.textContent?.trim() ||
            card.textContent?.trim() ||
            '';
          const name =
            card.querySelector('.review-name, .author, strong, h4, h3')?.textContent?.trim() ||
            'Client';
          const title = card.querySelector('.review-role, .role, small, span')?.textContent?.trim() || '';
          return text.length > 20 ? { text: text.slice(0, 280), name, title } : null;
        })
        .filter(Boolean);
      if (parsed.length) setItems(parsed);
    };

    const obs = new MutationObserver(sync);
    const boot = () => {
      const root = document.getElementById('reviews-container');
      if (root) {
        obs.observe(root, { childList: true, subtree: true });
        sync();
      }
    };
    boot();
    const t = window.setTimeout(boot, 800);
    return () => {
      obs.disconnect();
      window.clearTimeout(t);
    };
  }, []);

  return items;
}

export default function PremiumSite() {
  const [lang, setLang] = useState('uk');
  const t = dict[lang] || dict.uk;
  const [menuOpen, setMenuOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeDemo, setActiveDemo] = useState(null);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [orderBusy, setOrderBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    contact: '',
    type: 'Landing Page',
    budget: '',
    timeline: '',
    message: '',
  });
  const portfolioRef = useRef(null);
  const reviews = useReviews(t.demoReviews);

  useEffect(() => {
    document.documentElement.lang = lang === 'uk' ? 'uk' : lang;
  }, [lang]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSupportOpen(false);
        setActiveDemo(null);
        setMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const openOrder = (type) => {
    if (type) setForm((f) => ({ ...f, type }));
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => document.getElementById('order-name')?.focus(), 350);
  };

  const openReview = () => {
    if (typeof window.openReviewModal === 'function') window.openReviewModal();
    else document.getElementById('reviewModal')?.classList.add('active');
  };

  const copyIban = async () => {
    try {
      await navigator.clipboard.writeText(IBAN.replace(/\s/g, ''));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  const onOrderSubmit = (e) => {
    e.preventDefault();
    if (orderBusy) return;
    setOrderBusy(true);
    const message = [form.message, form.budget && `Budget: ${form.budget}`, form.timeline && `Timeline: ${form.timeline}`]
      .filter(Boolean)
      .join('\n');
    const msgEl = document.getElementById('order-message');
    if (msgEl) msgEl.value = message;
    try {
      if (typeof window.submitOrder === 'function') window.submitOrder(e);
      else if (typeof window.sendApplication === 'function') {
        window.sendApplication(
          { name: form.name, contact: form.contact, company: form.type, message },
          e.currentTarget.querySelector('button[type="submit"]')
        );
      }
      setForm({ name: '', contact: '', type: 'Landing Page', budget: '', timeline: '', message: '' });
    } finally {
      window.setTimeout(() => setOrderBusy(false), 600);
    }
  };

  const scrollPortfolio = (dir) => {
    const el = portfolioRef.current;
    if (!el) return;
    const card = el.querySelector('.pf-card');
    const step = (card?.offsetWidth || 320) + 18;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const visibleReviews = () => {
    if (!reviews.length) return [];
    const out = [];
    for (let i = 0; i < Math.min(3, reviews.length); i += 1) {
      out.push(reviews[(reviewIdx + i) % reviews.length]);
    }
    return out;
  };

  return (
    <div className="ads-page">
      <div className="ads-glow ads-glow-a" aria-hidden />
      <div className="ads-glow ads-glow-b" aria-hidden />

      <header className="ads-header">
        <a className="ads-logo" href="#home" aria-label={t.brand}>
          <span className="ads-mark">N</span>
          <b>{t.brand}</b>
        </a>
        <nav className={`ads-nav ${menuOpen ? 'open' : ''}`}>
          <a href="#home" onClick={() => setMenuOpen(false)}>
            {t.nav.home}
          </a>
          <a href="#services" onClick={() => setMenuOpen(false)}>
            {t.nav.services}
          </a>
          <a href="#portfolio" onClick={() => setMenuOpen(false)}>
            {t.nav.portfolio}
          </a>
          <a href="#reviews" onClick={() => setMenuOpen(false)}>
            {t.nav.reviews}
          </a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>
            {t.nav.contact}
          </a>
        </nav>
        <div className="ads-actions">
          <div className="lang-switch" role="group" aria-label="Language">
            {LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                className={lang === l.code ? 'on' : ''}
                onClick={() => setLang(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button type="button" className="btn-ghost" onClick={() => setSupportOpen(true)}>
            {t.supportHeart}
          </button>
          <button type="button" className="btn-outline" onClick={() => openOrder()}>
            {t.discussArrow}
          </button>
          <button
            type="button"
            className="ads-burger"
            aria-label={t.menu}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} />
          </button>
        </div>
      </header>

      <main>
        <section className="ads-hero" id="home">
          <div className="hero-copy">
            <span className="pill">{t.badge}</span>
            <h1>
              {t.heroTitleBefore}
              <span className="grad">{t.heroTitleAccent}</span>
            </h1>
            <p>{t.heroLead}</p>
            <div className="hero-cta">
              <button type="button" className="btn-primary" onClick={() => openOrder()}>
                {t.discussArrow}
              </button>
              <a className="btn-play" href="#services">
                <span className="play">
                  <i className="fa-solid fa-play" />
                </span>
                {t.learnMore}
              </a>
            </div>
          </div>
          <div className="hero-visual" aria-hidden>
            <div className="hero-terrain" />
            <div className="hero-arrow" />
            <div className="phone-frame">
              <div className="phone-screen">
                <div className="soc meta">
                  <i className="fa-brands fa-meta" />
                </div>
                <div className="soc ig">
                  <i className="fa-brands fa-instagram" />
                </div>
                <div className="soc tt">
                  <i className="fa-brands fa-tiktok" />
                </div>
              </div>
            </div>
            <div className="growth-card">
              <svg viewBox="0 0 120 48" className="growth-chart" aria-hidden>
                <path d="M4 40 C28 36, 40 28, 58 22 S92 8, 116 6" fill="none" stroke="url(#g)" strokeWidth="3" />
                <defs>
                  <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#38bdf8" />
                  </linearGradient>
                </defs>
              </svg>
              <b>{t.growthCard}</b>
            </div>
          </div>
        </section>

        <section className="ads-services" id="services">
          <div className="sec-head">
            <div>
              <span className="kicker">{t.servicesKicker}</span>
              <h2>{t.servicesTitle}</h2>
              <p>{t.servicesLead}</p>
            </div>
            <a className="text-link" href="#contact">
              {t.workAnyScale}
            </a>
          </div>
          <div className="offer-grid">
            {t.offers.map((o) => (
              <article key={o.title} className="offer-card">
                <div className="offer-icon">
                  <i className={`fa-solid ${o.icon}`} />
                </div>
                <h3>{o.title}</h3>
                <p>{o.text}</p>
                <button type="button" className="text-link" onClick={() => openOrder()}>
                  {t.learnMoreArrow}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="ads-stats" aria-label="Stats">
          {t.stats.map((s) => (
            <div key={s.label} className="stat">
              <i className={`fa-solid ${s.icon}`} />
              <div>
                <b>{s.value}</b>
                <span>{s.label}</span>
              </div>
            </div>
          ))}
          <div className="stats-rings" aria-hidden />
        </section>

        <section className="ads-portfolio" id="portfolio">
          <div className="sec-head">
            <div>
              <span className="kicker">{t.portfolioKicker}</span>
              <h2>{t.portfolioTitle}</h2>
            </div>
          </div>
          <div className="pf-row">
            <div className="pf-track" ref={portfolioRef}>
              {t.projects.map((p, i) => (
                <article key={p.name} className={`pf-card ${i === 0 ? 'wide' : ''} ${p.name === 'Nexora' ? 'brand' : ''}`}>
                  <div className="pf-media">
                    <img src={p.img} alt={p.name} loading="lazy" />
                  </div>
                  <div className="pf-meta">
                    <span>{p.tag}</span>
                    <h3>{p.name}</h3>
                    <p>{p.text}</p>
                    <a href={p.href} target="_blank" rel="noopener noreferrer">
                      {t.viewProject} →
                    </a>
                  </div>
                </article>
              ))}
            </div>
            <button type="button" className="pf-next" onClick={() => scrollPortfolio(1)} aria-label="Next projects">
              <i className="fa-solid fa-arrow-right" />
            </button>
            <button type="button" className="pf-prev" onClick={() => scrollPortfolio(-1)} aria-label="Previous projects">
              <i className="fa-solid fa-arrow-left" />
            </button>
          </div>
        </section>

        <section className="ads-demos" id="demos">
          <div className="sec-head">
            <div>
              <span className="kicker">{t.demosKicker}</span>
              <h2>{t.demosTitle}</h2>
              <p>{t.demosLead}</p>
            </div>
          </div>
          <div className="demo-grid">
            {t.demos.map((d) => (
              <article key={d.id} className="demo-card">
                <div className="demo-media">
                  <img src={d.img} alt={d.title} loading="lazy" />
                </div>
                <div className="demo-meta">
                  <h3>{d.title}</h3>
                  <p>{d.text}</p>
                  <button type="button" className="btn-primary" onClick={() => setActiveDemo(d.id)}>
                    {t.openDemo}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="ads-about" id="about">
          <div className="about-card">
            <div className="about-avatar">
              <img src="/Public/Image/about-avatar.jpg" alt={t.aboutTitle} width={160} height={160} />
            </div>
            <div>
              <span className="kicker">{t.aboutKicker}</span>
              <h2>{t.aboutTitle}</h2>
              <p>{t.aboutText}</p>
            </div>
          </div>
        </section>

        <section className="ads-pricing" id="pricing">
          <div className="sec-head">
            <div>
              <span className="kicker">{t.pricingKicker}</span>
              <h2>{t.pricingTitle}</h2>
              <p>{t.pricingNote}</p>
            </div>
          </div>
          <div className="price-grid">
            {t.services.map((s) => (
              <article key={s.id} className="price-card">
                <h3>{s.title}</h3>
                <b>{s.price}</b>
                <ul>
                  {s.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
                <button type="button" className="btn-outline" onClick={() => openOrder(s.id)}>
                  {t.orderService}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="ads-reviews" id="reviews">
          <div className="sec-head row">
            <div>
              <span className="kicker">{t.reviewsKicker}</span>
              <h2>{t.reviewsTitle}</h2>
            </div>
            <div className="rev-controls">
              <button
                type="button"
                aria-label="Prev"
                onClick={() => setReviewIdx((i) => (i - 1 + reviews.length) % Math.max(reviews.length, 1))}
              >
                ‹
              </button>
              <button type="button" aria-label="Next" onClick={() => setReviewIdx((i) => (i + 1) % Math.max(reviews.length, 1))}>
                ›
              </button>
              <button type="button" className="btn-ghost" onClick={openReview}>
                {t.leaveReview}
              </button>
            </div>
          </div>
          <div className="rev-grid">
            {visibleReviews().map((r, i) => (
              <article key={`${r.name}-${i}`} className="rev-card">
                <div className="rev-top">
                  <div className="rev-avatar" aria-hidden>
                    {(r.name || 'C').slice(0, 1)}
                  </div>
                  <div>
                    <strong>{r.name}</strong>
                    <em>{r.title}</em>
                  </div>
                  <div className="stars" aria-hidden>
                    ★★★★★
                  </div>
                </div>
                <p>{r.text}</p>
              </article>
            ))}
          </div>
          <div id="reviews-container" className="sr-only" aria-hidden="true" />
        </section>

        <section className="ads-cta-banner">
          <div className="cta-inner">
            <div className="cta-ico">
              <i className="fa-solid fa-paper-plane" />
            </div>
            <h2>{t.ctaBanner}</h2>
            <button type="button" className="btn-primary" onClick={() => openOrder()}>
              {t.contactUs}
            </button>
          </div>
        </section>

        <section className="ads-contact" id="contact">
          <div className="sec-head">
            <div>
              <h2>{t.formTitle}</h2>
            </div>
          </div>
          <form id="order-form" className="order-form" onSubmit={onOrderSubmit}>
            <label>
              <span>{t.name}</span>
              <input
                id="order-name"
                name="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              <span>{t.contact}</span>
              <input
                id="order-contact"
                name="contact"
                required
                value={form.contact}
                onChange={(e) => setForm({ ...form, contact: e.target.value })}
              />
            </label>
            <label>
              <span>{t.projectType}</span>
              <select
                id="order-type"
                name="type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {t.types.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t.budget}</span>
              <select value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })}>
                <option value="">—</option>
                {t.budgetOpts.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{t.timeline}</span>
              <select value={form.timeline} onChange={(e) => setForm({ ...form, timeline: e.target.value })}>
                <option value="">—</option>
                {t.timelineOpts.map((x) => (
                  <option key={x} value={x}>
                    {x}
                  </option>
                ))}
              </select>
            </label>
            <label className="full">
              <span>{t.message}</span>
              <textarea
                id="order-message"
                name="message"
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </label>
            <button type="submit" className="btn-primary" disabled={orderBusy}>
              {orderBusy ? t.sending : t.sendRequest}
            </button>
          </form>
        </section>
      </main>

      <footer className="ads-footer">
        <a className="ads-logo" href="#home">
          <span className="ads-mark">N</span>
          <b>{t.brand}</b>
        </a>
        <nav>
          <a href="#home">{t.nav.home}</a>
          <a href="#services">{t.nav.services}</a>
          <a href="#portfolio">{t.nav.portfolio}</a>
          <a href="#reviews">{t.nav.reviews}</a>
          <a href="#contact">{t.nav.contact}</a>
        </nav>
        <div className="soc-row">
          <a href="https://t.me/" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
            <i className="fa-brands fa-telegram" />
          </a>
          <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <i className="fa-brands fa-instagram" />
          </a>
          <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
            <i className="fa-brands fa-tiktok" />
          </a>
          <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
            <i className="fa-brands fa-youtube" />
          </a>
        </div>
        <p>
          © {new Date().getFullYear()} {t.brand}. {t.footerCopy}
        </p>
      </footer>

      <NexoraChat t={t} lang={lang} onOrder={() => openOrder()} />

      {supportOpen && (
        <div className="modal-backdrop" onClick={() => setSupportOpen(false)}>
          <div className="support-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <button type="button" className="modal-x" onClick={() => setSupportOpen(false)} aria-label={t.close}>
              ×
            </button>
            <h3>{t.supportTitle}</h3>
            <p>{t.supportLead}</p>
            <div className="support-grid">
              <div>
                <h4>{t.monoTitle}</h4>
                <a className="btn-primary" href={MONO_URL} target="_blank" rel="noopener noreferrer">
                  {t.monoBtn}
                </a>
              </div>
              <div>
                <h4>{t.ibanTitle}</h4>
                <p className="iban">{IBAN}</p>
                <small>{t.ibanHint}</small>
                <button type="button" className="btn-outline" onClick={copyIban}>
                  {copied ? t.copied : t.copy}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeDemo && (
        <DemoGallery
          demoId={activeDemo}
          onClose={() => setActiveDemo(null)}
          labels={{ close: t.close, hint: t.galleryHint }}
        />
      )}

      {/* Hidden hooks for GAS scripts — do not remove IDs */}
      <div id="orderModal" className="sr-only" aria-hidden="true" />
      <div id="reviewModal" className="modal-backdrop hidden-modal" aria-hidden="true">
        <div className="support-modal review-modal" role="dialog">
          <button
            type="button"
            className="modal-x"
            onClick={() => {
              if (typeof window.closeReviewModal === 'function') window.closeReviewModal();
              else document.getElementById('reviewModal')?.classList.remove('active');
            }}
            aria-label={t.close}
          >
            ×
          </button>
          <h3>{t.modalReview}</h3>
          <p>{t.modalReviewLead}</p>
          <div className="stars-row" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className="star active"
                onClick={() => typeof window.setRating === 'function' && window.setRating(n)}
              >
                ★
              </button>
            ))}
          </div>
          <input type="hidden" id="review-type" defaultValue="site" />
          <form id="review-form">
            <input id="review-name" name="name" required placeholder={t.name} />
            <input id="review-title" name="title" placeholder="Role / project" />
            <textarea id="review-text" name="text" required rows={4} placeholder={t.message} />
            <button type="submit" className="btn-primary">
              {t.send}
            </button>
          </form>
        </div>
      </div>
      <div id="toast" className="toast" aria-live="polite" />
    </div>
  );
}
