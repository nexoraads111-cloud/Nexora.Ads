# Nexora API

Бэкенд: заявки с сайта, отзывы через Google Apps Script, уведомления в Telegram.

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
3. Клиент указывает @telegram в заявке и нажимает `/start` в боте — статус заказа приходит в Telegram

## API

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/reviews` | Одобренные отзывы (с Google Sheets) |
| POST | `/api/reviews` | Отправить отзыв на модерацию |
| POST | `/api/send-application` | Заявка с сайта |

Хранилище заказов: локальный файл `data/store.json` на Render.
