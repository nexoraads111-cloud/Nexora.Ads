const fs = require('fs');
const path = require('path');

const LOCAL_FILE = path.join(__dirname, 'data', 'store.json');

function ensureLocal() {
  const dir = path.dirname(LOCAL_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(LOCAL_FILE)) {
    fs.writeFileSync(
      LOCAL_FILE,
      JSON.stringify({ users: {}, orders: {}, loginSessions: {} }, null, 2)
    );
  }
}

function readLocal() {
  ensureLocal();
  try {
    return JSON.parse(fs.readFileSync(LOCAL_FILE, 'utf8'));
  } catch {
    return { users: {}, orders: {}, loginSessions: {} };
  }
}

function writeLocal(data) {
  ensureLocal();
  fs.writeFileSync(LOCAL_FILE, JSON.stringify(data, null, 2));
}

function localGet(key) {
  const parts = key.split('/').filter(Boolean);
  let node = readLocal();
  for (const p of parts) node = node?.[p];
  return node ?? null;
}

function localSet(key, value) {
  const parts = key.split('/').filter(Boolean);
  const data = readLocal();
  let node = data;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!node[parts[i]] || typeof node[parts[i]] !== 'object') node[parts[i]] = {};
    node = node[parts[i]];
  }
  node[parts[parts.length - 1]] = value;
  writeLocal(data);
  return value;
}

async function get(key) {
  return localGet(key);
}

async function set(key, value) {
  return localSet(key, value);
}

async function getUser(userId) {
  return get(`users/${userId}`);
}

async function saveUser(userId, profile) {
  return set(`users/${userId}`, { ...profile, userId, updatedAt: Date.now() });
}

async function getOrder(orderId) {
  return get(`orders/${orderId}`);
}

async function saveOrder(orderId, order) {
  return set(`orders/${orderId}`, order);
}

async function listUserOrders(userId) {
  const snap = await get('orders');
  if (!snap || typeof snap !== 'object') return [];
  return Object.values(snap)
    .filter((o) => o && String(o.userId) === String(userId))
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

async function listAllOrders() {
  const snap = await get('orders');
  if (!snap || typeof snap !== 'object') return [];
  return Object.values(snap).filter(Boolean);
}

async function listAllUsers() {
  const snap = await get('users');
  if (!snap || typeof snap !== 'object') return [];
  return Object.values(snap).filter(Boolean);
}

async function getLoginSession(sessionId) {
  return get(`loginSessions/${sessionId}`);
}

async function saveLoginSession(sessionId, data) {
  return set(`loginSessions/${sessionId}`, data);
}

module.exports = {
  storage: 'local',
  getUser,
  saveUser,
  getOrder,
  saveOrder,
  listUserOrders,
  listAllOrders,
  listAllUsers,
  getLoginSession,
  saveLoginSession,
};
