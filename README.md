# Nexora.Ads

Сайт веб-студии NexoraWeb.

- **Сайт:** https://nexoraads.online
- **API:** https://nexora-cabinet-api.onrender.com

## Структура

| Папка | Описание |
|-------|----------|
| `web/` | Next.js фронтенд (static export → GitHub Pages) |
| `telegram-admin/` | API-прокси к Google Apps Script |
| `google-apps-script/` | Отзывы и заявки → Google Sheets + Gmail |

## Как работает

### Заявки
1. Клиент заполняет форму на сайте
2. API отправляет в Google Apps Script
3. Вам на почту письмо с данными заявки

### Отзывы
1. Клиент оставляет отзыв на сайте
2. Вам на почту письмо с кнопками **Принять / Отклонить**
3. После принятия отзыв появляется на сайте

## Деплой

**Сайт:** push в `main` → GitHub Actions публикует `web/out`

**API:** Render (`render.yaml`) — нужны `GAS_WEB_APP_URL` и `GAS_SECRET`

**Google Apps Script:** см. `google-apps-script/README.md`
