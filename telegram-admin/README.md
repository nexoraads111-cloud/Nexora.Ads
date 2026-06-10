# Nexora Telegram Admin (local)

Simple local admin app to receive reviews via Telegram bot and approve/reject them.

Setup:

1. Create a Telegram bot with @BotFather and get its token.
2. In `telegram-admin/.env` create:

```
BOT_TOKEN=123456:ABC-DEF
```

3. Install dependencies and run:

```bash
cd telegram-admin
npm install
npm start
```

4. Open `http://localhost:3000` to see pending reviews. When a user sends a message to the bot, it appears here. Approve to add to `reviews.json` (the server will commit and try to push).

Notes:
- The server uses simple-git to commit and push; ensure your repo has push access configured.
- This app expects to run locally (polling bot). For production, consider webhooks and a hosted server.
