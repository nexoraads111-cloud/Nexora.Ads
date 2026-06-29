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
  SPREADSHEET_ID: '', // можно пустым — таблица создастся сама
};

const REVIEW_HEADERS = ['id', 'name', 'title', 'type', 'rating', 'text', 'status', 'createdAt', 'token'];
const ORDER_HEADERS = ['id', 'name', 'contact', 'plan', 'message', 'createdAt'];

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
  SpreadsheetApp.flush();
  return ss;
}

function setup() {
  const props = getProps_();
  props.setProperty('ADMIN_EMAIL', CONFIG.ADMIN_EMAIL);
  props.setProperty('SECRET', CONFIG.SECRET);

  const ss = getSpreadsheet_();
  ensureSheet_(ss, 'Reviews', REVIEW_HEADERS);
  ensureSheet_(ss, 'Orders', ORDER_HEADERS);
  SpreadsheetApp.flush();

  return 'OK — таблица: https://docs.google.com/spreadsheets/d/' + ss.getId() + '/edit';
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
  const headers = name === 'Reviews' ? REVIEW_HEADERS : ORDER_HEADERS;
  return ensureSheet_(getSpreadsheet_(), name, headers);
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

function doGet(e) {
  try {
    const p = e.parameter || {};
    const action = p.action || '';

    if (action === 'reviews') {
      return json_(getApprovedReviews_());
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
        service: 'NexoraWeb GAS',
        spreadsheetId: ss.getId(),
        adminEmail: getProps_().getProperty('ADMIN_EMAIL') || CONFIG.ADMIN_EMAIL,
      });
    }

    return json_({ ok: true, service: 'NexoraWeb GAS' });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  }
}

function doPost(e) {
  try {
    let data = {};
    try {
      data = JSON.parse(e.postData.contents || '{}');
    } catch (err) {
      return json_({ ok: false, error: 'invalid_json' });
    }

    if (!checkSecret_(data.secret)) {
      return json_({ ok: false, error: 'unauthorized' });
    }

    if (data.action === 'submitReview') return json_(submitReview_(data));
    if (data.action === 'submitOrder') return json_(submitOrder_(data));

    return json_({ ok: false, error: 'unknown_action' });
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
