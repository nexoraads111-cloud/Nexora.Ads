# Nexora Cabinet API

Бэкенд: Telegram-вход, кабинет, отзывы и заявки через Google Apps Script.

## Быстрый старт

```bash
cd telegram-admin
cp .env.example .env
npm install
npm start
```

## Google Apps Script

См. `../google-apps-script/README.md`

## Telegram

1. Бот: **@Nexora_loginbot**
2. Админ ID: `6057196483` — напишите боту `/start`

## API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/reviews` | Одобренные отзывы (с Google Sheets) |
| POST | `/api/reviews` | Отправить отзыв на модерацию |
| POST | `/api/send-application` | Заявка с сайта |
| POST | `/api/auth/session` | Вход через Telegram |
| GET | `/api/orders` | Мои заказы (кабинет) |

Хранилище кабинета: локальный файл `data/store.json` на Render.
