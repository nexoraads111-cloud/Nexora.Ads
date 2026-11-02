'use client';

import { useEffect, useState } from 'react';

const GALLERIES = {
  pcstore: {
    title: 'PC Store — демо',
    slides: [
      '/Public/Image/gallery/gallery-pc-1.jpg',
      '/Public/Image/gallery/gallery-pc-2.jpg',
      '/Public/Image/gallery/gallery-pc-3.jpg',
    ],
  },
  ecommerce: {
    title: 'Premium Store — демо',
    slides: [
      '/Public/Image/gallery/gallery-premium-1.jpg',
      '/Public/Image/gallery/gallery-premium-2.jpg',
      '/Public/Image/gallery/gallery-premium-3.jpg',
    ],
  },
  pizza: {
    title: 'Pizza — демо',
    slides: [
      '/Public/Image/gallery/gallery-pizza-1.jpg',
      '/Public/Image/gallery/gallery-pizza-2.jpg',
      '/Public/Image/gallery/gallery-pizza-3.jpg',
    ],
  },
};

export default function DemoGallery({ demoId, onClose, labels = {} }) {
  const gallery = GALLERIES[demoId];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [demoId]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % (gallery?.slides.length || 1));
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + (gallery?.slides.length || 1)) % (gallery?.slides.length || 1));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [gallery, onClose]);

  if (!gallery) return null;
  const total = gallery.slides.length;
  const src = gallery.slides[index];

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  return (
    <div className="gallery-modal" role="dialog" aria-modal="true" aria-label={gallery.title}>
      <div className="gallery-shell">
        <div className="gallery-top">
          <div>
            <b>{gallery.title}</b>
            <small>
              {index + 1} / {total}
            </small>
          </div>
          <button type="button" className="gallery-close" onClick={onClose} aria-label={labels.close || 'Close'}>
            ×
          </button>
        </div>
        <div className="gallery-stage">
          <button type="button" className="gallery-nav prev" onClick={prev} aria-label="Prev">
            ‹
          </button>
          <img src={src} alt={`${gallery.title} ${index + 1}`} />
          <button type="button" className="gallery-nav next" onClick={next} aria-label="Next">
            ›
          </button>
        </div>
        <div className="gallery-thumbs">
          {gallery.slides.map((s, i) => (
            <button key={s} type="button" className={i === index ? 'active' : ''} onClick={() => setIndex(i)}>
              <img src={s} alt="" />
            </button>
          ))}
        </div>
        <p className="gallery-hint">{labels.hint || 'Гортай фото демо-сайту · ← → · Esc'}</p>
      </div>
    </div>
  );
}
