// NexoraWeb — load approved reviews from API (Google Sheets via Apps Script)

const REVIEWS_API = (typeof NEXORA_API !== 'undefined')
  ? `${NEXORA_API}/reviews`
  : 'https://nexora-cabinet-api.onrender.com/api/reviews';

async function loadReviews() {
  const box = document.getElementById('reviews-container');
  try {
    const response = await fetch(REVIEWS_API, { cache: 'no-cache' });
    if (!response.ok) throw new Error(`Reviews ${response.status}`);
    const reviews = await response.json();
    if (!Array.isArray(reviews)) throw new Error('bad_format');
    reviews.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    window.renderReviews(reviews);
  } catch (err) {
    console.error('Reviews load error', err);
    if (box) {
      box.innerHTML = '<div class="empty">Отзывы временно не загрузились. Попробуйте позже.</div>';
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadReviews);
} else {
  loadReviews();
}
