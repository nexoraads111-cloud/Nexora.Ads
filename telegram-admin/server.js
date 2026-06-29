require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');
const db = require('./local-db');
const gas = require('./gas-client');
const { STATUSES, STATUS_LABELS } = require('./auth');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = String(process.env.ADMIN_ID || '6057196483');
const BOT_USERNAME = process.env.BOT_USERNAME || 'Nexora_loginbot';
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
    !order.userId ? '\n⚠️ Укажите @telegram в заявке и попросите клиента нажать /start в @Nexora_loginbot' : '',
  ].join('\n');
}

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
  if (status === 'ready') {
    const text = order.siteUrl
      ? `🎉 Ваш сайт готов!\n\nЗаказ: «${order.plan}»\n${order.siteUrl}`
      : `🎉 Ваш сайт готов!\n\nЗаказ: «${order.plan}»`;
    const buttons = order.siteUrl
      ? [[{ text: '🌐 Открыть сайт', url: order.siteUrl }]]
      : [];
    await bot.sendMessage(chatId, text, buttons.length ? { reply_markup: { inline_keyboard: buttons } } : {}).catch((e) => {
      console.warn('notify ready:', e.message);
    });
    return;
  }
  await bot
    .sendMessage(chatId, `📦 Заказ «${order.plan}»\nСтатус: ${STATUS_LABELS[status] || status}`)
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

async function registerTelegramUser(from) {
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
  return merged;
}

async function createOrder(body) {
  const id = `o_${Date.now()}`;
  let resolvedUserId = body.userId ? String(body.userId) : null;
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
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    try {
      await registerTelegramUser(msg.from);
      await bot.sendMessage(
        chatId,
        `👋 NexoraWeb\n\nУкажите @telegram в заявке на сайте — статус заказа придёт сюда.\n\n📋 /orders — мои заказы`
      );
    } catch (e) {
      console.error('start', e);
      bot.sendMessage(chatId, '❌ Ошибка. Попробуйте позже.');
    }
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
    bot.sendMessage(msg.chat.id, `📋 Ваши заказы:\n\n${text}`);
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
