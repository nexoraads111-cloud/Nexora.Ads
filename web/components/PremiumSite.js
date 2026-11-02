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
      const cards = [...root.querySelectorAll('.review-card, [data-review], article, .nx-review-card')];
      const parsed = cards
        .map((card) => {
          const text =
            card.querySelector('.review-text, p, blockquote')?.textContent?.trim() ||
            card.textContent?.trim() ||
            '';
          const name =
            card.querySelector('.review-name, .author, strong, h4, h3, b')?.textContent?.trim() ||
            'Client';
          const title =
            card.querySelector('.review-role, .role, small, span')?.textContent?.trim() || '';
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
    const step = (card?.offsetWidth || 340) + 20;
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
    <div className="atelier">
      <div className="atelier-noise" aria-hidden />

      <header className="at-header">
        <a className="at-logo" href="#home">
          <span className="at-mark" aria-hidden />
          <b>{t.brand}</b>
        </a>
        <nav className={`at-nav ${menuOpen ? 'open' : ''}`}>
          <a href="#work" onClick={() => setMenuOpen(false)}>
            {t.nav.work}
          </a>
          <a href="#offer" onClick={() => setMenuOpen(false)}>
            {t.nav.offer}
          </a>
          <a href="#demos" onClick={() => setMenuOpen(false)}>
            {t.nav.demos}
          </a>
          <a href="#reviews" onClick={() => setMenuOpen(false)}>
            {t.nav.reviews}
          </a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>
            {t.nav.contact}
          </a>
        </nav>
        <div className="at-actions">
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
          <button type="button" className="btn-solid" onClick={() => openOrder()}>
            {t.discuss}
          </button>
          <button type="button" className="at-burger" aria-label={t.menu} onClick={() => setMenuOpen((v) => !v)}>
            <span />
            <span />
          </button>
        </div>
      </header>

      <main>
        <section className="at-hero" id="home">
          <div className="hero-media" aria-hidden>
            <img src="/Public/Image/DospretonStav.jpg" alt="" />
            <div className="hero-veil" />
          </div>
          <div className="hero-content">
            <p className="brand-hero">{t.brand}</p>
            <h1>{t.heroLead}</h1>
            <p className="hero-sub">{t.heroSub}</p>
            <div className="hero-cta">
              <button type="button" className="btn-solid" onClick={() => openOrder()}>
                {t.orderNow}
              </button>
              <a className="btn-line" href="#work">
                {t.scrollWork}
              </a>
            </div>
          </div>
          <div className="hero-rail" aria-hidden>
            <span>Landing €150</span>
            <span>Business €300</span>
            <span>Store €600</span>
            <span>Redesign €100</span>
          </div>
        </section>

        <section className="at-section" id="offer">
          <div className="sec-intro">
            <span className="kicker">{t.offerKicker}</span>
            <h2>{t.offerTitle}</h2>
            <p>{t.offerLead}</p>
          </div>
          <div className="offer-list">
            {t.services.map((s, i) => (
              <article key={s.id} className="offer-row">
                <span className="idx">0{i + 1}</span>
                <div className="offer-main">
                  <h3>{s.title}</h3>
                  <ul>
                    {s.items.map((it) => (
                      <li key={it}>{it}</li>
                    ))}
                  </ul>
                </div>
                <b className="price">{s.price}</b>
                <button type="button" className="btn-line" onClick={() => openOrder(s.id)}>
                  {t.orderService}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="at-section" id="work">
          <div className="sec-intro row">
            <div>
              <span className="kicker">{t.workKicker}</span>
              <h2>{t.workTitle}</h2>
              <p>{t.workLead}</p>
            </div>
            <div className="pf-arrows">
              <button type="button" onClick={() => scrollPortfolio(-1)} aria-label="Prev">
                ←
              </button>
              <button type="button" onClick={() => scrollPortfolio(1)} aria-label="Next">
                →
              </button>
            </div>
          </div>
          <div className="pf-track" ref={portfolioRef}>
            {t.projects.map((p) => (
              <article key={p.name} className={`pf-card ${p.name === 'Nexora' ? 'brand' : ''}`}>
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
        </section>

        <section className="at-section" id="demos">
          <div className="sec-intro">
            <span className="kicker">{t.demosKicker}</span>
            <h2>{t.demosTitle}</h2>
            <p>{t.demosLead}</p>
          </div>
          <div className="demo-strip">
            {t.demos.map((d) => (
              <article key={d.id} className="demo-tile">
                <button type="button" className="demo-hit" onClick={() => setActiveDemo(d.id)}>
                  <img src={d.img} alt={d.title} loading="lazy" />
                  <span className="demo-label">
                    <b>{d.title}</b>
                    <em>{t.openDemo}</em>
                  </span>
                </button>
                <p>{d.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="at-section at-about" id="about">
          <div className="about-layout">
            <div className="about-avatar">
              <img src="/Public/Image/about-avatar.jpg" alt={t.aboutTitle} width={200} height={200} />
            </div>
            <div>
              <span className="kicker">{t.aboutKicker}</span>
              <h2>{t.aboutTitle}</h2>
              <p>{t.aboutText}</p>
              <button type="button" className="btn-solid" onClick={() => openOrder()}>
                {t.discuss}
              </button>
            </div>
          </div>
        </section>

        <section className="at-section" id="reviews">
          <div className="sec-intro row">
            <div>
              <span className="kicker">{t.reviewsKicker}</span>
              <h2>{t.reviewsTitle}</h2>
            </div>
            <div className="pf-arrows">
              <button
                type="button"
                aria-label="Prev"
                onClick={() => setReviewIdx((i) => (i - 1 + reviews.length) % Math.max(reviews.length, 1))}
              >
                ←
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={() => setReviewIdx((i) => (i + 1) % Math.max(reviews.length, 1))}
              >
                →
              </button>
              <button type="button" className="btn-ghost" onClick={openReview}>
                {t.leaveReview}
              </button>
            </div>
          </div>
          <div className="rev-grid">
            {visibleReviews().map((r, i) => (
              <blockquote key={`${r.name}-${i}`} className="rev-card">
                <p>“{r.text}”</p>
                <footer>
                  <span className="rev-avatar" aria-hidden>
                    {(r.name || 'C').slice(0, 1)}
                  </span>
                  <div>
                    <strong>{r.name}</strong>
                    <em>{r.title}</em>
                  </div>
                </footer>
              </blockquote>
            ))}
          </div>
          <div id="reviews-container" className="sr-only" aria-hidden="true" />
        </section>

        <section className="at-section at-contact" id="contact">
          <div className="sec-intro">
            <span className="kicker">{t.formKicker}</span>
            <h2>{t.formTitle}</h2>
            <p>{t.formLead}</p>
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
            <button type="submit" className="btn-solid" disabled={orderBusy}>
              {orderBusy ? t.sending : t.sendRequest}
            </button>
          </form>
        </section>
      </main>

      <footer className="at-footer">
        <a className="at-logo" href="#home">
          <span className="at-mark" aria-hidden />
          <b>{t.brand}</b>
        </a>
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
                <a className="btn-solid" href={MONO_URL} target="_blank" rel="noopener noreferrer">
                  {t.monoBtn}
                </a>
              </div>
              <div>
                <h4>{t.ibanTitle}</h4>
                <p className="iban">{IBAN}</p>
                <small>{t.ibanHint}</small>
                <button type="button" className="btn-line" onClick={copyIban}>
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

      <div id="orderModal" className="sr-only" aria-hidden="true" />
      <div id="reviewModal" className="modal-backdrop" aria-hidden="true">
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
            <button type="submit" className="btn-solid">
              {t.send}
            </button>
          </form>
        </div>
      </div>
      <div id="toast" className="toast" aria-live="polite" />
    </div>
  );
}
