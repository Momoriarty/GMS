# Frontend: Realtime (Echo + Pusher) Setup

This project uses `laravel-echo` and `pusher-js` to subscribe to private channels.

1. Install packages

```bash
cd Frontend
npm install
npm install pusher-js laravel-echo
```

2. Env variables (Frontend/.env)

```
VITE_PUSHER_APP_KEY=local_key
VITE_PUSHER_HOST=127.0.0.1
VITE_PUSHER_PORT=6001
VITE_PUSHER_SCHEME=http
```

3. Helper

A helper `src/utils/echo.js` is provided. Use it like:

```js
import { createEcho } from './utils/echo';

const token = localStorage.getItem('token');
const echo = createEcho(token);

echo.private(`notifikasi.${userId}`).listen('NotifikasiCreated', (e) => {
  console.log('received', e);
});
```

4. Notes
- If you use Sanctum cookie auth, Echo auth endpoint will use cookies — ensure same origin or proper CORS.
- If you use token auth, the helper sends `Authorization: Bearer <token>` header.
