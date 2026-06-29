# Google Apps Script — отзывы и заявки на почту

**Google Таблица** + **Gmail** + кнопки **Принять / Отклонить**. Сайт на GitHub Pages ходит в GAS напрямую — **Render не нужен**.

## Быстрая настройка

### 1. Создайте таблицу
1. [Google Drive](https://drive.google.com) → **Создать** → **Google Таблицы**
2. Назовите: `NexoraWeb Data`

### 2. Вставьте скрипт
1. **Расширения** → **Apps Script**
2. Вставьте `Code.gs` из этой папки
3. `CONFIG.ADMIN_EMAIL` — ваша почта Gmail
4. `CONFIG.SPREADSHEET_ID` — ID из URL таблицы (`/d/ВОТ_ЭТОТ_ID/edit`)
5. `CONFIG.SECRET` — придумайте секрет (тот же в `nexora-config.js` на сайте)

### 3. Запустите `setup()`
Разрешите доступ к таблице и почте.

### 4. Опубликуйте Web App
1. **Развернуть** → **Новое развертывание** (при обновлении — **Новая версия**)
2. Тип: **Веб-приложение**, выполнять как **Я**, доступ **Все**
3. Скопируйте URL

### 5. Укажите URL на сайте
Файл `web/public/js/nexora-config.js`:

```javascript
const NEXORA_GAS_URL = 'https://script.google.com/macros/s/ВАШ_ID/exec';
const NEXORA_GAS_SECRET = 'nexora-gas-secret-change-me'; // как CONFIG.SECRET
```

После push сайт обновится на GitHub Pages.

---

## Как работает

### Заявки
Форма на сайте → GAS → письмо на `ADMIN_EMAIL`

### Отзывы
Форма → письмо с **Принять / Отклонить** → одобренные видны на сайте (`?action=reviews`)

---

## Проверка

```
https://ВАШ-GAS-URL/exec?action=reviews
```
→ `[]` или список отзывов

Базовый URL:
```
https://ВАШ-GAS-URL/exec
```
→ `{"ok":true,"service":"NexoraWeb GAS"}`

---

## Безопасность

- `SECRET` в `nexora-config.js` виден в коде сайта — для небольшого лендинга это нормально; при спаме смените секрет в GAS и на сайте
- Кнопки модерации защищены уникальным `token` в письме
