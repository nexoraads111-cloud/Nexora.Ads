'use client';

import { useEffect, useRef, useState } from 'react';
import { LANGS, dict } from '@/components/i18n';
import NexoraChat from '@/components/NexoraChat';

const MONO_URL = 'https://send.monobank.ua/jar/A5b5mA3d2';
const IBAN = 'SK60 0200 0000 0050 2575 0257';

function useReveal() {
  useEffect(() => {
    const nodes = [...document.querySelectorAll('.reveal')];
    if (!nodes.length) return undefined;
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((n) => n.classList.add('in'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.16 }
    );
    nodes.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);
}

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
  const [reviewIdx, setReviewIdx] = useState(0);
  const [orderBusy, setOrderBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    contact: '',
    type: 'Landing Page',
    budget: '',
    message: '',
  });
  const portfolioRef = useRef(null);
  const reviews = useReviews(t.demoReviews);
  useReveal();

  useEffect(() => {
    document.documentElement.lang = lang === 'uk' ? 'uk' : lang;
  }, [lang]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSupportOpen(false);
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
    if (!form.name.trim() || !form.contact.trim()) return;
    setOrderBusy(true);
    const message = [form.message, form.budget && `Budget: ${form.budget}`].filter(Boolean).join('\n');
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
      setForm({ name: '', contact: '', type: 'Landing Page', budget: '', message: '' });
    } finally {
      window.setTimeout(() => setOrderBusy(false), 600);
    }
  };

  const scrollPortfolio = (dir) => {
    const el = portfolioRef.current;
    if (!el) return;
    const card = el.querySelector('.pf-card');
    const step = (card?.offsetWidth || 340) + 18;
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
    <div className="studio">
      <div className="studio-glow a" aria-hidden />
      <div className="studio-glow b" aria-hidden />
      <div className="studio-waves" aria-hidden />

      <header className="st-header">
        <a className="st-logo" href="#home" aria-label={t.brand}>
          <span className="st-mark">N</span>
          <b>{t.brand}</b>
        </a>
        <nav className={`st-nav ${menuOpen ? 'open' : ''}`}>
          <a href="#home" onClick={() => setMenuOpen(false)}>
            {t.nav.home}
          </a>
          <a href="#services" onClick={() => setMenuOpen(false)}>
            {t.nav.services}
          </a>
          <a href="#portfolio" onClick={() => setMenuOpen(false)}>
            {t.nav.portfolio}
          </a>
          <a href="#about" onClick={() => setMenuOpen(false)}>
            {t.nav.about}
          </a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>
            {t.nav.contact}
          </a>
        </nav>
        <div className="st-actions">
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
            {t.support}
          </button>
          <button type="button" className="btn-primary" onClick={() => openOrder()}>
            {t.orderSite}
          </button>
          <button type="button" className="st-burger" aria-label={t.menu} onClick={() => setMenuOpen((v) => !v)}>
            <span />
            <span />
          </button>
        </div>
      </header>

      <main>
        <section className="st-hero" id="home">
          <div className="hero-copy">
            <h1>{t.heroTitle}</h1>
            <p>{t.heroSub}</p>
            <div className="hero-cta">
              <a className="btn-outline" href="#services">
                {t.viewServices}
              </a>
              <button type="button" className="btn-primary" onClick={() => openOrder()}>
                {t.orderSite}
              </button>
            </div>
          </div>
          <div className="hero-visual" aria-hidden>
            <div className="laptop">
              <div className="laptop-lid">
                <div className="laptop-screen">
                  <div className="fake-site">
                    <div className="fake-bar">
                      <i />
                      <i />
                      <i />
                    </div>
                    <div className="fake-hero" />
                    <div className="fake-rows">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </div>
              <div className="laptop-base" />
            </div>
            <div className="orb" />
          </div>
        </section>

        <section className="st-section" id="services">
          <div className="sec-head reveal">
            <span className="kicker">{t.servicesKicker}</span>
            <h2>{t.servicesTitle}</h2>
          </div>
          <div className="svc-grid">
            {t.services.map((s) => (
              <article key={s.id} className={`svc-card reveal ${s.accent ? 'accent' : ''}`}>
                <div className="svc-top">
                  <span className="num">{s.num}</span>
                  <i className={`fa-solid ${s.icon}`} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <b className="price">{s.price}</b>
                <ul>
                  {s.items.map((it) => (
                    <li key={it}>
                      <i className="fa-solid fa-check" />
                      {it}
                    </li>
                  ))}
                </ul>
                <button type="button" className="btn-primary" onClick={() => openOrder(s.id)}>
                  {s.cta}
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="st-section" id="about">
          <div className="sec-head reveal">
            <span className="kicker">{t.whyKicker}</span>
            <h2>{t.whyTitle}</h2>
          </div>
          <div className="why-grid">
            {t.why.map((w) => (
              <article key={w.title} className="why-card reveal">
                <div className="why-ico">
                  <i className={`fa-solid ${w.icon}`} />
                </div>
                <h3>{w.title}</h3>
                <p>{w.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="st-section" id="portfolio">
          <div className="sec-head row reveal">
            <div>
              <span className="kicker">{t.portfolioKicker}</span>
              <h2>{t.portfolioTitle}</h2>
              <p>{t.portfolioLead}</p>
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
              <article key={p.name} className="pf-card reveal">
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

        <section className="st-section" id="reviews">
          <div className="sec-head row reveal">
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
              <blockquote key={`${r.name}-${i}`} className="rev-card reveal">
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

        <section className="st-section st-contact" id="contact">
          <div className="sec-head reveal">
            <span className="kicker">{t.formKicker}</span>
            <h2>{t.formTitle}</h2>
            <p>{t.formLead}</p>
          </div>
          <form id="order-form" className="order-form reveal" onSubmit={onOrderSubmit}>
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
            <label className="full">
              <span>{t.message}</span>
              <textarea
                id="order-message"
                name="message"
                rows={4}
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
            </label>
            <button type="submit" className="btn-primary" disabled={orderBusy}>
              {orderBusy ? t.sending : t.sendRequest}
            </button>
          </form>
          <div className="contact-row reveal">
            <a href={`mailto:${t.email}`}>{t.email}</a>
            <a href="tel:+380995228560">{t.phone}</a>
            <a href="tel:+380950761194">{t.phone2}</a>
          </div>
        </section>
      </main>

      <footer className="st-footer">
        <div className="foot-brand">
          <a className="st-logo" href="#home">
            <span className="st-mark">N</span>
            <b>{t.brand}</b>
          </a>
          <p>{t.footerBlurb}</p>
        </div>
        <nav>
          <a href="#home">{t.nav.home}</a>
          <a href="#services">{t.nav.services}</a>
          <a href="#portfolio">{t.nav.portfolio}</a>
          <a href="#about">{t.nav.about}</a>
          <a href="#contact">{t.nav.contact}</a>
          <a href="/privacy/">{t.privacy}</a>
        </nav>
        <div className="foot-contacts">
          <a href={`mailto:${t.email}`}>{t.email}</a>
          <a href="tel:+380995228560">{t.phone}</a>
        </div>
        <p className="copy">
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
