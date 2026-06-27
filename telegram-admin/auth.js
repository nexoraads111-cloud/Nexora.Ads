const crypto = require('crypto');

const STATUSES = ['accepted', 'in_progress', 'ready'];
const STATUS_LABELS = {
  accepted: 'Принят',
  in_progress: 'В работе',
  ready: 'Готов',
};

function signToken(payload, secret) {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${sig}`;
}

function verifyToken(token, secret) {
  if (!token || !secret) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (payload.exp && Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function verifyTelegramLogin(data, botToken) {
  const { hash, ...fields } = data;
  if (!hash) return false;
  const check = Object.keys(fields)
    .sort()
    .map((k) => `${k}=${fields[k]}`)
    .join('\n');
  const secret = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secret).update(check).digest('hex');
  return hmac === hash;
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.query.token;
  const secret = process.env.SESSION_SECRET || 'nexora-dev-secret';
  const payload = verifyToken(token, secret);
  if (!payload?.userId) return res.status(401).json({ error: 'unauthorized' });
  req.userId = String(payload.userId);
  req.user = payload;
  next();
}

module.exports = {
  STATUSES,
  STATUS_LABELS,
  signToken,
  verifyToken,
  verifyTelegramLogin,
  authMiddleware,
};
