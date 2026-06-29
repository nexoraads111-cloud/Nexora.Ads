# Nexora.Ads

Сайт веб-студии NexoraWeb.

- **Сайт:** https://nexoraads.online
- **API + бот:** https://nexora-cabinet-api.onrender.com

## Структура

| Папка | Описание |
|-------|----------|
| `web/` | Next.js фронтенд (React, static export) |
| `telegram-admin/` | API + Telegram-бот для заявок и отзывов |
| `css/`, `js/`, `index.html` | Старая статическая версия (резерв) |

## Деплой сайта (GitHub Pages)

1. GitHub → **Settings** → **Pages** → Source: **GitHub Actions**
2. При push в `main` workflow `.github/workflows/deploy.yml` собирает `web/` и публикует

Локально:

```bash
cd web && npm install && npm run build
```

## Заявки и уведомления

1. Клиент оставляет заявку на сайте с **@telegram** в контакте
2. Нажимает **/start** в боте @Nexora_loginbot
3. Админ меняет статус кнопками в Telegram
4. Клиент получает статус в боте (`/orders` — список заказов)

## API (Render)

```bash
cd telegram-admin && npm install && npm start
```

Переменные: `BOT_TOKEN`, `ADMIN_ID`, `SITE_URL`, `GAS_WEB_APP_URL`, `GAS_SECRET`.

Отзывы и email-заявки: **`google-apps-script/README.md`**
