const GAS_URL = (process.env.GAS_WEB_APP_URL || '').replace(/\/$/, '');
const GAS_SECRET = process.env.GAS_SECRET || '';

function isConfigured() {
  return Boolean(GAS_URL && GAS_SECRET);
}

async function gasPost(action, payload = {}) {
  if (!isConfigured()) {
    console.warn('GAS not configured, skip:', action);
    return { ok: false, skipped: true };
  }
  const res = await fetch(GAS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, secret: GAS_SECRET, ...payload }),
    redirect: 'follow',
  });
  let data = {};
  try {
    data = await res.json();
  } catch (e) {
    throw new Error(`GAS response invalid: ${res.status}`);
  }
  if (!res.ok || data.error) throw new Error(data.error || `GAS ${res.status}`);
  return data;
}

async function gasGetReviews() {
  if (!GAS_URL) return [];
  const res = await fetch(`${GAS_URL}?action=reviews`, { redirect: 'follow' });
  if (!res.ok) throw new Error(`GAS reviews ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function submitReview(review) {
  return gasPost('submitReview', review);
}

async function submitOrder(order) {
  return gasPost('submitOrder', {
    name: order.name,
    contact: order.contact,
    plan: order.plan,
    message: order.message,
  });
}

module.exports = {
  isConfigured,
  gasGetReviews,
  submitReview,
  submitOrder,
};
