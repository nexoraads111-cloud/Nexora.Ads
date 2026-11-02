'use client';

import { useEffect, useRef, useState } from 'react';
import { aiReply } from '@/components/i18n';

export default function NexoraChat({ t, lang, onOrder }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState([]);
  const endRef = useRef(null);

  useEffect(() => {
    setMessages([{ role: 'bot', text: t.chatHello }]);
  }, [lang, t.chatHello]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing, open]);

  const send = (raw) => {
    const text = (raw ?? input).trim();
    if (!text || typing) return;
    setInput('');
    setMessages((m) => [...m, { role: 'user', text }]);
    setTyping(true);
    window.setTimeout(() => {
      const reply = aiReply(lang, text);
      setMessages((m) => [...m, { role: 'bot', text: reply }]);
      setTyping(false);
      if (/замовити|order|обсудить|обговорити|обсудить|discuss|форм/i.test(text)) {
        // gentle nudge only — user decides
      }
    }, 420);
  };

  return (
    <div className={`nx-ai ${open ? 'open' : ''}`}>
      {open && (
        <div className="nx-ai-panel" role="dialog" aria-label={t.chatTitle}>
          <div className="nx-ai-head">
            <div>
              <b>{t.chatTitle}</b>
              <small>Online · rule assistant</small>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label={t.close}>×</button>
          </div>
          <div className="nx-ai-body">
            {messages.map((m, i) => (
              <div key={i} className={`nx-ai-msg ${m.role}`}>{m.text}</div>
            ))}
            {typing && <div className="nx-ai-msg bot typing"><span /><span /><span /></div>}
            <div ref={endRef} />
          </div>
          <div className="nx-ai-hints">
            {t.chatHints.map((h) => (
              <button key={h} type="button" onClick={() => send(h)}>{h}</button>
            ))}
            <button type="button" className="order" onClick={() => { setOpen(false); onOrder?.(); }}>
              {t.discussArrow}
            </button>
          </div>
          <form className="nx-ai-form" onSubmit={(e) => { e.preventDefault(); send(); }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder={t.chatPlaceholder} />
            <button type="submit" aria-label={t.chatSend}><i className="fa-solid fa-paper-plane" /></button>
          </form>
        </div>
      )}
      <button type="button" className="nx-ai-fab" onClick={() => setOpen((v) => !v)} aria-label={t.chatTitle}>
        <i className={`fa-solid ${open ? 'fa-xmark' : 'fa-comments'}`} />
      </button>
    </div>
  );
}
