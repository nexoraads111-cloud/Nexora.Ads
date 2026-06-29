/**
 * NexoraWeb — Google Apps Script
 *
 * Установка:
 * 1. Создайте Google Таблицу на Google Drive
 * 2. Расширения → Apps Script → вставьте этот код
 * 3. Запустите setup() один раз (разрешите доступ)
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Скопируйте URL в Render: GAS_WEB_APP_URL=...
 * 6. В Script Properties или ниже укажите ADMIN_EMAIL
 */

const CONFIG = {
  ADMIN_EMAIL: 'nexoraads111@gmail.com', // ← замените на вашу почту
  SITE_URL: 'https://nexoraads.online',
  SECRET: 'nexora-gas-secret-change-me', // тот же GAS_SECRET на Render
};

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  ensureSheet_(ss, 'Reviews', ['id', 'name', 'title', 'type', 'rating', 'text', 'status', 'createdAt', 'token']);
  ensureSheet_(ss, 'Orders', ['id', 'name', 'contact', 'plan', 'message', 'createdAt']);
  SpreadsheetApp.flush();
  return 'OK — листы Reviews и Orders созданы';
}

function ensureSheet_(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);
  if (sheet.getLastRow() === 0) sheet.appendRow(headers);
  else if (sheet.getRange(1, 1, 1, headers.length).getValues()[0].join('') === '') {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  return sheet;
}

function sheet_(name) {
  return ensureSheet_(SpreadsheetApp.getActiveSpreadsheet(), name, name === 'Reviews'
    ? ['id', 'name', 'title', 'type', 'rating', 'text', 'status', 'createdAt', 'token']
    : ['id', 'name', 'contact', 'plan', 'message', 'createdAt']);
}

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function html_(title, body) {
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${title}</title>
  <style>body{font-family:Inter,Arial,sans-serif;background:#070b14;color:#f8fafc;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
  .box{background:#0f172a;border:1px solid #334155;border-radius:16px;padding:32px;max-width:420px;text-align:center}
  a{color:#38bdf8}</style></head><body><div class="box">${body}</div></body></html>`;
  return HtmlService.createHtmlOutput(html).setTitle(title);
}

function checkSecret_(secret) {
  const expected = PropertiesService.getScriptProperties().getProperty('SECRET') || CONFIG.SECRET;
  return secret && secret === expected;
}

function doGet(e) {
  const p = e.parameter || {};
  const action = p.action || '';

  if (action === 'reviews') {
    return json_(getApprovedReviews_());
  }

  if (action === 'approve') {
    const result = moderateReview_(p.id, p.token, 'approved');
    return html_('Отзыв', result.ok
      ? `<h2>✅ Отзыв опубликован</h2><p>Теперь он виден на <a href="${CONFIG.SITE_URL}/#reviews">сайте</a>.</p>`
      : `<h2>❌ Ошибка</h2><p>${result.error}</p>`);
  }

  if (action === 'reject') {
    const result = moderateReview_(p.id, p.token, 'rejected');
    return html_('Отзыв', result.ok
      ? '<h2>🚫 Отзыв отклонён</h2><p>На сайте не появится.</p>'
      : `<h2>❌ Ошибка</h2><p>${result.error}</p>`);
  }

  return json_({ ok: true, service: 'NexoraWeb GAS' });
}

function doPost(e) {
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
}

function getApprovedReviews_() {
  const sh = sheet_('Reviews');
  const rows = sh.getDataRange().getValues();
  const headers = rows.shift();
  const idx = indexMap_(headers);
  const reviews = rows
    .filter((r) => String(r[idx.status]) === 'approved')
    .map((r) => ({
      id: r[idx.id],
      name: r[idx.name],
      title: r[idx.title],
      type: r[idx.type],
      rating: Number(r[idx.rating]) || 5,
      text: r[idx.text],
      createdAt: Number(r[idx.createdAt]) || Date.now(),
    }))
    .sort((a, b) => b.createdAt - a.createdAt);
  return reviews;
}

function submitReview_(data) {
  const sh = sheet_('Reviews');
  const id = 'r_' + Date.now();
  const token = Utilities.getUuid();
  const createdAt = Date.now();
  const row = {
    id,
    name: String(data.name || 'Клиент').slice(0, 80),
    title: String(data.title || 'Отзыв').slice(0, 120),
    type: String(data.type || 'Создание сайта').slice(0, 80),
    rating: Math.max(1, Math.min(5, Number(data.rating) || 5)),
    text: String(data.text || '').slice(0, 2000),
    status: 'pending',
    createdAt,
    token,
  };

  sh.appendRow([row.id, row.name, row.title, row.type, row.rating, row.text, row.status, row.createdAt, row.token]);

  const webAppUrl = ScriptApp.getService().getUrl();
  const approveUrl = `${webAppUrl}?action=approve&id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`;
  const rejectUrl = `${webAppUrl}?action=reject&id=${encodeURIComponent(id)}&token=${encodeURIComponent(token)}`;

  const adminEmail = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL') || CONFIG.ADMIN_EMAIL;

  MailApp.sendEmail({
    to: adminEmail,
    subject: `⭐ Новый отзыв NexoraWeb — ${row.name}`,
    htmlBody: `
      <h2>Новый отзыв на модерацию</h2>
      <p><b>Имя:</b> ${escapeHtml_(row.name)}</p>
      <p><b>Заголовок:</b> ${escapeHtml_(row.title)}</p>
      <p><b>Тип:</b> ${escapeHtml_(row.type)}</p>
      <p><b>Оценка:</b> ${'★'.repeat(row.rating)}</p>
      <p><b>Текст:</b><br>${escapeHtml_(row.text).replace(/\n/g, '<br>')}</p>
      <p style="margin-top:24px">
        <a href="${approveUrl}" style="display:inline-block;background:#22c55e;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;margin-right:12px">✅ Принять</a>
        <a href="${rejectUrl}" style="display:inline-block;background:#ef4444;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">❌ Отклонить</a>
      </p>
    `,
  });

  return { ok: true, id };
}

function submitOrder_(data) {
  const sh = sheet_('Orders');
  const id = 'o_' + Date.now();
  const createdAt = Date.now();
  const row = {
    id,
    name: String(data.name || 'Клиент').slice(0, 80),
    contact: String(data.contact || '').slice(0, 120),
    plan: String(data.plan || data.company || 'Заявка').slice(0, 120),
    message: String(data.message || data.text || '').slice(0, 2000),
    createdAt,
  };

  sh.appendRow([row.id, row.name, row.contact, row.plan, row.message, row.createdAt]);

  const adminEmail = PropertiesService.getScriptProperties().getProperty('ADMIN_EMAIL') || CONFIG.ADMIN_EMAIL;

  MailApp.sendEmail({
    to: adminEmail,
    subject: `🆕 Новая заявка NexoraWeb — ${row.name}`,
    htmlBody: `
      <h2>Новая заявка с сайта</h2>
      <p><b>ID:</b> ${row.id}</p>
      <p><b>Имя:</b> ${escapeHtml_(row.name)}</p>
      <p><b>Контакт:</b> ${escapeHtml_(row.contact)}</p>
      <p><b>Тариф:</b> ${escapeHtml_(row.plan)}</p>
      <p><b>Сообщение:</b><br>${escapeHtml_(row.message).replace(/\n/g, '<br>')}</p>
      <p><a href="${CONFIG.SITE_URL}/">Сайт NexoraWeb</a></p>
    `,
  });

  return { ok: true, id };
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
    return { ok: true, status };
  }
  return { ok: false, error: 'not_found' };
}

function indexMap_(headers) {
  const map = {};
  headers.forEach((h, i) => { map[String(h)] = i; });
  return map;
}

function escapeHtml_(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
