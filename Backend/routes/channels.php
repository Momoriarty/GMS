<?php

use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\Channel;
use Illuminate\Support\Facades\Auth;

/**
 * Here you may register all of the event broadcasting channels that your
 * application supports. The given channel authorization callbacks are used
 * to check if an authenticated user can listen to the channel.
 */

Broadcast::channel('notifikasi.{userId}', function ($user, $userId) {
    return (int) $user->id === (int) $userId;
});
