'use client';

import { useEffect, useRef, useState } from 'react';
import { aiReply } from '@/components/i18n';

export default function NexoraChat({ t, lang, onOrder }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([]);
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setMessages([{ id: 'hello', role: 'bot', text: t.chatHello }]);
  }, [lang, t.chatHello]);

  useEffect(() => {
    if (!open) return;
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
    inputRef.current?.focus();
  }, [messages, open, busy]);

  const send = (raw) => {
    const text = String(raw ?? input).trim();
    if (!text || busy) return;
    setInput('');
    setMessages((m) => [...m, { id: `${Date.now()}-u`, role: 'user', text }]);
    setBusy(true);
    window.setTimeout(() => {
      setMessages((m) => [...m, { id: `${Date.now()}-b`, role: 'bot', text: aiReply(lang, text) }]);
      setBusy(false);
    }, 320);
  };

  return (
    <div className={`nxc ${open ? 'open' : ''}`}>
      {open && (
        <section className="nxc-panel" aria-label={t.chatTitle}>
          <header className="nxc-head">
            <div className="nxc-id">
              <span className="nxc-dot" />
              <div>
                <strong>{t.chatTitle}</strong>
                <em>{t.chatStatus}</em>
              </div>
            </div>
            <button type="button" className="nxc-x" onClick={() => setOpen(false)} aria-label={t.close}>
              ×
            </button>
          </header>

          <div className="nxc-list" ref={listRef}>
            {messages.map((m) => (
              <div key={m.id} className={`nxc-bubble ${m.role}`}>
                {m.text}
              </div>
            ))}
            {busy && (
              <div className="nxc-bubble bot nxc-typing" aria-hidden>
                <i />
                <i />
                <i />
              </div>
            )}
          </div>

          <div className="nxc-chips">
            {t.chatHints.map((h) => (
              <button key={h} type="button" disabled={busy} onClick={() => send(h)}>
                {h}
              </button>
            ))}
            <button
              type="button"
              className="cta"
              onClick={() => {
                setOpen(false);
                onOrder?.();
              }}
            >
              {t.discussArrow}
            </button>
          </div>

          <form
            className="nxc-form"
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.chatPlaceholder}
              disabled={busy}
            />
            <button type="submit" disabled={busy || !input.trim()} aria-label={t.chatSend}>
              ↑
            </button>
          </form>
        </section>
      )}

      <button type="button" className="nxc-fab" onClick={() => setOpen((v) => !v)} aria-label={t.chatTitle}>
        {open ? '×' : '✦'}
      </button>
    </div>
  );
}
