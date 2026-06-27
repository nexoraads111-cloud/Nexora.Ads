# Nexora Cabinet API

Бэкенд для личного кабинета: Telegram-вход, заказы, Firebase.

## Быстрый старт

```bash
cd telegram-admin
cp .env.example .env   # заполните токены
npm install
npm start
```

## Настройка Telegram

1. Бот: **@Nexora_loginbot**
2. В @BotFather: `/setdomain` → `nexoraads.online` (для виджета входа на сайте)
3. Напишите боту `/start` с **админ-аккаунта** (ID `6057196483`), чтобы получать уведомления

## Firebase

1. [console.firebase.google.com](https://console.firebase.google.com) → проект **nexorakabinetr**
2. Realtime Database → **Rules** → вставьте `firebase/database.rules.dev.json` (для старта)
3. В `.env`: `FIREBASE_DATABASE_URL=https://nexorakabinetr-default-rtdb.europe-west1.firebasedatabase.app`

## Деплой (Render)

Используйте `render.yaml` в корне репозитория. После деплоя URL будет в `js/nexora-config.js`.

## API

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/telegram` | Вход через Telegram Widget |
| GET | `/api/profile` | Профиль (Bearer token) |
| PATCH | `/api/profile` | Сохранить имя/телефон |
| GET | `/api/orders` | Мои заказы |
| POST | `/api/orders` | Новая заявка |
| POST | `/api/orders/repeat` | Повтор заказа |
| POST | `/api/send-application` | Заявка с главной |

## Статусы заказа

`Принят` → `В работе` → `Готов` (кнопки в Telegram у админа)
