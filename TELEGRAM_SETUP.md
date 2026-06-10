# 🚀 Развёртывание системы отзывов с Telegram

## ✅ Что сделано:

1. ✅ **Фронтенд** (`js/main.js`, `js/script-01.js`):
   - Отправка отзыва в Firebase Firestore
   - Загрузка только одобренных отзывов (approved: true)
   - Интеграция с `window.addReviewToFirebase`

2. ✅ **Firebase Cloud Functions** (`firebase/functions/index.js`):
   - `onNewReview`: отправляет уведомление в Telegram когда приходит новый отзыв
   - `telegramWebhook`: обрабатывает нажатие кнопок (Подтвердить/Отклонить)
   - При одобрении: отзыв добавляется на сайт
   - При отклонении: отзыв скрывается

## 📋 Шаги развёртывания:

### 1. Установи Firebase CLI (если не установлен)
```bash
npm install -g firebase-tools
```

### 2. Залогинься в Firebase
```bash
firebase login
```

### 3. Инициализируй проект Firebase (если не сделано)
```bash
firebase init
```

### 4. Перейди в папку functions и установи зависимости
```bash
cd firebase/functions
npm install
```

### 5. Установи Telegram вебхук
```bash
# Заменяем YOUR_FIREBASE_PROJECT на твой проект
curl -X POST https://api.telegram.org/bot8628051425:AAEyxy4OwOMWphMk4xxLv-991mtr7T0H2bE/setWebhook \
  -H "Content-Type: application/json" \
  -d '{"url":"https://YOUR_REGION-YOUR_FIREBASE_PROJECT.cloudfunctions.net/telegramWebhook"}'
```

### 6. Разверни функции
```bash
firebase deploy --only functions
```

## 🔐 Настройка Firestore Security Rules

Добавь в **Firestore Console** (Rules вкладка):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Каждый может добавлять отзывы, но не редактировать свои
    match /reviews/{document=**} {
      allow create: if true;
      allow read: if resource.data.approved == true;
      allow update, delete: if false;
    }
  }
}
```

## 📱 Процесс одобрения отзывов:

1. Клиент оставляет отзыв на сайте → отправляется в Firebase
2. Cloud Function `onNewReview` срабатывает
3. Админу в Telegram приходит уведомление с кнопками:
   - ✅ Подтвердить
   - ❌ Отклонить
4. Админ нажимает кнопку → `telegramWebhook` срабатывает
5. Firestore обновляет `approved: true` или `approved: false`
6. Фронтенд автоматически загружает одобренный отзыв

## 🔄 Структура документа отзыва в Firestore:

```json
{
  "name": "Иван Петров",
  "title": "Отличный сайт!",
  "text": "Сделали быстро и качественно",
  "type": "Создание сайта",
  "rating": 5,
  "timestamp": Timestamp,
  "createdAt": 1718000000000,
  "approved": false,  // true когда админ одобрит
  "approvedAt": null,
  "approvedBy": null
}
```

## 🐛 Тестирование:

### Локально (эмулятор):
```bash
firebase emulators:start --only functions
```

### Проверить логи:
```bash
firebase functions:log
```

### Проверить отзывы в Firestore:
1. Перейди в [Firebase Console](https://console.firebase.google.com)
2. Выбери проект `nexorawebkook`
3. Firestore Database → reviews
4. Проверь документы с `approved: true/false`

## ⚠️ Важно:

- Telegram Bot Token: **8628051425:AAEyxy4OwOMWphMk4xxLv-991mtr7T0H2bE**
- Admin Chat ID: **6057196483**
- Bot нужно активировать: отправь `/start` боту в Telegram

---

После развёртывания система будет работать полностью автоматически! 🎉
