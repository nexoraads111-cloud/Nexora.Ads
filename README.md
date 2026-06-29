# Nexora.Ads

Сайт веб-студии NexoraWeb.

- **Сайт:** https://nexoraads.online
- **API + бот:** https://nexora-cabinet-api.onrender.com

## Структура

| Папка | Описание |
|-------|----------|
| `web/` | Next.js фронтенд (React, static export) |
| `telegram-admin/` | API + Telegram-бот для кабинета и заявок |
| `css/`, `js/`, `index.html` | Старая статическая версия (резерв) |

## Деплой сайта (GitHub Pages)

1. GitHub → **Settings** → **Pages** → Source: **GitHub Actions**
2. При push в `main` workflow `.github/workflows/deploy.yml` собирает `web/` и публикует

Локально:

```bash
cd web && npm install && npm run build
```

## Кабинет и уведомления

1. Клиент указывает **@telegram** в заявке
2. Нажимает **Start** в боте @Nexora_loginbot и входит в `/cabinet/`
3. Админ меняет статус кнопками в Telegram
4. Клиент видит статус в кабинете и получает сообщение в боте

## API (Render)

```bash
cd telegram-admin && npm install && npm start
```

Переменные: `BOT_TOKEN`, `ADMIN_ID`, `SESSION_SECRET`, `SITE_URL`, `GAS_WEB_APP_URL`, `GAS_SECRET`.

Отзывы и email-заявки: **`google-apps-script/README.md`**
