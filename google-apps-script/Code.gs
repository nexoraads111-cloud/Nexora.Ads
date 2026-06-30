/**
 * NexoraWeb — Google Apps Script
 *
 * Установка (один раз):
 * 1. script.google.com → проект → вставьте этот код
 * 2. Запустите setup() → разрешите Drive, Gmail, Таблицы
 * 3. Развернуть → Новая версия → Веб-приложение, доступ: Все
 * 4. URL в web/public/js/nexora-config.js
 */

const CONFIG = {
  ADMIN_EMAIL: 'nexoraads111@gmail.com',
  SITE_URL: 'https://nexoraads.online',
  SECRET: 'nexora-gas-secret-change-me',
  ADMIN_PIN: 'nexora2026',
  SPREADSHEET_ID: '',
};

const REVIEW_HEADERS = ['id', 'name', 'title', 'type', 'rating', 'text', 'status', 'createdAt', 'token'];
const ORDER_HEADERS = ['id', 'name', 'contact', 'plan', 'message', 'createdAt'];
const PRICING_HEADERS = ['id', 'price', 'oldPrice', 'saleLabel', 'popular', 'sortOrder'];
const PROJECT_HEADERS = ['id', 'name', 'description', 'imageUrl', 'siteUrl', 'featured', 'sortOrder', 'active'];

function getProps_() {
  return PropertiesService.getScriptProperties();
}

function getSpreadsheet_() {
  const props = getProps_();
  const savedId = props.getProperty('SPREADSHEET_ID') || CONFIG.SPREADSHEET_ID;

  if (savedId) {
    try {
      return SpreadsheetApp.openById(savedId);
    } catch (e) {
      props.deleteProperty('SPREADSHEET_ID');
    }
  }

  const bound = SpreadsheetApp.getActiveSpreadsheet();
  if (bound) {
    props.setProperty('SPREADSHEET_ID', bound.getId());
    return bound;
  }

  const ss = SpreadsheetApp.create('NexoraWeb Data');
  props.setProperty('SPREADSHEET_ID', ss.getId());
  ensureSheet_(ss, 'Reviews', REVIEW_HEADERS);
  ensureSheet_(ss, 'Orders', ORDER_HEADERS);
  ensureSheet_(ss, 'Pricing', PRICING_HEADERS);
  ensureSheet_(ss, 'Projects', PROJECT_HEADERS);
  SpreadsheetApp.flush();
  return ss;
}

function setup() {
  const props = getProps_();
  props.setProperty('ADMIN_EMAIL', CONFIG.ADMIN_EMAIL);
  props.setProperty('SECRET', CONFIG.SECRET);
  props.setProperty('ADMIN_PIN', CONFIG.ADMIN_PIN);

  const ss = getSpreadsheet_();
  ensureSheet_(ss, 'Reviews', REVIEW_HEADERS);
  ensureSheet_(ss, 'Orders', ORDER_HEADERS);
  ensureSheet_(ss, 'Pricing', PRICING_HEADERS);
  ensureSheet_(ss, 'Projects', PROJECT_HEADERS);
  seedDefaults_();
  SpreadsheetApp.flush();

  return 'OK v3 — PIN: ' + CONFIG.ADMIN_PIN + ' — таблица: https://docs.google.com/spreadsheets/d/' + ss.getId() + '/edit';
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    if (firstRow.join('') === '') {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }
  return sheet;
}

function sheet_(name) {
  var headers = ORDER_HEADERS;
  if (name === 'Reviews') headers = REVIEW_HEADERS;
  else if (name === 'Pricing') headers = PRICING_HEADERS;
  else if (name === 'Projects') headers = PROJECT_HEADERS;
  return ensureSheet_(getSpreadsheet_(), name, headers);
}

function seedDefaults_() {
  var psh = sheet_('Pricing');
  if (psh.getLastRow() <= 1) {
    psh.appendRow(['price1', '150', '', '', 'false', '1']);
    psh.appendRow(['price2', '300', '', '', 'true', '2']);
    psh.appendRow(['price3', '600', '', '', 'false', '3']);
  }
  var prsh = sheet_('Projects');
  if (prsh.getLastRow() <= 1) {
    prsh.appendRow(['p1', 'Stroplook.sk', 'Сайт для строительной компании с фокусом на доверие и заявки.', 'Public/Image/Stroplooksk.png', 'https://stroplook.sk', 'false', '1', 'true']);
    prsh.appendRow(['p2', 'Ukstav.sk', 'Сайт для услуг в строительной сфере, удобный для телефона.', 'Public/Image/Ukstav.png', 'https://ukstav.sk', 'false', '2', 'true']);
    prsh.appendRow(['p3', 'DiurdStav.sk', 'Сайт строительной компании DiurdStav в Братиславе.', 'Public/Image/DiurdStav.png', 'https://diurdstav.sk', 'true', '3', 'true']);
  }
}

function checkAdminPin_(pin) {
  var expected = getProps_().getProperty('ADMIN_PIN') || CONFIG.ADMIN_PIN;
  return pin && String(pin) === String(expected);
}

function adminLogin_(data) {
  if (!checkAdminPin_(data.pin)) return { ok: false, error: 'wrong_pin' };
  return { ok: true, token: getProps_().getProperty('SECRET') || CONFIG.SECRET };
}

function getPricing_() {
  var sh = sheet_('Pricing');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) { seedDefaults_(); rows = sh.getDataRange().getValues(); }
  var headers = rows.shift();
  var idx = indexMap_(headers);
  return rows.map(function (r) {
    return {
      id: String(r[idx.id]),
      price: String(r[idx.price] || ''),
      oldPrice: String(r[idx.oldPrice] || ''),
      saleLabel: String(r[idx.saleLabel] || ''),
      popular: String(r[idx.popular]) === 'true',
      sortOrder: Number(r[idx.sortOrder]) || 0,
    };
  }).sort(function (a, b) { return a.sortOrder - b.sortOrder; });
}

function savePricing_(data) {
  var items = data.items || [];
  var sh = sheet_('Pricing');
  sh.clearContents();
  sh.appendRow(PRICING_HEADERS);
  items.forEach(function (item, i) {
    sh.appendRow([
      String(item.id || 'price' + (i + 1)),
      String(item.price || ''),
      String(item.oldPrice || ''),
      String(item.saleLabel || ''),
      item.popular ? 'true' : 'false',
      Number(item.sortOrder) || (i + 1),
    ]);
  });
  return { ok: true, count: items.length };
}

function getProjects_() {
  var sh = sheet_('Projects');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) { seedDefaults_(); rows = sh.getDataRange().getValues(); }
  var headers = rows.shift();
  var idx = indexMap_(headers);
  return rows
    .filter(function (r) { return String(r[idx.active]) !== 'false'; })
    .map(function (r) {
      return {
        id: String(r[idx.id]),
        name: String(r[idx.name] || ''),
        description: String(r[idx.description] || ''),
        imageUrl: String(r[idx.imageUrl] || ''),
        siteUrl: String(r[idx.siteUrl] || ''),
        featured: String(r[idx.featured]) === 'true',
        sortOrder: Number(r[idx.sortOrder]) || 0,
      };
    })
    .sort(function (a, b) { return a.sortOrder - b.sortOrder; });
}

function getProjectsAdmin_() {
  var sh = sheet_('Projects');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) { seedDefaults_(); rows = sh.getDataRange().getValues(); }
  var headers = rows.shift();
  var idx = indexMap_(headers);
  return rows.map(function (r) {
    return {
      id: String(r[idx.id]),
      name: String(r[idx.name] || ''),
      description: String(r[idx.description] || ''),
      imageUrl: String(r[idx.imageUrl] || ''),
      siteUrl: String(r[idx.siteUrl] || ''),
      featured: String(r[idx.featured]) === 'true',
      sortOrder: Number(r[idx.sortOrder]) || 0,
      active: String(r[idx.active]) !== 'false',
    };
  }).sort(function (a, b) { return a.sortOrder - b.sortOrder; });
}

function saveProjects_(data) {
  var items = data.items || [];
  var sh = sheet_('Projects');
  sh.clearContents();
  sh.appendRow(PROJECT_HEADERS);
  items.forEach(function (item, i) {
    sh.appendRow([
      String(item.id || 'p_' + Date.now() + '_' + i),
      String(item.name || '').slice(0, 120),
      String(item.description || '').slice(0, 500),
      String(item.imageUrl || '').slice(0, 500),
      String(item.siteUrl || '').slice(0, 300),
      item.featured ? 'true' : 'false',
      Number(item.sortOrder) || (i + 1),
      item.active === false ? 'false' : 'true',
    ]);
  });
  return { ok: true, count: items.length };
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function html_(title, body) {
  const html = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>' + title + '</title>' +
    '<style>body{font-family:Inter,Arial,sans-serif;background:#070b14;color:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}' +
    '.box{background:#0f172a;border:1px solid #334155;border-radius:16px;padding:32px;max-width:420px;text-align:center}' +
    'a{color:#38bdf8}</style></head><body><div class="box">' + body + '</div></body></html>';
  return HtmlService.createHtmlOutput(html).setTitle(title);
}

function checkSecret_(secret) {
  const expected = getProps_().getProperty('SECRET') || CONFIG.SECRET;
  return secret && secret === expected;
}

function parseBody_(e) {
  if (e.postData && e.postData.contents) {
    try {
      return JSON.parse(e.postData.contents);
    } catch (err) {
      return null;
    }
  }
  return null;
}

function parsePayload_(e) {
  var p = e.parameter || {};
  if (!p.payload) return null;
  try {
    return JSON.parse(p.payload);
  } catch (err) {
    return null;
  }
}

function handleSubmit_(data) {
  if (!data || !data.action) return null;
  if (data.action === 'adminLogin') return adminLogin_(data);
  if (!checkSecret_(data.secret)) return { ok: false, error: 'unauthorized' };
  if (data.action === 'submitReview') return submitReview_(data);
  if (data.action === 'submitOrder') return submitOrder_(data);
  if (data.action === 'savePricing') return savePricing_(data);
  if (data.action === 'saveProjects') return saveProjects_(data);
  return { ok: false, error: 'unknown_action' };
}

function doGet(e) {
  try {
    const p = e.parameter || {};
    const payloadData = parsePayload_(e);
    const submitResult = handleSubmit_(payloadData);
    if (submitResult) return json_(submitResult);

    const action = p.action || '';

    if (action === 'reviews') {
      return json_(getApprovedReviews_());
    }

    if (action === 'pricing') {
      return json_(getPricing_());
    }

    if (action === 'projects') {
      return json_(getProjects_());
    }

    if (action === 'projectsAdmin') {
      if (!checkSecret_(p.secret)) return json_({ ok: false, error: 'unauthorized' });
      return json_(getProjectsAdmin_());
    }

    if (action === 'approve') {
      const result = moderateReview_(p.id, p.token, 'approved');
      return html_('Отзыв', result.ok
        ? '<h2>✅ Отзыв опубликован</h2><p>Теперь он виден на <a href="' + CONFIG.SITE_URL + '/#reviews">сайте</a>.</p>'
        : '<h2>❌ Ошибка</h2><p>' + result.error + '</p>');
    }

    if (action === 'reject') {
      const result = moderateReview_(p.id, p.token, 'rejected');
      return html_('Отзыв', result.ok
        ? '<h2>🚫 Отзыв отклонён</h2><p>На сайте не появится.</p>'
        : '<h2>❌ Ошибка</h2><p>' + result.error + '</p>');
    }

    if (action === 'health') {
      const ss = getSpreadsheet_();
      return json_({
        ok: true,
        version: '3.0',
        service: 'NexoraWeb GAS',
        spreadsheetId: ss.getId(),
        adminEmail: getProps_().getProperty('ADMIN_EMAIL') || CONFIG.ADMIN_EMAIL,
      });
    }

    return json_({ ok: true, version: '3.0', service: 'NexoraWeb GAS' });
  } catch (err) {
    return json_({ ok: false, version: '3.0', error: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    const data = parseBody_(e) || {};
    const submitResult = handleSubmit_(data);
    if (submitResult) return json_(submitResult);

    return json_({ ok: false, error: 'invalid_json' });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function getApprovedReviews_() {
  const sh = sheet_('Reviews');
  const rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return [];

  const headers = rows.shift();
  const idx = indexMap_(headers);
  return rows
    .filter(function (r) { return String(r[idx.status]) === 'approved'; })
    .map(function (r) {
      return {
        id: r[idx.id],
        name: r[idx.name],
        title: r[idx.title],
        type: r[idx.type],
        rating: Number(r[idx.rating]) || 5,
        text: r[idx.text],
        createdAt: Number(r[idx.createdAt]) || Date.now(),
      };
    })
    .sort(function (a, b) { return b.createdAt - a.createdAt; });
}

function submitReview_(data) {
  const sh = sheet_('Reviews');
  const id = 'r_' + Date.now();
  const token = Utilities.getUuid();
  const createdAt = Date.now();
  const row = {
    id: id,
    name: String(data.name || 'Клиент').slice(0, 80),
    title: String(data.title || 'Отзыв').slice(0, 120),
    type: String(data.type || 'Создание сайта').slice(0, 80),
    rating: Math.max(1, Math.min(5, Number(data.rating) || 5)),
    text: String(data.text || '').slice(0, 2000),
    status: 'pending',
    createdAt: createdAt,
    token: token,
  };

  sh.appendRow([row.id, row.name, row.title, row.type, row.rating, row.text, row.status, row.createdAt, row.token]);

  const webAppUrl = ScriptApp.getService().getUrl();
  const approveUrl = webAppUrl + '?action=approve&id=' + encodeURIComponent(id) + '&token=' + encodeURIComponent(token);
  const rejectUrl = webAppUrl + '?action=reject&id=' + encodeURIComponent(id) + '&token=' + encodeURIComponent(token);
  const adminEmail = getProps_().getProperty('ADMIN_EMAIL') || CONFIG.ADMIN_EMAIL;

  MailApp.sendEmail({
    to: adminEmail,
    subject: '⭐ Новый отзыв NexoraWeb — ' + row.name,
    htmlBody:
      '<h2>Новый отзыв на модерацию</h2>' +
      '<p><b>Имя:</b> ' + escapeHtml_(row.name) + '</p>' +
      '<p><b>Заголовок:</b> ' + escapeHtml_(row.title) + '</p>' +
      '<p><b>Тип:</b> ' + escapeHtml_(row.type) + '</p>' +
      '<p><b>Оценка:</b> ' + '★'.repeat(row.rating) + '</p>' +
      '<p><b>Текст:</b><br>' + escapeHtml_(row.text).replace(/\n/g, '<br>') + '</p>' +
      '<p style="margin-top:24px">' +
      '<a href="' + approveUrl + '" style="display:inline-block;background:#22c55e;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;margin-right:12px">✅ Принять</a>' +
      '<a href="' + rejectUrl + '" style="display:inline-block;background:#ef4444;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">❌ Отклонить</a>' +
      '</p>',
  });

  return { ok: true, id: id };
}

function submitOrder_(data) {
  const sh = sheet_('Orders');
  const id = 'o_' + Date.now();
  const createdAt = Date.now();
  const row = {
    id: id,
    name: String(data.name || 'Клиент').slice(0, 80),
    contact: String(data.contact || '').slice(0, 120),
    plan: String(data.plan || data.company || 'Заявка').slice(0, 120),
    message: String(data.message || data.text || '').slice(0, 2000),
    createdAt: createdAt,
  };

  sh.appendRow([row.id, row.name, row.contact, row.plan, row.message, row.createdAt]);

  const adminEmail = getProps_().getProperty('ADMIN_EMAIL') || CONFIG.ADMIN_EMAIL;

  MailApp.sendEmail({
    to: adminEmail,
    subject: '🆕 Новая заявка NexoraWeb — ' + row.name,
    htmlBody:
      '<h2>Новая заявка с сайта</h2>' +
      '<p><b>ID:</b> ' + row.id + '</p>' +
      '<p><b>Имя:</b> ' + escapeHtml_(row.name) + '</p>' +
      '<p><b>Контакт:</b> ' + escapeHtml_(row.contact) + '</p>' +
      '<p><b>Тариф:</b> ' + escapeHtml_(row.plan) + '</p>' +
      '<p><b>Сообщение:</b><br>' + escapeHtml_(row.message).replace(/\n/g, '<br>') + '</p>' +
      '<p><a href="' + CONFIG.SITE_URL + '/">Сайт NexoraWeb</a></p>',
  });

  return { ok: true, id: id };
}

function moderateReview_(id, token, status) {
  if (!id || !token) return { ok: false, error: 'missing_params' };
  const sh = sheet_('Reviews');
  const rows = sh.getDataRange().getValues();
  const headers = rows.shift();
  const idx = indexMap_(headers);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (String(row[idx.id]) !== String(id)) continue;
    if (String(row[idx.token]) !== String(token)) return { ok: false, error: 'invalid_token' };
    sh.getRange(i + 2, idx.status + 1).setValue(status);
    return { ok: true, status: status };
  }
  return { ok: false, error: 'not_found' };
}

function indexMap_(headers) {
  const map = {};
  headers.forEach(function (h, i) { map[String(h)] = i; });
  return map;
}

function escapeHtml_(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
