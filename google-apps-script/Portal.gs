/**
 * NexoraWeb Client Portal — v4
 * Додайте цей файл у той самий проєкт Apps Script, що й Code.gs
 * Запустіть portalSetup() один раз після setup()
 */

var PORTAL = {
  VERSION: '4.0',
  SESSION_DAYS: 14,
  TOKEN_HOURS: 48,
  STATUSES: ['Планирование', 'Дизайн', 'Разработка', 'Тестирование', 'Готов'],
  DRIVE_FOLDER: 'NexoraWeb Portal Files',
};

var USER_HEADERS = ['id', 'email', 'name', 'passwordHash', 'salt', 'role', 'avatarUrl', 'emailVerified', 'createdAt'];
var SESSION_HEADERS = ['token', 'userId', 'csrf', 'expiresAt', 'createdAt'];
var TOKEN_HEADERS = ['token', 'userId', 'type', 'expiresAt', 'createdAt'];
var CPROJECT_HEADERS = ['id', 'userId', 'title', 'description', 'status', 'progress', 'startDate', 'dueDate', 'archiveDriveId', 'archiveUrl', 'createdAt'];
var HISTORY_HEADERS = ['id', 'projectId', 'text', 'byUserId', 'byName', 'createdAt'];
var MESSAGE_HEADERS = ['id', 'userId', 'senderId', 'senderRole', 'text', 'fileId', 'status', 'createdAt'];
var FILE_HEADERS = ['id', 'projectId', 'userId', 'filename', 'mime', 'size', 'driveId', 'driveUrl', 'uploadedBy', 'createdAt'];

function portalSheet_(name) {
  var headers = SESSION_HEADERS;
  if (name === 'Users') headers = USER_HEADERS;
  else if (name === 'EmailTokens') headers = TOKEN_HEADERS;
  else if (name === 'ClientProjects') headers = CPROJECT_HEADERS;
  else if (name === 'ProjectHistory') headers = HISTORY_HEADERS;
  else if (name === 'Messages') headers = MESSAGE_HEADERS;
  else if (name === 'Files') headers = FILE_HEADERS;
  return ensureSheet_(getSpreadsheet_(), name, headers);
}

function portalSetup() {
  portalSheet_('Users');
  portalSheet_('Sessions');
  portalSheet_('EmailTokens');
  portalSheet_('ClientProjects');
  portalSheet_('ProjectHistory');
  portalSheet_('Messages');
  portalSheet_('Files');
  portalEnsureAdmin_(false);
  getOrCreateDriveFolder_();
  return 'Portal v4 OK — sheets ready';
}

/**
 * Запустите вручную в редакторе Apps Script, если не входит админ:
 * portalResetAdminPassword()
 * Пароль: NexoraAdmin2026! (или ADMIN_PORTAL_PASS в свойствах скрипта)
 */
function portalResetAdminPassword() {
  return portalEnsureAdmin_(true);
}

function portalEnsureAdmin_(forcePassword) {
  var email = (getProps_().getProperty('ADMIN_EMAIL') || CONFIG.ADMIN_EMAIL || '').toLowerCase();
  if (!email) return 'ADMIN_EMAIL не задан';
  var pass = getProps_().getProperty('ADMIN_PORTAL_PASS') || 'NexoraAdmin2026!';
  var sh = portalSheet_('Users');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) {
    var salt = portalSalt_();
    portalCreateUserRow_(sh, {
      id: 'u_admin',
      email: email,
      name: 'Администратор',
      passwordHash: portalHash_(pass, salt),
      salt: salt,
      role: 'admin',
      avatarUrl: '',
      emailVerified: 'true',
      createdAt: Date.now(),
    });
    return 'Админ создан: ' + email + ' / пароль: ' + pass;
  }

  var headers = rows.shift();
  var idx = indexMap_(headers);
  var found = -1;
  for (var i = 0; i < rows.length; i++) {
    var rowEmail = String(rows[i][idx.email] || '').toLowerCase();
    var rowId = String(rows[i][idx.id] || '');
    if (rowEmail === email || rowId === 'u_admin') {
      found = i;
      break;
    }
  }

  if (found < 0) {
    var salt2 = portalSalt_();
    portalCreateUserRow_(sh, {
      id: 'u_admin',
      email: email,
      name: 'Администратор',
      passwordHash: portalHash_(pass, salt2),
      salt: salt2,
      role: 'admin',
      avatarUrl: '',
      emailVerified: 'true',
      createdAt: Date.now(),
    });
    return 'Админ создан: ' + email + ' / пароль: ' + pass;
  }

  var rowNum = found + 2;
  sh.getRange(rowNum, idx.email + 1).setValue(email);
  sh.getRange(rowNum, idx.role + 1).setValue('admin');
  sh.getRange(rowNum, idx.emailVerified + 1).setValue('true');
  if (String(rows[found][idx.id]) !== 'u_admin') {
    sh.getRange(rowNum, idx.id + 1).setValue('u_admin');
  }
  if (forcePassword) {
    var salt3 = portalSalt_();
    sh.getRange(rowNum, idx.salt + 1).setValue(salt3);
    sh.getRange(rowNum, idx.passwordHash + 1).setValue(portalHash_(pass, salt3));
    return 'Пароль админа сброшен: ' + email + ' / новый пароль: ' + pass;
  }
  return 'Админ уже есть: ' + email + ' (запустите portalResetAdminPassword() для сброса пароля)';
}

function portalSeedAdmin_() {
  portalEnsureAdmin_(false);
}

function portalCreateUserRow_(sh, u) {
  sh.appendRow([u.id, u.email, u.name, u.passwordHash, u.salt, u.role, u.avatarUrl, u.emailVerified, u.createdAt]);
}

function portalSalt_() {
  return Utilities.base64Encode(Utilities.getUuid() + Utilities.getUuid());
}

function portalHash_(password, salt) {
  var raw = salt + ':' + String(password);
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw);
  return Utilities.base64Encode(digest);
}

function portalSanitize_(s, max) {
  return String(s || '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '').slice(0, max || 500);
}

function portalSanitizeEmail_(email) {
  return portalSanitize_(email, 120).toLowerCase().trim();
}

function portalValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function portalFindUserByEmail_(email) {
  var sh = portalSheet_('Users');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return null;
  var headers = rows.shift();
  var idx = indexMap_(headers);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idx.email]).toLowerCase() === email) {
      return portalRowToUser_(rows[i], idx);
    }
  }
  return null;
}

function portalFindUserById_(id) {
  var sh = portalSheet_('Users');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return null;
  var headers = rows.shift();
  var idx = indexMap_(headers);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idx.id]) === String(id)) return portalRowToUser_(rows[i], idx, true);
  }
  return null;
}

function portalRowToUser_(r, idx, includePrivate) {
  var u = {
    id: String(r[idx.id]),
    email: String(r[idx.email]),
    name: String(r[idx.name] || ''),
    role: String(r[idx.role] || 'client'),
    avatarUrl: String(r[idx.avatarUrl] || ''),
    emailVerified: String(r[idx.emailVerified]) === 'true',
    createdAt: Number(r[idx.createdAt]) || 0,
  };
  if (includePrivate) {
    u.passwordHash = String(r[idx.passwordHash]);
    u.salt = String(r[idx.salt]);
  }
  return u;
}

function portalPublicUser_(u) {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    avatarUrl: u.avatarUrl,
    emailVerified: u.emailVerified,
    createdAt: u.createdAt,
  };
}

function portalCreateSession_(userId) {
  var token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().replace(/-/g, '');
  var csrf = Utilities.getUuid().replace(/-/g, '');
  var now = Date.now();
  var expires = now + PORTAL.SESSION_DAYS * 24 * 60 * 60 * 1000;
  portalSheet_('Sessions').appendRow([token, userId, csrf, expires, now]);
  return { token: token, csrf: csrf, expiresAt: expires };
}

function portalGetSession_(token) {
  if (!token) return null;
  var cache = CacheService.getScriptCache();
  var cacheKey = 's_' + token.slice(0, 80);
  var cached = cache.get(cacheKey);
  if (cached) {
    try {
      var hit = JSON.parse(cached);
      if (hit.expiresAt > Date.now()) {
        var u = portalFindUserByIdCached_(hit.userId);
        if (u) {
          return { token: token, csrf: hit.csrf, userId: hit.userId, user: u };
        }
      }
    } catch (e) {}
  }

  var sh = portalSheet_('Sessions');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return null;
  var headers = rows.shift();
  var idx = indexMap_(headers);
  var now = Date.now();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idx.token]) !== String(token)) continue;
    if (Number(rows[i][idx.expiresAt]) < now) return null;
    var user = portalFindUserByIdCached_(String(rows[i][idx.userId]));
    if (!user) return null;
    var sess = {
      token: String(rows[i][idx.token]),
      csrf: String(rows[i][idx.csrf]),
      userId: String(rows[i][idx.userId]),
      user: user,
    };
    cache.put(cacheKey, JSON.stringify({
      csrf: sess.csrf,
      userId: sess.userId,
      expiresAt: Number(rows[i][idx.expiresAt]),
    }), 300);
    return sess;
  }
  return null;
}

function portalFindUserByIdCached_(id) {
  var cache = CacheService.getScriptCache();
  var key = 'u_' + String(id).slice(0, 80);
  var cached = cache.get(key);
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }
  var user = portalFindUserById_(id);
  if (!user) return null;
  delete user.passwordHash;
  delete user.salt;
  try {
    cache.put(key, JSON.stringify(user), 300);
  } catch (e) {}
  return user;
}

function portalInvalidateUserCache_(userId) {
  try {
    CacheService.getScriptCache().remove('u_' + String(userId).slice(0, 80));
    CacheService.getScriptCache().remove('users_map');
  } catch (e) {}
}

function portalCountUnread_(user) {
  var sh = portalSheet_('Messages');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return 0;
  var headers = rows.shift();
  var idx = indexMap_(headers);
  var count = 0;
  if (user.role === 'admin') {
    for (var i = 0; i < rows.length; i++) {
      if (String(rows[i][idx.senderRole]) === 'client' && String(rows[i][idx.status]) === 'sent') count++;
    }
    return count;
  }
  for (var j = 0; j < rows.length; j++) {
    if (String(rows[j][idx.userId]) !== String(user.id)) continue;
    if (String(rows[j][idx.senderRole]) === 'admin' && String(rows[j][idx.status]) === 'sent') count++;
  }
  return count;
}

function portalGetDashboard_(data) {
  var auth = portalAuth_(data, false);
  if (!auth.ok) return auth;
  var userId = auth.user.role === 'admin' && data.userId ? data.userId : auth.user.id;
  return {
    ok: true,
    projects: portalListProjects_(userId),
    unread: portalCountUnread_(auth.user),
    user: portalPublicUser_(auth.user),
  };
}

function portalAuth_(data, requireCsrf) {
  var session = portalGetSession_(data.session || data.token);
  if (!session) return { ok: false, error: 'unauthorized' };
  if (requireCsrf && data.csrf && data.csrf !== session.csrf) {
    return { ok: false, error: 'csrf_invalid' };
  }
  return { ok: true, session: session, user: session.user };
}

function portalRequireAdmin_(data) {
  var auth = portalAuth_(data, true);
  if (!auth.ok) return auth;
  if (auth.user.role !== 'admin') return { ok: false, error: 'forbidden' };
  return auth;
}

function portalSendEmail_(to, subject, html) {
  MailApp.sendEmail({
    to: to,
    subject: subject,
    htmlBody: html,
  });
}

function portalWebUrl_() {
  try { return ScriptApp.getService().getUrl(); } catch (e) { return CONFIG.SITE_URL; }
}

function portalRegister_(data) {
  var email = portalSanitizeEmail_(data.email);
  var password = String(data.password || '');
  var name = portalSanitize_(data.name, 80);
  if (!portalValidEmail_(email)) return { ok: false, error: 'invalid_email' };
  if (password.length < 8) return { ok: false, error: 'weak_password' };
  if (portalFindUserByEmail_(email)) return { ok: false, error: 'email_exists' };

  var salt = portalSalt_();
  var id = 'u_' + Date.now();
  var sh = portalSheet_('Users');
  portalCreateUserRow_(sh, {
    id: id,
    email: email,
    name: name || email.split('@')[0],
    passwordHash: portalHash_(password, salt),
    salt: salt,
    role: 'client',
    avatarUrl: '',
    emailVerified: 'false',
    createdAt: Date.now(),
  });

  var token = Utilities.getUuid();
  var expires = Date.now() + PORTAL.TOKEN_HOURS * 60 * 60 * 1000;
  portalSheet_('EmailTokens').appendRow([token, id, 'verify', expires, Date.now()]);

  var link = portalWebUrl_() + '?action=portalVerify&token=' + encodeURIComponent(token);
  portalSendEmail_(email, 'Подтвердите email — NexoraWeb', 
    '<h2>Добро пожаловать в NexoraWeb</h2><p>Подтвердите email:</p><p><a href="' + link + '">' + link + '</a></p>');

  return { ok: true, message: 'check_email' };
}

function portalLogin_(data) {
  var email = portalSanitizeEmail_(data.email);
  var password = String(data.password || '');
  var user = portalFindUserByEmail_(email);
  if (!user) return { ok: false, error: 'invalid_credentials' };
  var full = portalFindUserById_(user.id);
  if (portalHash_(password, full.salt) !== full.passwordHash) {
    return { ok: false, error: 'invalid_credentials' };
  }
  if (!user.emailVerified && user.role !== 'admin') {
    return { ok: false, error: 'email_not_verified' };
  }
  var sess = portalCreateSession_(user.id);
  return { ok: true, user: portalPublicUser_(user), session: sess };
}

function portalVerifyEmail_(token) {
  var row = portalFindToken_(token, 'verify');
  if (!row) return { ok: false, error: 'invalid_token' };
  portalSetUserVerified_(row.userId);
  portalDeleteToken_(token);
  return { ok: true };
}

function portalForgotPassword_(data) {
  var email = portalSanitizeEmail_(data.email);
  var user = portalFindUserByEmail_(email);
  if (!user) return { ok: true, message: 'if_exists_sent' };
  var token = Utilities.getUuid();
  var expires = Date.now() + PORTAL.TOKEN_HOURS * 60 * 60 * 1000;
  portalSheet_('EmailTokens').appendRow([token, user.id, 'reset', expires, Date.now()]);
  var link = CONFIG.SITE_URL + '/portal/#/reset?token=' + encodeURIComponent(token);
  portalSendEmail_(email, 'Сброс пароля — NexoraWeb',
    '<h2>Сброс пароля</h2><p><a href="' + link + '">Установить новый пароль</a></p><p>Ссылка действует ' + PORTAL.TOKEN_HOURS + ' ч.</p>');
  return { ok: true, message: 'if_exists_sent' };
}

function portalResetPassword_(data) {
  var token = String(data.token || '');
  var password = String(data.password || '');
  if (password.length < 8) return { ok: false, error: 'weak_password' };
  var row = portalFindToken_(token, 'reset');
  if (!row) return { ok: false, error: 'invalid_token' };
  portalUpdatePassword_(row.userId, password);
  portalDeleteToken_(token);
  return { ok: true };
}

function portalFindToken_(token, type) {
  var sh = portalSheet_('EmailTokens');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return null;
  var headers = rows.shift();
  var idx = indexMap_(headers);
  var now = Date.now();
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idx.token]) !== token) continue;
    if (String(rows[i][idx.type]) !== type) continue;
    if (Number(rows[i][idx.expiresAt]) < now) return null;
    return { userId: String(rows[i][idx.userId]), token: token };
  }
  return null;
}

function portalDeleteToken_(token) {
  var sh = portalSheet_('EmailTokens');
  var rows = sh.getDataRange().getValues();
  var headers = rows.shift();
  var idx = indexMap_(headers);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idx.token]) === token) { sh.deleteRow(i + 2); return; }
  }
}

function portalSetUserVerified_(userId) {
  portalUpdateUserField_(userId, 'emailVerified', 'true');
}

function portalUpdateUserField_(userId, field, value) {
  var sh = portalSheet_('Users');
  var rows = sh.getDataRange().getValues();
  var headers = rows.shift();
  var idx = indexMap_(headers);
  if (idx[field] === undefined) return;
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idx.id]) === userId) {
      sh.getRange(i + 2, idx[field] + 1).setValue(value);
      return;
    }
  }
}

function portalUpdatePassword_(userId, password) {
  var user = portalFindUserById_(userId);
  if (!user) return;
  var salt = portalSalt_();
  portalUpdateUserField_(userId, 'salt', salt);
  portalUpdateUserField_(userId, 'passwordHash', portalHash_(password, salt));
}

function portalLogout_(data) {
  var token = data.session || data.token;
  if (!token) return { ok: true };
  var sh = portalSheet_('Sessions');
  var rows = sh.getDataRange().getValues();
  var headers = rows.shift();
  var idx = indexMap_(headers);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idx.token]) === token) { sh.deleteRow(i + 2); break; }
  }
  return { ok: true };
}

function portalGetMe_(data) {
  var auth = portalAuth_(data, false);
  if (!auth.ok) return auth;
  return { ok: true, user: portalPublicUser_(auth.user) };
}

function portalUpdateProfile_(data) {
  var auth = portalAuth_(data, true);
  if (!auth.ok) return auth;
  if (data.name) portalUpdateUserField_(auth.user.id, 'name', portalSanitize_(data.name, 80));
  if (data.avatarUrl !== undefined) portalUpdateUserField_(auth.user.id, 'avatarUrl', portalSanitize_(data.avatarUrl, 500000));
  portalInvalidateUserCache_(auth.user.id);
  var user = portalFindUserById_(auth.user.id);
  return { ok: true, user: portalPublicUser_(user) };
}

function portalChangePassword_(data) {
  var auth = portalAuth_(data, true);
  if (!auth.ok) return auth;
  var full = portalFindUserById_(auth.user.id);
  if (portalHash_(String(data.oldPassword || ''), full.salt) !== full.passwordHash) {
    return { ok: false, error: 'wrong_password' };
  }
  if (String(data.newPassword || '').length < 8) return { ok: false, error: 'weak_password' };
  portalUpdatePassword_(auth.user.id, data.newPassword);
  return { ok: true };
}

function portalChangeEmail_(data) {
  var auth = portalAuth_(data, true);
  if (!auth.ok) return auth;
  var email = portalSanitizeEmail_(data.email);
  if (!portalValidEmail_(email)) return { ok: false, error: 'invalid_email' };
  if (email === auth.user.email) return { ok: false, error: 'same_email' };
  if (portalFindUserByEmail_(email)) return { ok: false, error: 'email_exists' };
  var full = portalFindUserById_(auth.user.id);
  if (portalHash_(String(data.password || ''), full.salt) !== full.passwordHash) {
    return { ok: false, error: 'wrong_password' };
  }
  portalUpdateUserField_(auth.user.id, 'email', email);
  portalUpdateUserField_(auth.user.id, 'emailVerified', auth.user.role === 'admin' ? 'true' : 'false');
  if (auth.user.role !== 'admin') {
    var token = Utilities.getUuid();
    var expires = Date.now() + PORTAL.TOKEN_HOURS * 60 * 60 * 1000;
    portalSheet_('EmailTokens').appendRow([token, auth.user.id, 'verify', expires, Date.now()]);
    var link = portalWebUrl_() + '?action=portalVerify&token=' + encodeURIComponent(token);
    portalSendEmail_(email, 'Подтвердите новый email — NexoraWeb',
      '<h2>Подтверждение email</h2><p><a href="' + link + '">Подтвердить</a></p>');
  }
  var user = portalFindUserById_(auth.user.id);
  return { ok: true, user: portalPublicUser_(user), message: 'verify_new_email' };
}

function portalGetMyProjects_(data) {
  var auth = portalAuth_(data, false);
  if (!auth.ok) return auth;
  var userId = auth.user.role === 'admin' && data.userId ? data.userId : auth.user.id;
  return { ok: true, projects: portalListProjects_(userId) };
}

function portalListProjects_(userId) {
  var sh = portalSheet_('ClientProjects');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return [];
  var headers = rows.shift();
  var idx = indexMap_(headers);
  return rows
    .filter(function (r) { return String(r[idx.userId]) === String(userId); })
    .map(function (r) { return portalRowToProject_(r, idx); })
    .sort(function (a, b) { return b.createdAt - a.createdAt; });
}

function portalRowToProject_(r, idx) {
  return {
    id: String(r[idx.id]),
    userId: String(r[idx.userId]),
    title: String(r[idx.title] || ''),
    description: String(r[idx.description] || ''),
    status: String(r[idx.status] || 'Планирование'),
    progress: Math.max(0, Math.min(100, Number(r[idx.progress]) || 0)),
    startDate: String(r[idx.startDate] || ''),
    dueDate: String(r[idx.dueDate] || ''),
    archiveUrl: String(r[idx.archiveUrl] || ''),
    createdAt: Number(r[idx.createdAt]) || 0,
  };
}

function portalGetProject_(data) {
  var auth = portalAuth_(data, false);
  if (!auth.ok) return auth;
  var project = portalFindProject_(data.projectId);
  if (!project) return { ok: false, error: 'not_found' };
  if (auth.user.role !== 'admin' && project.userId !== auth.user.id) {
    return { ok: false, error: 'forbidden' };
  }
  project.history = portalGetHistory_(project.id);
  project.files = portalListFiles_(project.id);
  return { ok: true, project: project };
}

function portalFindProject_(id) {
  var sh = portalSheet_('ClientProjects');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return null;
  var headers = rows.shift();
  var idx = indexMap_(headers);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idx.id]) === String(id)) return portalRowToProject_(rows[i], idx);
  }
  return null;
}

function portalGetHistory_(projectId) {
  var sh = portalSheet_('ProjectHistory');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return [];
  var headers = rows.shift();
  var idx = indexMap_(headers);
  return rows
    .filter(function (r) { return String(r[idx.projectId]) === String(projectId); })
    .map(function (r) {
      return {
        id: String(r[idx.id]),
        text: String(r[idx.text] || ''),
        byName: String(r[idx.byName] || ''),
        createdAt: Number(r[idx.createdAt]) || 0,
      };
    })
    .sort(function (a, b) { return b.createdAt - a.createdAt; });
}

function portalAddHistory_(projectId, text, user) {
  portalSheet_('ProjectHistory').appendRow([
    'h_' + Date.now(),
    projectId,
    portalSanitize_(text, 500),
    user.id,
    user.name,
    Date.now(),
  ]);
}

function getOrCreateDriveFolder_() {
  var folders = DriveApp.getFoldersByName(PORTAL.DRIVE_FOLDER);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(PORTAL.DRIVE_FOLDER);
}

function portalUploadFile_(data, auth) {
  var projectId = String(data.projectId || '');
  var project = portalFindProject_(projectId);
  if (!project) return { ok: false, error: 'not_found' };
  if (auth.user.role !== 'admin' && project.userId !== auth.user.id) {
    return { ok: false, error: 'forbidden' };
  }
  var filename = portalSanitize_(data.filename, 200) || 'file';
  var mime = portalSanitize_(data.mime, 120) || 'application/octet-stream';
  var b64 = String(data.data || '');
  if (!b64) return { ok: false, error: 'no_data' };
  var bytes = Utilities.base64Decode(b64);
  if (bytes.length > 25 * 1024 * 1024) return { ok: false, error: 'file_too_large' };

  var folder = getOrCreateDriveFolder_();
  var blob = Utilities.newBlob(bytes, mime, filename);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var id = 'f_' + Date.now();
  var url = file.getUrl();
  var targetUserId = project.userId;
  portalSheet_('Files').appendRow([
    id, projectId, targetUserId, filename, mime, bytes.length,
    file.getId(), url, auth.user.id, Date.now(),
  ]);

  if (auth.user.role === 'admin') {
    portalAddHistory_(projectId, 'Загружен файл: ' + filename, auth.user);
  }
  return { ok: true, file: { id: id, filename: filename, mime: mime, size: bytes.length, url: url, createdAt: Date.now() } };
}

function portalListFiles_(projectId) {
  var sh = portalSheet_('Files');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return [];
  var headers = rows.shift();
  var idx = indexMap_(headers);
  return rows
    .filter(function (r) { return String(r[idx.projectId]) === String(projectId); })
    .map(function (r) {
      return {
        id: String(r[idx.id]),
        filename: String(r[idx.filename] || ''),
        mime: String(r[idx.mime] || ''),
        size: Number(r[idx.size]) || 0,
        url: String(r[idx.driveUrl] || ''),
        createdAt: Number(r[idx.createdAt]) || 0,
      };
    })
    .sort(function (a, b) { return b.createdAt - a.createdAt; });
}

function portalGetMessages_(data) {
  var auth = portalAuth_(data, false);
  if (!auth.ok) return auth;
  var userId = auth.user.role === 'admin' && data.userId ? data.userId : auth.user.id;
  var since = Number(data.since) || 0;
  var messages = portalListMessages_(userId, since);
  return { ok: true, messages: messages };
}

function portalListMessages_(userId, since) {
  var sh = portalSheet_('Messages');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return [];
  var headers = rows.shift();
  var idx = indexMap_(headers);
  return rows
    .filter(function (r) { return String(r[idx.userId]) === String(userId); })
    .filter(function (r) { return Number(r[idx.createdAt]) > since; })
    .map(function (r) { return portalRowToMessage_(r, idx); })
    .sort(function (a, b) { return a.createdAt - b.createdAt; });
}

function portalRowToMessage_(r, idx) {
  var fileId = String(r[idx.fileId] || '');
  var file = fileId ? portalFindFileMeta_(fileId) : null;
  return {
    id: String(r[idx.id]),
    userId: String(r[idx.userId]),
    senderId: String(r[idx.senderId]),
    senderRole: String(r[idx.senderRole] || ''),
    text: String(r[idx.text] || ''),
    file: file,
    status: String(r[idx.status] || 'sent'),
    createdAt: Number(r[idx.createdAt]) || 0,
  };
}

function portalFindFileMeta_(fileId) {
  var sh = portalSheet_('Files');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return null;
  var headers = rows.shift();
  var idx = indexMap_(headers);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idx.id]) === fileId) {
      return {
        id: fileId,
        filename: String(rows[i][idx.filename]),
        mime: String(rows[i][idx.mime]),
        size: Number(rows[i][idx.size]),
        url: String(rows[i][idx.driveUrl]),
      };
    }
  }
  return null;
}

function portalSendMessage_(data) {
  var auth = portalAuth_(data, true);
  if (!auth.ok) return auth;
  var chatUserId = auth.user.role === 'admin' && data.userId ? data.userId : auth.user.id;
  if (auth.user.role !== 'admin' && chatUserId !== auth.user.id) {
    return { ok: false, error: 'forbidden' };
  }

  var fileId = '';
  if (data.file && data.file.data) {
    var fakeProject = { userId: chatUserId };
    var upload = portalUploadChatFile_(data.file, auth, chatUserId);
    if (!upload.ok) return upload;
    fileId = upload.fileId;
  }

  var id = 'm_' + Date.now();
  var text = portalSanitize_(data.text, 4000);
  portalSheet_('Messages').appendRow([
    id, chatUserId, auth.user.id, auth.user.role, text, fileId, 'sent', Date.now(),
  ]);

  var msg = portalRowToMessage_(
    [id, chatUserId, auth.user.id, auth.user.role, text, fileId, 'sent', Date.now()],
    { id: 0, userId: 1, senderId: 2, senderRole: 3, text: 4, fileId: 5, status: 6, createdAt: 7 }
  );

  if (auth.user.role === 'client') {
    var adminEmail = getProps_().getProperty('ADMIN_EMAIL') || CONFIG.ADMIN_EMAIL;
    portalSendEmail_(adminEmail, '💬 Новое сообщение — ' + auth.user.name,
      '<p>Клиент <b>' + escapeHtml_(auth.user.name) + '</b> написал в чат.</p><p>' + escapeHtml_(text) + '</p>' +
      '<p><a href="' + CONFIG.SITE_URL + '/portal/#/admin/chat/' + chatUserId + '">Открыть чат</a></p>');
  }

  return { ok: true, message: msg };
}

function portalUploadChatFile_(fileData, auth, chatUserId) {
  var filename = portalSanitize_(fileData.filename, 200) || 'attachment';
  var mime = portalSanitize_(fileData.mime, 120) || 'application/octet-stream';
  var bytes = Utilities.base64Decode(String(fileData.data || ''));
  if (bytes.length > 15 * 1024 * 1024) return { ok: false, error: 'file_too_large' };
  var folder = getOrCreateDriveFolder_();
  var file = folder.createFile(Utilities.newBlob(bytes, mime, filename));
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  var id = 'f_' + Date.now();
  portalSheet_('Files').appendRow([
    id, '', chatUserId, filename, mime, bytes.length, file.getId(), file.getUrl(), auth.user.id, Date.now(),
  ]);
  return { ok: true, fileId: id };
}

function portalMarkRead_(data) {
  var auth = portalAuth_(data, true);
  if (!auth.ok) return auth;
  var ids = data.ids || [];
  var sh = portalSheet_('Messages');
  var rows = sh.getDataRange().getValues();
  var headers = rows.shift();
  var idx = indexMap_(headers);
  var chatUserId = auth.user.role === 'admin' && data.userId ? String(data.userId) : auth.user.id;
  for (var i = 0; i < rows.length; i++) {
    if (ids.indexOf(String(rows[i][idx.id])) < 0) continue;
    if (String(rows[i][idx.userId]) !== chatUserId) continue;
    if (String(rows[i][idx.senderId]) === auth.user.id) continue;
    sh.getRange(i + 2, idx.status + 1).setValue('read');
  }
  return { ok: true };
}

function portalAdminGetClients_(data) {
  var auth = portalRequireAdmin_(data);
  if (!auth.ok) return auth;
  var sh = portalSheet_('Users');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return { ok: true, clients: [] };
  var headers = rows.shift();
  var idx = indexMap_(headers);
  var clients = rows
    .filter(function (r) { return String(r[idx.role]) === 'client'; })
    .map(function (r) { return portalPublicUser_(portalRowToUser_(r, idx)); });
  return { ok: true, clients: clients };
}

function portalAdminCreateClient_(data) {
  var auth = portalRequireAdmin_(data);
  if (!auth.ok) return auth;
  var email = portalSanitizeEmail_(data.email);
  var name = portalSanitize_(data.name, 80);
  var password = String(data.password || Utilities.base64Encode(Utilities.getUuid()).slice(0, 12));
  if (!portalValidEmail_(email)) return { ok: false, error: 'invalid_email' };
  if (portalFindUserByEmail_(email)) return { ok: false, error: 'email_exists' };
  var salt = portalSalt_();
  var id = 'u_' + Date.now();
  portalCreateUserRow_(portalSheet_('Users'), {
    id: id, email: email, name: name, passwordHash: portalHash_(password, salt),
    salt: salt, role: 'client', avatarUrl: '', emailVerified: 'true', createdAt: Date.now(),
  });
  portalSendEmail_(email, 'Доступ к личному кабинету NexoraWeb',
    '<h2>Ваш аккаунт создан</h2><p>Email: ' + escapeHtml_(email) + '</p><p>Пароль: ' + escapeHtml_(password) + '</p>' +
    '<p><a href="' + CONFIG.SITE_URL + '/portal/">Войти в кабинет</a></p>');
  return { ok: true, user: { id: id, email: email, name: name } };
}

function portalAdminDeleteClient_(data) {
  var auth = portalRequireAdmin_(data);
  if (!auth.ok) return auth;
  var userId = String(data.userId || '');
  if (!userId || userId === 'u_admin') return { ok: false, error: 'forbidden' };
  var sh = portalSheet_('Users');
  var rows = sh.getDataRange().getValues();
  var headers = rows.shift();
  var idx = indexMap_(headers);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idx.id]) === userId) { sh.deleteRow(i + 2); return { ok: true }; }
  }
  return { ok: false, error: 'not_found' };
}

function portalAdminCreateProject_(data) {
  var auth = portalRequireAdmin_(data);
  if (!auth.ok) return auth;
  var userId = String(data.userId || '');
  if (!portalFindUserById_(userId)) return { ok: false, error: 'user_not_found' };
  var id = 'cp_' + Date.now();
  var now = Date.now();
  var start = portalSanitize_(data.startDate, 20) || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var due = portalSanitize_(data.dueDate, 20) || '';
  portalSheet_('ClientProjects').appendRow([
    id, userId,
    portalSanitize_(data.title, 120),
    portalSanitize_(data.description, 2000),
    'Планирование', 0, start, due, '', '', now,
  ]);
  portalAddHistory_(id, 'Проект создан', auth.user);
  return { ok: true, project: portalFindProject_(id) };
}

function portalAdminUpdateProject_(data) {
  var auth = portalRequireAdmin_(data);
  if (!auth.ok) return auth;
  var project = portalFindProject_(data.projectId);
  if (!project) return { ok: false, error: 'not_found' };
  var sh = portalSheet_('ClientProjects');
  var rows = sh.getDataRange().getValues();
  var headers = rows.shift();
  var idx = indexMap_(headers);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][idx.id]) !== String(data.projectId)) continue;
    var rowNum = i + 2;
    if (data.title) sh.getRange(rowNum, idx.title + 1).setValue(portalSanitize_(data.title, 120));
    if (data.description !== undefined) sh.getRange(rowNum, idx.description + 1).setValue(portalSanitize_(data.description, 2000));
    if (data.status && PORTAL.STATUSES.indexOf(data.status) >= 0) {
      sh.getRange(rowNum, idx.status + 1).setValue(data.status);
      portalAddHistory_(data.projectId, 'Статус: ' + data.status, auth.user);
    }
    if (data.progress !== undefined) {
      var p = Math.max(0, Math.min(100, Number(data.progress) || 0));
      sh.getRange(rowNum, idx.progress + 1).setValue(p);
    }
    if (data.dueDate) sh.getRange(rowNum, idx.dueDate + 1).setValue(portalSanitize_(data.dueDate, 20));
    if (data.archiveUrl) sh.getRange(rowNum, idx.archiveUrl + 1).setValue(portalSanitize_(data.archiveUrl, 500));
    break;
  }
  return { ok: true, project: portalFindProject_(data.projectId) };
}

function portalAdminGetAllProjects_(data) {
  var auth = portalRequireAdmin_(data);
  if (!auth.ok) return auth;
  var sh = portalSheet_('ClientProjects');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return { ok: true, projects: [] };
  var headers = rows.shift();
  var idx = indexMap_(headers);
  var projects = rows.map(function (r) { return portalRowToProject_(r, idx); });
  return { ok: true, projects: projects };
}

function portalAdminGetChats_(data) {
  var auth = portalRequireAdmin_(data);
  if (!auth.ok) return auth;
  var sh = portalSheet_('Messages');
  var rows = sh.getDataRange().getValues();
  if (rows.length <= 1) return { ok: true, chats: [] };
  var headers = rows.shift();
  var idx = indexMap_(headers);
  var usersMap = portalUsersMap_();
  var map = {};
  rows.forEach(function (r) {
    var uid = String(r[idx.userId]);
    var ts = Number(r[idx.createdAt]) || 0;
    if (!map[uid] || ts > map[uid].lastAt) {
      var user = usersMap[uid];
      map[uid] = {
        userId: uid,
        name: user ? user.name : uid,
        email: user ? user.email : '',
        lastText: String(r[idx.text] || '').slice(0, 80),
        lastAt: ts,
        unread: 0,
      };
    }
  });
  rows.forEach(function (r) {
    var uid = String(r[idx.userId]);
    if (String(r[idx.senderRole]) === 'client' && String(r[idx.status]) === 'sent') {
      if (map[uid]) map[uid].unread++;
    }
  });
  var chats = Object.keys(map).map(function (k) { return map[k]; });
  chats.sort(function (a, b) { return b.lastAt - a.lastAt; });
  return { ok: true, chats: chats };
}

function portalUsersMap_() {
  var cache = CacheService.getScriptCache();
  var cached = cache.get('users_map');
  if (cached) {
    try { return JSON.parse(cached); } catch (e) {}
  }
  var sh = portalSheet_('Users');
  var rows = sh.getDataRange().getValues();
  var map = {};
  if (rows.length > 1) {
    var headers = rows.shift();
    var idx = indexMap_(headers);
    rows.forEach(function (r) {
      map[String(r[idx.id])] = {
        id: String(r[idx.id]),
        name: String(r[idx.name] || ''),
        email: String(r[idx.email] || ''),
      };
    });
  }
  try { cache.put('users_map', JSON.stringify(map), 120); } catch (e) {}
  return map;
}

function portalHandleAction_(data) {
  var action = data.action;
  if (action === 'portalResetAdmin') {
    if (!checkSecret_(data.secret)) return { ok: false, error: 'unauthorized' };
    return { ok: true, message: portalEnsureAdmin_(true) };
  }
  var publicActions = ['portalRegister', 'portalLogin', 'portalForgotPassword', 'portalResetPassword'];
  if (publicActions.indexOf(action) >= 0) {
    if (action === 'portalRegister') return portalRegister_(data);
    if (action === 'portalLogin') return portalLogin_(data);
    if (action === 'portalForgotPassword') return portalForgotPassword_(data);
    if (action === 'portalResetPassword') return portalResetPassword_(data);
  }

  if (action === 'portalLogout') return portalLogout_(data);
  if (action === 'portalGetMe') return portalGetMe_(data);
  if (action === 'portalGetDashboard') return portalGetDashboard_(data);
  if (action === 'portalUpdateProfile') return portalUpdateProfile_(data);
  if (action === 'portalChangePassword') return portalChangePassword_(data);
  if (action === 'portalChangeEmail') return portalChangeEmail_(data);
  if (action === 'portalGetMyProjects') return portalGetMyProjects_(data);
  if (action === 'portalGetProject') return portalGetProject_(data);
  if (action === 'portalGetMessages') return portalGetMessages_(data);
  if (action === 'portalSendMessage') return portalSendMessage_(data);
  if (action === 'portalMarkRead') return portalMarkRead_(data);
  if (action === 'portalUploadFile') {
    var auth = portalAuth_(data, true);
    if (!auth.ok) return auth;
    return portalUploadFile_(data, auth);
  }

  if (action === 'portalAdminGetClients') return portalAdminGetClients_(data);
  if (action === 'portalAdminCreateClient') return portalAdminCreateClient_(data);
  if (action === 'portalAdminDeleteClient') return portalAdminDeleteClient_(data);
  if (action === 'portalAdminCreateProject') return portalAdminCreateProject_(data);
  if (action === 'portalAdminUpdateProject') return portalAdminUpdateProject_(data);
  if (action === 'portalAdminGetAllProjects') return portalAdminGetAllProjects_(data);
  if (action === 'portalAdminGetChats') return portalAdminGetChats_(data);

  return null;
}

function portalDoGet_(e) {
  var p = e.parameter || {};
  if (p.action === 'portalVerify') {
    var res = portalVerifyEmail_(p.token);
    return html_(res.ok ? 'Email подтверждён' : 'Ошибка',
      res.ok ? '<h2>✅ Email подтверждён</h2><p><a href="' + CONFIG.SITE_URL + '/portal/">Войти в кабинет</a></p>'
        : '<h2>❌ Ссылка недействительна</h2>');
  }
  if (p.action === 'portalMessages') {
    return json_(portalGetMessages_({ session: p.session, since: p.since, userId: p.userId }));
  }
  if (p.action === 'portalHealth') {
    return json_({ ok: true, version: PORTAL.VERSION, service: 'NexoraWeb Portal' });
  }
  return null;
}
