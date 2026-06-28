# Websockets Setup (Laravel + beyondcode/laravel-websockets)

This project uses Laravel broadcasting to emit realtime `NotifikasiCreated` events.
Below are steps to set up a local websocket server using beyondcode/laravel-websockets (recommended for development).

1. Install the package

```bash
cd Backend
composer require beyondcode/laravel-websockets
```

2. Publish migrations and config

```bash
php artisan vendor:publish --provider="BeyondCode\LaravelWebSockets\WebSocketsServiceProvider" --tag="migrations"
php artisan migrate
php artisan vendor:publish --provider="BeyondCode\\LaravelWebSockets\\WebSocketsServiceProvider" --tag="config"
```

3. Update `.env`

Add or update these values in `Backend/.env` (use same key in frontend Vite env as `VITE_PUSHER_APP_KEY`):

```
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=local
PUSHER_APP_KEY=local_key
PUSHER_APP_SECRET=local_secret
PUSHER_HOST=127.0.0.1
PUSHER_PORT=6001
PUSHER_SCHEME=http
MIDTRANS_NOTIFICATION_URL=https://<your-ngrok-or-domain>/api/midtrans/webhook
```

4. Start the websocket server

```bash
php artisan websockets:serve
```

5. Run the Laravel server

```bash
php artisan serve --port=8000
```

6. Ensure `config/broadcasting.php` has `pusher` configured to read `PUSHER_HOST` and `PUSHER_PORT`.

Notes:
- For production you can use Pusher cloud by setting `BROADCAST_DRIVER=pusher` and real `PUSHER_APP_*` credentials.
- If using private channels with Sanctum cookie authentication, make sure frontend and backend domains align for cookie auth.
