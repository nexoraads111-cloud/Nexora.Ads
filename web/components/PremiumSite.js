'use client';

import { useEffect, useRef, useState } from 'react';
import { LANGS, dict } from '@/components/i18n';
import NexoraChat from '@/components/NexoraChat';

const MONO_URL = 'https://send.monobank.ua/jar/A5b5mA3d2';
const IBAN = 'SK60 0200 0000 0050 2575 0257';
const GAS_EXEC =
  'https://script.google.com/macros/s/AKfycbzgkzDQx_eGsSI5vudKtRHmMOqZtqggbxGO4ZOcETjUflIAOpwOxgnLDJd3ioz72FDK/exec';
const BLOCKED_REVIEWS = new Set(['r_1782853940234', 'r_1782835228464']);

function useReveal(lang) {
  useEffect(() => {
    const mark = () => {
      document.querySelectorAll('.reveal').forEach((n) => n.classList.add('in'));
    };
    mark();
    const id = window.requestAnimationFrame(mark);
    if (!('IntersectionObserver' in window)) return () => window.cancelAnimationFrame(id);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '40px 0px' }
    );
    document.querySelectorAll('.reveal').forEach((n) => io.observe(n));
    return () => {
      window.cancelAnimationFrame(id);
      io.disconnect();
    };
  }, [lang]);
}

function normalizeReview(r) {
  const text = String(r?.text || '').trim();
  if (text.length < 8) return null;
  return {
    text: text.slice(0, 420),
    name: String(r?.name || 'Client').trim() || 'Client',
    title: String(r?.title || r?.type || '').trim(),
    rating: Math.max(1, Math.min(5, Number(r?.rating) || 5)),
  };
}

function parseDomReviews(root) {
  if (!root) return [];
  return [...root.querySelectorAll('.nx-review-card, .review-card, article.review, [data-review]')]
    .map((card) => {
      const text =
        card.querySelector('.review-text, p')?.textContent?.trim() ||
        '';
      const name =
        card.querySelector('.wm-review-author b, .review-name, .author, b')?.textContent?.trim() ||
        'Client';
      const title =
        card.querySelector('.wm-review-author span, .review-role, .role')?.textContent?.trim() || '';
      return normalizeReview({ text, name, title });
    })
    .filter(Boolean);
}

function useReviews(fallback) {
  const [items, setItems] = useState(fallback);
  const liveRef = useRef(null);

  useEffect(() => {
    if (liveRef.current?.length) setItems(liveRef.current);
    else setItems(fallback);
  }, [fallback]);

  useEffect(() => {
    let cancelled = false;
    const apply = (list) => {
      const clean = (list || []).map(normalizeReview).filter(Boolean);
      if (!clean.length || cancelled) return;
      liveRef.current = clean;
      setItems(clean);
    };

    const syncDom = () => apply(parseDomReviews(document.getElementById('reviews-container')));

    const obs = new MutationObserver(syncDom);
    const bind = () => {
      const root = document.getElementById('reviews-container');
      if (!root) return false;
      obs.observe(root, { childList: true, subtree: true });
      syncDom();
      return true;
    };
    bind();
    const bootT = window.setTimeout(bind, 600);

    const fetchLive = async (attempt = 0) => {
      try {
        const url =
          (typeof window !== 'undefined' && window.NEXORA_GAS_URL) || GAS_EXEC;
        const res = await fetch(`${url}?action=reviews&_=${Date.now()}`, {
          cache: 'no-store',
          redirect: 'follow',
        });
        const data = JSON.parse(await res.text());
        if (!Array.isArray(data)) throw new Error('bad_format');
        const clean = data
          .filter((x) => !BLOCKED_REVIEWS.has(String(x.id)))
          .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        apply(clean);
      } catch {
        if (!cancelled && attempt < 8) {
          window.setTimeout(() => fetchLive(attempt + 1), 700 + attempt * 250);
        }
      }
    };
    fetchLive();
    const late = window.setTimeout(() => fetchLive(0), 1800);

    return () => {
      cancelled = true;
      obs.disconnect();
      window.clearTimeout(bootT);
      window.clearTimeout(late);
    };
  }, []);

  return items;
}

function readInitialLang() {
  if (typeof window === 'undefined') return 'uk';
  const saved = window.localStorage.getItem('nexora_lang');
  if (saved && dict[saved]) return saved;
  return 'uk';
}

export default function PremiumSite() {
  const [lang, setLang] = useState(readInitialLang);
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
  useReveal(lang);

  const changeLang = (code) => {
    setLang(code);
    try {
      window.localStorage.setItem('nexora_lang', code);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang === 'uk' ? 'uk' : lang;
    try {
      window.localStorage.setItem('nexora_lang', lang);
    } catch {
      /* ignore */
    }
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

      <header className="st-header loved-header">
        <a className="st-logo" href="#home" aria-label="NexoraAds">
          <span className="st-mark">N</span>
          <b>NexoraAds</b>
        </a>
        <nav className={`st-nav loved-nav ${menuOpen ? 'open' : ''}`}>
          <a className="active" href="#home" onClick={() => setMenuOpen(false)}>
            {t.nav.home}
          </a>
          <a href="#features" onClick={() => setMenuOpen(false)}>
            {t.nav.features}
          </a>
          <a href="#services" onClick={() => setMenuOpen(false)}>
            {t.nav.pricing}
          </a>
          <a href="#about" onClick={() => setMenuOpen(false)}>
            {t.nav.about}
          </a>
          <a href="#faq" onClick={() => setMenuOpen(false)}>
            {t.nav.faq}
          </a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>
            {t.nav.contact}
          </a>
        </nav>
        <div className="st-actions loved-actions">
          <div className="lang-switch" role="group" aria-label="Language">
            {LANGS.map((l) => (
              <button
                key={l.code}
                type="button"
                className={lang === l.code ? 'on' : ''}
                onClick={() => changeLang(l.code)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <button type="button" className="theme-sun" aria-label="Theme" tabIndex={-1}>
            <i className="fa-solid fa-sun" />
          </button>
          <button type="button" className="btn-signin" onClick={() => openOrder()}>
            {t.signIn}
          </button>
          <button type="button" className="btn-primary btn-get-started" onClick={() => openOrder()}>
            {t.getStarted}
          </button>
          <button type="button" className="st-burger" aria-label={t.menu} onClick={() => setMenuOpen((v) => !v)}>
            <span />
            <span />
          </button>
        </div>
      </header>

      <main>
        <section className="st-hero loved-hero" id="home">
          <div className="hero-bg" aria-hidden>
            <span className="wave w1" />
            <span className="wave w2" />
            <span className="wave w3" />
          </div>
          <div className="hero-copy">
            <span className="hero-badge loved-badge">
              <span aria-hidden>🚀</span> {t.shellBadge}
            </span>
            <h1>
              <span className="brand-line">{t.shellBrand}</span>
              <span className="grad-line">{t.shellGrow}</span>
              <span className="plain-line">{t.shellSmarter}</span>
            </h1>
            <p>{t.shellSub}</p>
            <div className="hero-cta">
              <button type="button" className="btn-primary btn-start-ads" onClick={() => openOrder()}>
                {t.startAds}
              </button>
              <a className="btn-outline play" href="#features">
                <span className="play-ico" aria-hidden>
                  ▶
                </span>
                {t.learnMore}
              </a>
            </div>
            <div className="social-proof">
              <div className="avatars" aria-hidden>
                <span style={{ background: 'linear-gradient(135deg,#f472b6,#a855f7)' }} />
                <span style={{ background: 'linear-gradient(135deg,#38bdf8,#6366f1)' }} />
                <span style={{ background: 'linear-gradient(135deg,#34d399,#22d3ee)' }} />
                <span style={{ background: 'linear-gradient(135deg,#fbbf24,#f97316)' }} />
                <span style={{ background: 'linear-gradient(135deg,#c084fc,#e879f9)' }} />
              </div>
              <div className="proof-text">
                <b>{t.trustedBy}</b>
                <span className="proof-sep" aria-hidden />
                <span className="stars" aria-hidden>
                  ★★★★★
                </span>
              </div>
            </div>
          </div>
          <div className="hero-visual" aria-hidden>
            <div className="glass-stack loved-dash">
              <div className="glass-panel main-panel dash-panel">
                <div className="panel-body dash-body">
                  <aside className="dash-side">
                    <div className="side-item on">
                      <i className="fa-solid fa-table-cells" />
                      <em>Dashboard</em>
                    </div>
                    <div className="side-item">
                      <i className="fa-solid fa-bullhorn" />
                      <em>Campaigns</em>
                    </div>
                    <div className="side-item">
                      <i className="fa-solid fa-chart-line" />
                      <em>Analytics</em>
                    </div>
                    <div className="side-item">
                      <i className="fa-solid fa-credit-card" />
                      <em>Billing</em>
                    </div>
                    <div className="side-item">
                      <i className="fa-solid fa-gear" />
                      <em>Settings</em>
                    </div>
                  </aside>
                  <div className="mini-main">
                    <div className="dash-head">
                      <strong>Dashboard</strong>
                      <span className="dash-range">
                        Last 30 days <i className="fa-solid fa-chevron-down" />
                      </span>
                    </div>
                    <div className="metric-row">
                      <div className="metric">
                        <small>Total Impressions</small>
                        <b>4.8M</b>
                        <em className="up">+12.5%</em>
                      </div>
                      <div className="metric">
                        <small>Total Clicks</small>
                        <b>320K</b>
                        <em className="up">+18.2%</em>
                      </div>
                      <div className="metric">
                        <small>Conversions</small>
                        <b>48.7K</b>
                        <em className="up">+24.9%</em>
                      </div>
                    </div>
                    <div className="chart-area">
                      <span className="chart-tip">+24.9%</span>
                      <svg viewBox="0 0 240 90" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="rgba(168,85,247,0.65)" />
                            <stop offset="100%" stopColor="rgba(168,85,247,0)" />
                          </linearGradient>
                        </defs>
                        <path
                          d="M0 72 C30 68, 50 40, 80 48 S120 18, 150 28 S190 8, 240 20 L240 90 L0 90 Z"
                          fill="url(#cg)"
                        />
                        <path
                          d="M0 72 C30 68, 50 40, 80 48 S120 18, 150 28 S190 8, 240 20"
                          fill="none"
                          stroke="#c084fc"
                          strokeWidth="2.8"
                        />
                        <circle cx="190" cy="12" r="4" fill="#e879f9" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="glass-panel float-card campaign-card">
                <div className="float-thumb" />
                <div className="camp-body">
                  <div className="camp-top">
                    <strong>Your Campaign</strong>
                    <span className="status">
                      <i /> Active
                    </span>
                  </div>
                  <div className="bar-row">
                    <div className="bar">
                      <i style={{ width: '78%' }} />
                    </div>
                    <small className="pct">78%</small>
                  </div>
                  <div className="camp-foot">
                    <span>4.8M Impressions</span>
                    <span>48.7K Conversions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-features" id="features">
            {t.featItems.map((f) => (
              <div className="hf-item" key={f.title}>
                <div className="hf-ico">
                  <i className={`fa-solid ${f.icon}`} />
                </div>
                <div>
                  <b>{f.title}</b>
                  <span>{f.text}</span>
                </div>
              </div>
            ))}
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
            {visibleReviews().length ? (
              visibleReviews().map((r, i) => (
                <blockquote key={`${r.name}-${r.title}-${i}`} className="rev-card reveal in">
                  {r.rating ? (
                    <div className="rev-stars" aria-hidden>
                      {'★'.repeat(r.rating)}
                      {'☆'.repeat(Math.max(0, 5 - r.rating))}
                    </div>
                  ) : null}
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
              ))
            ) : (
              <p className="rev-empty reveal in">{t.reviewsTitle}…</p>
            )}
          </div>
          {/* Bridge for legacy main.js renderReviews / loadReviews — keep in DOM, visually hidden */}
          <div id="reviews-container" className="sr-only" aria-hidden="true" />
        </section>

        <section className="st-section" id="faq">
          <div className="sec-head reveal in">
            <span className="kicker">FAQ</span>
            <h2>{t.faqTitle}</h2>
          </div>
          <div className="faq-grid">
            {t.faqItems.map(([q, a]) => (
              <article key={q} className="faq-card reveal in">
                <h3>{q}</h3>
                <p>{a}</p>
              </article>
            ))}
          </div>
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
