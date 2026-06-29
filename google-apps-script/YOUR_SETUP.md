# Ваш URL Apps Script — подключение к Render

## Ваш Web App URL
```
https://script.google.com/macros/s/AKfycbxvE3e_uv8rYURscjC3YJxVmMmTLppuQvpQOzIRsRUI-Ngd5_88gniscbB-P4JlRfs4/exec
```

## Исправление ошибки (обязательно)

Сейчас скрипт падает, потому что не привязан к таблице.

### Шаг 1 — ID таблицы
1. Откройте вашу Google Таблицу `NexoraWeb Data`
2. Скопируйте ID из адресной строки:
   ```
   https://docs.google.com/spreadsheets/d/СКОПИРУЙТЕ_ЭТОТ_ID/edit
   ```

### Шаг 2 — обновите код
1. Apps Script → откройте `Code.gs`
2. Вставьте **новый код** из репозитория (`google-apps-script/Code.gs`)
3. В строке `SPREADSHEET_ID: ''` вставьте ваш ID:
   ```javascript
   SPREADSHEET_ID: 'ваш-id-из-url',
   ```

### Шаг 3 — setup
1. Выберите функцию **`setup`** → **Выполнить**
2. Разрешите доступ (таблица + почта)

### Шаг 4 — новое развертывание
1. **Развернуть** → **Управление развертываниями**
2. **Изменить** (карандаш) → **Версия: Новая версия** → **Развернуть**

### Шаг 5 — Render
[Render Dashboard](https://dashboard.render.com) → `nexora-cabinet-api` → **Environment**:

| Key | Value |
|-----|-------|
| `GAS_WEB_APP_URL` | `https://script.google.com/macros/s/AKfycbxvE3e_uv8rYURscjC3YJxVmMmTLppuQvpQOzIRsRUI-Ngd5_88gniscbB-P4JlRfs4/exec` |
| `GAS_SECRET` | `nexora-gas-secret-change-me` |

Сохраните и дождитесь перезапуска.

## Проверка
Откройте в браузере:
```
https://script.google.com/macros/s/AKfycbxvE3e_uv8rYURscjC3YJxVmMmTLppuQvpQOzIRsRUI-Ngd5_88gniscbB-P4JlRfs4/exec?action=reviews
```
Должно показать: `[]`

Затем:
```
https://nexora-cabinet-api.onrender.com/api/health
```
Должно быть: `"gas": true`
