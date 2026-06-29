require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const gas = require('./gas-client');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    gas: gas.isConfigured(),
  });
});

app.get('/api/reviews', async (req, res) => {
  try {
    if (!gas.isConfigured()) return res.json([]);
    const reviews = await gas.gasGetReviews();
    res.json(reviews);
  } catch (e) {
    console.error('reviews', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    if (!gas.isConfigured()) {
      return res.status(503).json({ error: 'gas_not_configured' });
    }
    const body = req.body || {};
    const result = await gas.submitReview({
      name: body.name,
      title: body.title,
      text: body.text,
      type: body.type,
      rating: body.rating,
    });
    res.json(result);
  } catch (e) {
    console.error('submit review', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/send-application', async (req, res) => {
  try {
    if (!gas.isConfigured()) {
      return res.status(503).json({ error: 'gas_not_configured' });
    }
    const body = req.body || {};
    const result = await gas.submitOrder({
      name: body.name,
      contact: body.contact,
      plan: body.plan || body.company,
      message: body.message,
    });
    res.json(result);
  } catch (e) {
    console.error('submit application', e);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Nexora API http://localhost:${PORT}`);
  console.log(gas.isConfigured() ? '📧 Google Apps Script connected' : '⚠️ GAS not configured');
});
