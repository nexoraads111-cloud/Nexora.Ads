const functions = require('firebase-functions');
const admin = require('firebase-admin');
const https = require('https');

admin.initializeApp();
const db = admin.firestore();

const BOT_TOKEN = '8628051425:AAEyxy4OwOMWphMk4xxLv-991mtr7T0H2bE';
const ADMIN_CHAT_ID = '6057196483';

// Отправка HTTP запроса в Telegram
function sendTelegramMessage(chatId, text, replyMarkup = null) {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const data = JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      reply_markup: replyMarkup
    });

    const options = {
      hostname: 'api.telegram.org',
      path: `/bot${BOT_TOKEN}/sendMessage`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`Telegram API error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Обновление статуса отзыва в Firestore
async function updateReviewStatus(reviewId, approved) {
  try {
    await db.collection('reviews').doc(reviewId).update({
      approved: approved,
      approvedAt: new Date(),
      approvedBy: 'telegram-admin'
    });
    console.log(`Review ${reviewId} updated: approved=${approved}`);
  } catch (e) {
    console.error('Error updating review:', e);
  }
}

// Cloud Function: при добавлении отзыва -> отправка в Telegram
exports.onNewReview = functions.firestore
  .document('reviews/{reviewId}')
  .onCreate(async (snap, context) => {
    const review = snap.data();
    const reviewId = context.params.reviewId;

    const text = `
🆕 <b>Новый отзыв</b>

📝 <b>${review.title || 'Отзыв'}</b>
⭐ Рейтинг: ${review.rating || 5}/5
👤 Имя: ${review.name || 'Аноним'}
🏷 Тип: ${review.type || 'Сайт'}

<b>Текст:</b>
${review.text || '(пусто)'}

---
<i>ID: ${reviewId}</i>
`;

    const replyMarkup = {
      inline_keyboard: [
        [
          { text: '✅ Подтвердить', callback_data: `approve:${reviewId}` },
          { text: '❌ Отклонить', callback_data: `reject:${reviewId}` }
        ]
      ]
    };

    try {
      await sendTelegramMessage(ADMIN_CHAT_ID, text, replyMarkup);
      console.log('Review notification sent to Telegram');
    } catch (e) {
      console.error('Error sending Telegram message:', e);
    }
  });

// API endpoint для обработки callback queries от Telegram
exports.telegramWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method not allowed');
  }

  try {
    const update = req.body;

    // Обработка callback query (нажатие кнопки)
    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const data = callbackQuery.data; // "approve:reviewId" или "reject:reviewId"
      const userId = callbackQuery.from.id;

      // Проверка, что это админ
      if (userId.toString() !== ADMIN_CHAT_ID) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const [action, reviewId] = data.split(':');

      if (action === 'approve') {
        await updateReviewStatus(reviewId, true);
        const responseText = '✅ Отзыв одобрен и добавлен на сайт!';
        
        // Редактирование сообщения (убрать кнопки)
        await new Promise((resolve, reject) => {
          const url = `https://api.telegram.org/bot${BOT_TOKEN}/editMessageReplyMarkup`;
          const updateData = JSON.stringify({
            chat_id: ADMIN_CHAT_ID,
            message_id: callbackQuery.message.message_id
          });

          const options = {
            hostname: 'api.telegram.org',
            path: `/bot${BOT_TOKEN}/editMessageReplyMarkup`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': updateData.length
            }
          };

          const httpReq = https.request(options, (httpRes) => {
            let body = '';
            httpRes.on('data', chunk => body += chunk);
            httpRes.on('end', () => resolve());
          });
          httpReq.on('error', reject);
          httpReq.write(updateData);
          httpReq.end();
        });

        // Ответ админу
        await sendTelegramMessage(ADMIN_CHAT_ID, responseText);
      } else if (action === 'reject') {
        await updateReviewStatus(reviewId, false);
        const responseText = '❌ Отзыв отклонен.';
        
        // Редактирование сообщения (убрать кнопки)
        await new Promise((resolve, reject) => {
          const url = `https://api.telegram.org/bot${BOT_TOKEN}/editMessageReplyMarkup`;
          const updateData = JSON.stringify({
            chat_id: ADMIN_CHAT_ID,
            message_id: callbackQuery.message.message_id
          });

          const options = {
            hostname: 'api.telegram.org',
            path: `/bot${BOT_TOKEN}/editMessageReplyMarkup`,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Content-Length': updateData.length
            }
          };

          const httpReq = https.request(options, (httpRes) => {
            let body = '';
            httpRes.on('data', chunk => body += chunk);
            httpRes.on('end', () => resolve());
          });
          httpReq.on('error', reject);
          httpReq.write(updateData);
          httpReq.end();
        });

        await sendTelegramMessage(ADMIN_CHAT_ID, responseText);
      }
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: error.message });
  }
});
