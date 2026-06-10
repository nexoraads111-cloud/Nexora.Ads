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

## � Шаг 1: Настройка Firestore Security Rules

1. Перейди в [Firebase Console](https://console.firebase.google.com)
2. Выбери проект **nexorawebkook**
3. Firestore Database → **Rules**
4. Замени всё содержимое на:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Каждый может добавлять отзывы, только читать одобренные
    match /reviews/{document=**} {
      allow create: if true;
      allow read: if resource.data.approved == true;
      allow update, delete: if false;
    }
  }
}
```

5. Нажми **Publish**

## 🚀 Шаг 2: Развёртывание Cloud Functions

### Windows PowerShell:

```powershell
# 1. Установи Firebase CLI (если не установлен)
npm install -g firebase-tools

# 2. Залогинься в Firebase
firebase login

# 3. Перейди в папку с функциями
cd firebase\functions

# 4. Установи зависимости
npm install

# 5. Вернись в корневую папку проекта
cd ..\..

# 6. Разверни функции
firebase deploy --only functions
```

После этого ты увидишь вывод типа:
```
✔ Deploy complete!

Project Console: https://console.firebase.google.com/project/nexorawebkook/overview
Function URL (telegramWebhook): https://YOUR_REGION-nexorawebkook.cloudfunctions.net/telegramWebhook
```

## 🤖 Шаг 3: Установка Telegram вебхука

После развёртывания functions, замени `YOUR_FUNCTION_URL` на URL из вывода выше и выполни в PowerShell:

```powershell
$functionUrl = "https://YOUR_REGION-nexorawebkook.cloudfunctions.net/telegramWebhook"
$botToken = "8628051425:AAEyxy4OwOMWphMk4xxLv-991mtr7T0H2bE"

$body = @{
    url = $functionUrl
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://api.telegram.org/bot$botToken/setWebhook" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

Или просто скопируй эту ссылку в браузер (замени URL):
```
https://api.telegram.org/bot8628051425:AAEyxy4OwOMWphMk4xxLv-991mtr7T0H2bE/setWebhook?url=https://YOUR_REGION-nexorawebkook.cloudfunctions.net/telegramWebhook
```

## 📱 Процесс одобрения отзывов:

1. **Клиент оставляет отзыв** на сайте
   ↓
2. **Отправляется в Firebase** (Firestore collection "reviews")
   ↓
3. **Cloud Function срабатывает** → создает Firestore trigger
   ↓
4. **Админу приходит сообщение в Telegram** с содержимым отзыва и кнопками:
   - ✅ Подтвердить
   - ❌ Отклонить
   ↓
5. **Админ нажимает кнопку** → вебхук обрабатывает callback_query
   ↓
6. **Firestore обновляется**: `approved: true` или `approved: false`
   ↓
7. **Сайт автоматически загружает одобренный отзыв** (real-time sync)

## 🔄 Структура документа отзыва в Firestore:

```json
{
  "name": "Иван Петров",
  "title": "Отличный сайт!",
  "text": "Сделали быстро и качественно",
  "type": "Создание сайта",
  "rating": 5,
  "timestamp": "Fri Jun 10 2026 12:30:45 GMT+0200",
  "createdAt": 1718000000000,
  "approved": false,
  "approvedAt": null,
  "approvedBy": null
}
```

## 🐛 Тестирование:

### Проверить функции на ошибки:
```powershell
firebase functions:log
```

### Просмотреть все отзывы (включая новые):
1. [Firebase Console](https://console.firebase.google.com)
2. nexorawebkook → Firestore Database → **reviews**
3. Видишь новые документы? ✅

### Проверить вебхук в Telegram:
```powershell
$botToken = "8628051425:AAEyxy4OwOMWphMk4xxLv-991mtr7T0H2bE"
Invoke-WebRequest -Uri "https://api.telegram.org/bot$botToken/getWebhookInfo" -Method Get | ConvertTo-Json
```

## ⚙️ Если что-то не работает:

### ❌ Вебхук не установился
- Проверь, что функция развёрнута: `firebase deploy --only functions`
- Убедись, что URL правильный (скопирован из вывода deploy)
- Bot должен быть активен (отправь `/start` боту в Telegram)

### ❌ Отзывы приходят, но не отправляются в Telegram
- Проверь логи: `firebase functions:log`
- Убедись, что Bot Token и Admin Chat ID верные
- Может быть проблема в Firestore Rules (см. выше)

### ❌ На сайте не появляются отзывы
- Проверь Firestore Rules (reviews должны быть readable)
- Убедись, что `approved: true` в Firestore
- Открой консоль браузера (F12) и проверь ошибки
- Могут быть логи типа: "Reviews snapshot size: X"

## 🔗 Полезные ссылки:

- [Firebase Console](https://console.firebase.google.com/project/nexorawebkook)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Firebase Cloud Functions Docs](https://firebase.google.com/docs/functions)

---

## ✅ Итоговый чек-лист:

- [ ] Firestore Rules обновлены
- [ ] Firebase Functions развёрнуты (`firebase deploy --only functions`)
- [ ] Telegram вебхук установлен (`setWebhook`)
- [ ] Админ активировал бота (отправил `/start`)
- [ ] Первый тестовый отзыв успешно отправлен
- [ ] Админ получил уведомление в Telegram
- [ ] Админ нажал кнопку подтверждения
- [ ] Отзыв появился на сайте ✅

После всего этого система будет работать полностью автоматически! 🎉
