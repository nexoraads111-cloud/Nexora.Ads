# Nexora.Ads

Сайт веб-студии NexoraWeb.

- **Сайт:** https://nexoraads.online
- **Бэкенд:** Google Apps Script (заявки и отзывы на почту)

## Структура

| Папка | Описание |
|-------|----------|
| `web/` | Next.js → GitHub Pages |
| `google-apps-script/` | Таблица + Gmail + модерация отзывов |

## Как работает

1. **Заявка** — форма на сайте → Google Apps Script → письмо на почту
2. **Отзыв** — форма → письмо с кнопками **Принять / Отклонить** → отзыв на сайте

Сайт обращается к GAS **напрямую** (без Render). URL и секрет в `web/public/js/nexora-config.js`.

## Деплой сайта

GitHub → Settings → Pages → Source: **GitHub Actions**

```bash
cd web && npm install && npm run build
```

## Настройка Google Apps Script

См. `google-apps-script/README.md`
