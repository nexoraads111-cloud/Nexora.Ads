require('dotenv').config();
const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const fb = require('./firebase-db');
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
  const idx = STATUSES.indexOf(current);
  const next = STATUSES[Math.min(idx + 1, STATUSES.length - 1)];
  const buttons = [];
  if (idx < STATUSES.length - 1) {
    buttons.push({ text: `→ ${STATUS_LABELS[next]}`, callback_data: `status:${orderId}:${next}` });
  }
  buttons.push({ text: '✅ Готов', callback_data: `status:${orderId}:ready` });
  return { reply_markup: { inline_keyboard: [buttons] } };
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
  ].join('\n');
}

const loginSessionsMem = new Map();

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
  const existing = await fb.getUser(userId);
  const merged = { ...(existing || {}), ...profile };
  if (!merged.phone) merged.phone = existing?.phone || (from.username ? `@${from.username}` : '');
  await fb.saveUser(userId, merged);
  const token = signToken({ userId, name: merged.name, exp: Date.now() + 30 * 86400000 }, SESSION_SECRET);
  return { token, user: merged };
}

async function completeLoginSession(sessionId, from) {
  const { token, user } = await buildUserFromTelegram(from);
  const session = { status: 'ok', token, user, telegramId: from.id, completedAt: Date.now() };
  loginSessionsMem.set(sessionId, session);
  await fb.saveLoginSession(sessionId, session).catch(() => {});
  return { token, user };
}

async function createOrder(body, userId = null) {
  const id = `o_${Date.now()}`;
  const order = {
    id,
    userId: userId ? String(userId) : body.userId ? String(body.userId) : null,
    name: body.name || 'Клиент',
    contact: body.contact || '',
    plan: body.plan || body.company || 'Заявка',
    message: body.message || body.text || '',
    status: 'accepted',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await fb.saveOrder(id, order);
  notifyAdmin(formatOrderNotify(order), statusKeyboard(id, order.status));
  return order;
}

if (bot) {
  bot.onText(/\/start(?:\s+(.+))?/, async (msg, match) => {
    const payload = (match[1] || '').trim();
    const chatId = msg.chat.id;

    if (payload.startsWith('login_')) {
      const sessionId = payload.slice(6);
      try {
        const mem = loginSessionsMem.get(sessionId);
        const fbSess = mem || (await fb.getLoginSession(sessionId));
        if (!fbSess || fbSess.status === 'expired') {
          return bot.sendMessage(chatId, '❌ Сессия истекла. Вернитесь на сайт и нажмите «Войти» снова.');
        }
        const { token, user } = await completeLoginSession(sessionId, msg.from);
        await bot.sendMessage(
          chatId,
          `✅ Вход выполнен, ${user.name}!\n\nВернитесь на сайт — кабинет откроется автоматически.\n\nИли нажмите кнопку ниже:`,
          {
            reply_markup: {
              inline_keyboard: [[
                { text: '📂 Открыть кабинет', url: `${SITE_URL}/cabinet.html?token=${encodeURIComponent(token)}` },
              ]],
            },
          }
        );
      } catch (e) {
        console.error('login session', e);
        bot.sendMessage(chatId, '❌ Ошибка входа. Попробуйте снова с сайта.');
      }
      return;
    }

    bot.sendMessage(
      chatId,
      `👋 NexoraWeb\n\n🔐 Войти в кабинет:\n${SITE_URL}/cabinet.html\n\n📋 /orders — мои заказы`
    );
  });

  bot.onText(/\/orders/, async (msg) => {
    const orders = await fb.listUserOrders(msg.from.id);
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
    bot.sendMessage(msg.chat.id, `📋 Ваши заказы:\n\n${text}\n\n${SITE_URL}/cabinet.html`);
  });

  bot.on('callback_query', async (cq) => {
    try {
      if (String(cq.from?.id) !== ADMIN_ID) {
        return bot.answerCallbackQuery(cq.id, { text: 'Нет доступа' });
      }
      const [action, orderId, status] = (cq.data || '').split(':');
      if (action !== 'status' || !orderId) return;

      const order = await fb.getOrder(orderId);
      if (!order) return bot.answerCallbackQuery(cq.id, { text: 'Не найден' });

      order.status = status;
      order.updatedAt = Date.now();
      await fb.saveOrder(orderId, order);

      if (order.userId) {
        bot.sendMessage(
          order.userId,
          `📦 Заказ «${order.plan}»\nСтатус: ${STATUS_LABELS[status] || status}`
        );
      }

      bot.editMessageText(`✅ ${STATUS_LABELS[status]}: ${order.plan}`, {
        chat_id: cq.message.chat.id,
        message_id: cq.message.message_id,
      });
      bot.answerCallbackQuery(cq.id, { text: STATUS_LABELS[status] });
    } catch (e) {
      console.error('callback', e);
      bot.answerCallbackQuery(cq.id, { text: 'Ошибка' });
    }
  });
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    bot: Boolean(BOT_TOKEN),
    firebase: fb.useRemote() ? 'cloud' : 'local',
    botUsername: BOT_USERNAME,
  });
});

app.post('/api/auth/session', async (req, res) => {
  try {
    const sessionId = newSessionId();
    const session = { status: 'pending', createdAt: Date.now(), expiresAt: Date.now() + 10 * 60 * 1000 };
    loginSessionsMem.set(sessionId, session);
    await fb.saveLoginSession(sessionId, session).catch(() => {});
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
    let session = loginSessionsMem.get(sessionId);
    if (!session) session = await fb.getLoginSession(sessionId);
    if (!session) return res.json({ status: 'pending' });
    if (session.expiresAt && Date.now() > session.expiresAt && session.status !== 'ok') {
      return res.json({ status: 'expired' });
    }
    if (session.status === 'ok') {
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

    const existing = await fb.getUser(userId);
    const merged = { ...(existing || {}), ...profile };
    if (!merged.phone) merged.phone = existing?.phone || '';
    await fb.saveUser(userId, merged);

    const token = signToken({ userId, name: merged.name, exp: Date.now() + 30 * 86400000 }, SESSION_SECRET);
    res.json({ ok: true, token, user: merged });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/profile', authMiddleware, async (req, res) => {
  const profile = await fb.getUser(req.userId);
  res.json(profile || { userId: req.userId });
});

app.patch('/api/profile', authMiddleware, async (req, res) => {
  const existing = (await fb.getUser(req.userId)) || { userId: req.userId };
  const updated = {
    ...existing,
    name: req.body.name ?? existing.name,
    phone: req.body.phone ?? existing.phone,
    contact: req.body.contact ?? existing.contact,
    updatedAt: Date.now(),
  };
  await fb.saveUser(req.userId, updated);
  res.json(updated);
});

app.get('/api/orders', authMiddleware, async (req, res) => {
  const orders = await fb.listUserOrders(req.userId);
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
    const original = await fb.getOrder(req.body.orderId);
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
  console.log(fb.useRemote() ? '🔥 Firebase cloud' : '📁 Local data/firebase-store.json');
});
