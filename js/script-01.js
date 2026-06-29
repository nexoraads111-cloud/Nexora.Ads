// NexoraWeb — отзывы напрямую из Google Apps Script

const GAS_REVIEWS_URL = (typeof NEXORA_GAS_URL !== 'undefined')
  ? `${NEXORA_GAS_URL}?action=reviews`
  : 'https://script.google.com/macros/s/AKfycbxvE3e_uv8rYURscjC3YJxVmMmTLppuQvpQOzIRsRUI-Ngd5_88gniscbB-P4JlRfs4/exec?action=reviews';

async function loadReviews() {
  const box = document.getElementById('reviews-container');
  try {
    const response = await fetch(GAS_REVIEWS_URL, { cache: 'no-cache' });
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
