<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class JadwalPertandingan extends Model
{
    protected $table = 'jadwal_pertandingan';

    protected $fillable = [
        'event_id',
        'tim_1_id',
        'tim_2_id',
        'waktu_pertandingan',
        'lokasi_lapangan',
        'status',
    ];

    protected $casts = [
        'waktu_pertandingan' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function tim1(): BelongsTo
    {
        return $this->belongsTo(Tim::class, 'tim_1_id');
    }

    public function tim2(): BelongsTo
    {
        return $this->belongsTo(Tim::class, 'tim_2_id');
    }

    public function hasil(): HasOne
    {
        return $this->hasOne(HasilPertandingan::class, 'jadwal_id');
    }
}