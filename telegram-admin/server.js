require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const db = require('./local-db');
const gas = require('./gas-client');
const {
  STATUSES,
  STATUS_LABELS,
  signToken,
  verifyTelegramLogin,
  authMiddleware,
} = require('./auth');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = String(process.env.ADMIN_ID || '6057196483');
const BOT_USERNAME = process.env.BOT_USERNAME || 'Nexora_loginbot';
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me-in-production';
const SITE_URL = (process.env.SITE_URL || 'https://nexoraads.online').replace(/\/$/, '');

let bot;
if (BOT_TOKEN) {
  bot = new TelegramBot(BOT_TOKEN, { polling: true });
  console.log(`🤖 Bot @${BOT_USERNAME} started`);
}

function notifyAdmin(text, opts = {}) {
  if (!bot) return;
  bot.sendMessage(ADMIN_ID, text, opts).catch((e) => console.warn('notify:', e.message));
}

function statusKeyboard(orderId, current) {
  if (current === 'ready') {
    return {
      reply_markup: {
        inline_keyboard: [
          [{ text: '✅ Готов', callback_data: `status:${orderId}:ready` }],
          [{ text: '🔗 Ссылка на сайт', callback_data: `seturl:${orderId}` }],
        ],
      },
    };
  }
  const idx = STATUSES.indexOf(current);
  const next = STATUSES[Math.min(idx + 1, STATUSES.length - 1)];
  const row = [];
  if (idx < STATUSES.length - 1) {
    row.push({ text: `→ ${STATUS_LABELS[next]}`, callback_data: `status:${orderId}:${next}` });
  }
  row.push({ text: '✅ Готов', callback_data: `status:${orderId}:ready` });
  return { reply_markup: { inline_keyboard: [row] } };
}

function formatAdminOrderMessage(order) {
  const lines = [
    formatOrderNotify(order),
    order.siteUrl ? `\n🔗 Сайт: ${order.siteUrl}` : '',
  ];
  return lines.join('');
}

function formatOrderNotify(order) {
  return [
    '🆕 Новый заказ NexoraWeb',
    `ID: ${order.id}`,
    `Клиент: ${order.name || '—'}`,
    `Контакт: ${order.contact || '—'}`,
    `Тариф: ${order.plan || '—'}`,
    `Статус: ${STATUS_LABELS[order.status] || order.status}`,
    '',
    order.message || '—',
    order.userId ? `\nTG user: ${order.userId}` : '',
    !order.userId ? '\n⚠️ Клиент не в боте — попросите нажать Start в @Nexora_loginbot' : '',
  ].join('\n');
}

const loginSessionsMem = new Map();
const pendingSiteUrl = new Map();

function extractTelegramUsername(contact) {
  const m = String(contact || '').match(/@([a-zA-Z0-9_]{5,32})/i);
  return m ? m[1].toLowerCase() : null;
}

function normalizeContact(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/^@/, '');
}

function contactMatchesUser(contact, user) {
  const c = normalizeContact(contact);
  if (!c || !user) return false;
  const username = normalizeContact(user.username);
  const phone = String(user.phone || user.contact || '').replace(/\D/g, '');
  const contactDigits = String(contact || '').replace(/\D/g, '');
  const tgFromContact = extractTelegramUsername(contact);
  if (tgFromContact && username && tgFromContact === username) return true;
  if (username && (c === username || c.includes(username))) return true;
  if (phone && contactDigits && contactDigits.includes(phone.slice(-9))) return true;
  return false;
}

async function resolveUserIdFromContact(contact) {
  const tgUser = extractTelegramUsername(contact);
  const users = await db.listAllUsers();
  if (tgUser) {
    const byUsername = users.find((user) => normalizeContact(user.username) === tgUser);
    if (byUsername) return String(byUsername.userId);
  }
  const match = users.find((user) => contactMatchesUser(contact, user));
  return match ? String(match.userId) : null;
}

async function ensureOrderTelegramId(order) {
  if (order.userId) return String(order.userId);
  const fromContact = await resolveUserIdFromContact(order.contact);
  if (fromContact) {
    order.userId = fromContact;
    order.updatedAt = Date.now();
    await db.saveOrder(order.id, order);
    return fromContact;
  }
  return null;
}

async function notifyClientStatus(order, status) {
  if (!bot) return;
  const chatId = await ensureOrderTelegramId(order);
  if (!chatId) {
    console.warn('notify skip: no telegram id', order.id, order.contact);
    return;
  }
  const cabinetUrl = `${SITE_URL}/cabinet`;
  if (status === 'ready') {
    const text = order.siteUrl
      ? `🎉 Ваш сайт готов!\n\nЗаказ: «${order.plan}»\n${order.siteUrl}`
      : `🎉 Ваш сайт готов!\n\nЗаказ: «${order.plan}»`;
    const buttons = [[{ text: '📂 Открыть кабинет', url: cabinetUrl }]];
    if (order.siteUrl) {
      buttons.unshift([{ text: '🌐 Открыть сайт', url: order.siteUrl }]);
    }
    await bot.sendMessage(chatId, text, { reply_markup: { inline_keyboard: buttons } }).catch((e) => {
      console.warn('notify ready:', e.message);
    });
    return;
  }
  await bot
    .sendMessage(chatId, `📦 Заказ «${order.plan}»\nСтатус: ${STATUS_LABELS[status] || status}\n\n${cabinetUrl}`)
    .catch((e) => console.warn('notify status:', e.message));
}

async function linkOrdersToUser(userId, user) {
  const orders = await db.listAllOrders();
  for (const order of orders) {
    if (order.userId) continue;
    const byContact = contactMatchesUser(order.contact, user);
    const byUsername =
      order.contactUsername &&
      user.username &&
      order.contactUsername === normalizeContact(user.username);
    if (byContact || byUsername) {
      order.userId = String(userId);
      order.updatedAt = Date.now();
      await db.saveOrder(order.id, order);
    }
  }
}

function newSessionId() {
  return crypto.randomBytes(8).toString('hex');
}

async function buildUserFromTelegram(from) {
  const userId = String(from.id);
  const profile = {
    userId,
    telegramId: from.id,
    firstName: from.first_name || '',
    lastName: from.last_name || '',
    username: from.username || '',
    name: [from.first_name, from.last_name].filter(Boolean).join(' ') || from.username || 'Клиент',
    createdAt: Date.now(),
  };
  const existing = await db.getUser(userId);
  const merged = { ...(existing || {}), ...profile };
  if (!merged.phone) merged.phone = existing?.phone || (from.username ? `@${from.username}` : '');
  await db.saveUser(userId, merged);
  await linkOrdersToUser(userId, merged);
  const token = signToken({ userId, name: merged.name, exp: Date.now() + 30 * 86400000 }, SESSION_SECRET);
  return { token, user: merged };
}

async function completeLoginSession(sessionId, from) {
  const { token, user } = await buildUserFromTelegram(from);
  const session = { status: 'ok', token, user, telegramId: from.id, completedAt: Date.now() };
  loginSessionsMem.set(sessionId, session);
  await db.saveLoginSession(sessionId, session).catch(() => {});
  return { token, user };
}

async function sendLoginSuccess(chatId, token, user) {
  await bot.sendMessage(chatId, `✅ Вход выполнен, ${user.name}!`, {
    reply_markup: {
      inline_keyboard: [[
        { text: '📂 Открыть кабинет', url: `${SITE_URL}/cabinet/?token=${encodeURIComponent(token)}` },
      ]],
    },
  });
}

async function createOrder(body, userId = null) {
  const id = `o_${Date.now()}`;
  let resolvedUserId = userId ? String(userId) : body.userId ? String(body.userId) : null;
  if (!resolvedUserId && body.contact) {
    resolvedUserId = await resolveUserIdFromContact(body.contact);
  }
  const order = {
    id,
    userId: resolvedUserId,
    name: body.name || 'Клиент',
    contact: body.contact || '',
    contactUsername: extractTelegramUsername(body.contact || ''),
    plan: body.plan || body.company || 'Заявка',
    message: body.message || body.text || '',
    status: 'accepted',
    siteUrl: body.siteUrl || '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await db.saveOrder(id, order);
  notifyAdmin(formatAdminOrderMessage(order), statusKeyboard(id, order.status));
  gas.submitOrder(order).catch((e) => console.warn('GAS order email:', e.message));
  return order;
}

if (bot) {
  bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
    const payload = (match[1] || '').trim();
    const chatId = msg.chat.id;

    if (payload.startsWith('login_')) {
      const sessionId = payload.slice(6);
      try {
        const { token, user } = await completeLoginSession(sessionId, msg.from);
        await sendLoginSuccess(chatId, token, user);
      } catch (e) {
        console.error('login session', e);
        bot.sendMessage(chatId, '❌ Ошибка входа. Нажмите /start cabinet на сайте снова.');
      }
      return;
    }

    if (payload === 'cabinet' || payload === 'login') {
      try {
        const { token, user } = await buildUserFromTelegram(msg.from);
        await sendLoginSuccess(chatId, token, user);
      } catch (e) {
        console.error('cabinet login', e);
        bot.sendMessage(chatId, '❌ Ошибка входа.');
      }
      return;
    }

    bot.sendMessage(chatId, `👋 NexoraWeb\n\n📋 /orders — мои заказы`);
  });

  bot.onText(/\/orders/, async (msg) => {
    const orders = await db.listUserOrders(msg.from.id);
    if (!orders.length) {
      return bot.sendMessage(msg.chat.id, 'Заказов пока нет. Оформите заявку на сайте.');
    }
    const text = orders
      .slice(0, 5)
      .map(
        (o) =>
          `• ${o.plan} — ${STATUS_LABELS[o.status] || o.status}\n  ${new Date(o.createdAt).toLocaleDateString('ru')}`
      )
      .join('\n\n');
    bot.sendMessage(msg.chat.id, `📋 Ваши заказы:\n\n${text}\n\n${SITE_URL}/cabinet`);
  });

  bot.on('callback_query', async (cq) => {
    try {
      if (String(cq.from?.id) !== ADMIN_ID) {
        return bot.answerCallbackQuery(cq.id, { text: 'Нет доступа' });
      }
      const [action, orderId, status] = (cq.data || '').split(':');
      if (action === 'seturl' && orderId) {
        pendingSiteUrl.set(ADMIN_ID, orderId);
        await bot.answerCallbackQuery(cq.id, { text: 'Отправьте ссылку сообщением' });
        await bot.sendMessage(ADMIN_ID, `🔗 Отправьте ссылку на готовый сайт для заказа ${orderId}:`);
        return;
      }
      if (action !== 'status' || !orderId || !status) return;

      const order = await db.getOrder(orderId);
      if (!order) return bot.answerCallbackQuery(cq.id, { text: 'Не найден' });
      if (order.status === status && status === 'ready') {
        return bot.answerCallbackQuery(cq.id, { text: '✅ Уже готов' });
      }

      order.status = status;
      order.updatedAt = Date.now();
      await db.saveOrder(orderId, order);

      await notifyClientStatus(order, status);

      await bot.editMessageText(formatAdminOrderMessage(order), {
        chat_id: cq.message.chat.id,
        message_id: cq.message.message_id,
        reply_markup: statusKeyboard(orderId, status).reply_markup,
      });
      bot.answerCallbackQuery(cq.id, { text: STATUS_LABELS[status] || status });
    } catch (e) {
      console.error('callback', e);
      bot.answerCallbackQuery(cq.id, { text: 'Ошибка' });
    }
  });

  bot.on('message', async (msg) => {
    if (String(msg.from?.id) !== ADMIN_ID) return;
    if (msg.text?.startsWith('/')) return;
    const orderId = pendingSiteUrl.get(ADMIN_ID);
    if (!orderId) return;
    const url = msg.text?.trim();
    if (!url || !/^https?:\/\//i.test(url)) {
      await bot.sendMessage(ADMIN_ID, '❌ Нужна ссылка, например https://example.com');
      return;
    }
    pendingSiteUrl.delete(ADMIN_ID);
    const order = await db.getOrder(orderId);
    if (!order) return;
    order.siteUrl = url;
    order.status = 'ready';
    order.updatedAt = Date.now();
    await db.saveOrder(orderId, order);
    await notifyClientStatus(order, 'ready');
    await bot.sendMessage(ADMIN_ID, `✅ Ссылка сохранена для заказа ${orderId}`);
  });
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    bot: Boolean(BOT_TOKEN),
    storage: db.storage,
    gas: gas.isConfigured(),
    botUsername: BOT_USERNAME,
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

app.post('/api/auth/session', async (req, res) => {
  try {
    const sessionId = newSessionId();
    const session = { status: 'pending', createdAt: Date.now(), expiresAt: Date.now() + 10 * 60 * 1000 };
    loginSessionsMem.set(sessionId, session);
    await db.saveLoginSession(sessionId, session).catch(() => {});
    res.json({
      ok: true,
      sessionId,
      botUrl: `https://t.me/${BOT_USERNAME}?start=login_${sessionId}`,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/auth/session/:id', async (req, res) => {
  try {
    const sessionId = req.params.id;
    const mem = loginSessionsMem.get(sessionId);
    const remote = await db.getLoginSession(sessionId).catch(() => null);
    const session = [mem, remote].find((s) => s?.status === 'ok') || mem || remote;
    if (!session) return res.json({ status: 'pending' });
    if (session.expiresAt && Date.now() > session.expiresAt && session.status !== 'ok') {
      return res.json({ status: 'expired' });
    }
    if (session.status === 'ok') {
      loginSessionsMem.set(sessionId, session);
      return res.json({ status: 'ok', token: session.token, user: session.user });
    }
    res.json({ status: 'pending' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/telegram', async (req, res) => {
  try {
    const data = req.body || {};
    if (!BOT_TOKEN || !verifyTelegramLogin(data, BOT_TOKEN)) {
      return res.status(401).json({ error: 'invalid_telegram_auth' });
    }

    const userId = String(data.id);
    const profile = {
      userId,
      telegramId: data.id,
      firstName: data.first_name || '',
      lastName: data.last_name || '',
      username: data.username || '',
      name: [data.first_name, data.last_name].filter(Boolean).join(' ') || data.username || 'Клиент',
      photoUrl: data.photo_url || '',
      createdAt: Date.now(),
    };

    const existing = await db.getUser(userId);
    const merged = { ...(existing || {}), ...profile };
    if (!merged.phone) merged.phone = existing?.phone || '';
    await db.saveUser(userId, merged);

    const token = signToken({ userId, name: merged.name, exp: Date.now() + 30 * 86400000 }, SESSION_SECRET);
    res.json({ ok: true, token, user: merged });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/profile', authMiddleware, async (req, res) => {
  const profile = await db.getUser(req.userId);
  res.json(profile || { userId: req.userId });
});

app.patch('/api/profile', authMiddleware, async (req, res) => {
  const existing = (await db.getUser(req.userId)) || { userId: req.userId };
  const updated = {
    ...existing,
    name: req.body.name ?? existing.name,
    phone: req.body.phone ?? existing.phone,
    contact: req.body.contact ?? existing.contact,
    updatedAt: Date.now(),
  };
  await db.saveUser(req.userId, updated);
  res.json(updated);
});

app.get('/api/orders', authMiddleware, async (req, res) => {
  const profile = await db.getUser(req.userId);
  if (profile) await linkOrdersToUser(req.userId, profile);
  const orders = await db.listUserOrders(req.userId);
  res.json(orders);
});

app.post('/api/orders', async (req, res) => {
  try {
    let userId = null;
    const header = req.headers.authorization || '';
    if (header.startsWith('Bearer ')) {
      const { verifyToken } = require('./auth');
      const payload = verifyToken(header.slice(7), SESSION_SECRET);
      userId = payload?.userId || null;
    }
    const order = await createOrder(req.body, userId);
    res.json({ ok: true, order });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/orders/repeat', authMiddleware, async (req, res) => {
  try {
    const original = await db.getOrder(req.body.orderId);
    if (!original || String(original.userId) !== req.userId) {
      return res.status(404).json({ error: 'not_found' });
    }
    const order = await createOrder(
      {
        name: original.name,
        contact: original.contact,
        plan: original.plan,
        message: `Повтор заказа: ${original.message || original.plan}`,
      },
      req.userId
    );
    res.json({ ok: true, order });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/send-application', (req, res) => {
  createOrder(req.body)
    .then((order) => res.json({ ok: true, order }))
    .catch((e) => res.status(500).json({ error: e.message }));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Nexora API http://localhost:${PORT}`);
  console.log(`📁 Storage: ${db.storage}`);
  console.log(gas.isConfigured() ? '📧 Google Apps Script connected' : '⚠️ GAS not configured');
});
