import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

export function createEcho(token = null) {
  // Ensure Pusher is available globally for laravel-echo
  window.Pusher = Pusher;

  const key = import.meta.env.VITE_PUSHER_APP_KEY || '';
  const host = import.meta.env.VITE_PUSHER_HOST || window.location.hostname;
  const port = import.meta.env.VITE_PUSHER_PORT || 6001;
  const scheme = import.meta.env.VITE_PUSHER_SCHEME || (location.protocol === 'https:' ? 'https' : 'http');
  const forceTLS = scheme === 'https';

  const echo = new Echo({
    broadcaster: 'pusher',
    key,
    wsHost: host,
    wsPort: port,
    wssPort: port,
    enabledTransports: ['ws', 'wss'],
    forceTLS,
    disableStats: true,
    auth: {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    },
  });

  return echo;
}
