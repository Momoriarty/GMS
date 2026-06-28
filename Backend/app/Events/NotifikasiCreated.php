<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\ShouldBroadcast;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use App\Models\Notifikasi;

class NotifikasiCreated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Notifikasi $notifikasi;

    /**
     * Create a new event instance.
     */
    public function __construct(Notifikasi $notifikasi)
    {
        $this->notifikasi = $notifikasi;
    }

    /**
     * Get the channels the event should broadcast on.
     * Broadcasting on a private channel for the specific user.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new PrivateChannel('notifikasi.' . $this->notifikasi->user_id);
    }

    public function broadcastWith()
    {
        return [
            'id' => $this->notifikasi->id,
            'user_id' => $this->notifikasi->user_id,
            'judul' => $this->notifikasi->judul,
            'pesan' => $this->notifikasi->pesan,
            'tipe' => $this->notifikasi->tipe,
            'is_read' => (bool) $this->notifikasi->is_read,
            'created_at' => $this->notifikasi->created_at->toDateTimeString(),
        ];
    }
}
