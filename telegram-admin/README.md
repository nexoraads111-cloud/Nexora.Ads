# Nexora API

Прокси к Google Apps Script: заявки и отзывы на почту.

## Быстрый старт

```bash
cd telegram-admin
cp .env.example .env
npm install
npm start
```

## Google Apps Script

См. `../google-apps-script/README.md`

## API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/reviews` | Одобренные отзывы (Google Sheets) |
| POST | `/api/reviews` | Отправить отзыв на модерацию → письмо с кнопками |
| POST | `/api/send-application` | Заявка с сайта → письмо на почту |

## Render

Переменные: `GAS_WEB_APP_URL`, `GAS_SECRET`

Проверка: `GET /api/health` → `{ "ok": true, "gas": true }`
