<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Klasemen extends Model
{
    protected $table = 'klasemen';

    protected $fillable = [
        'event_id',
        'tim_id',
        'main',
        'menang',
        'seri',
        'kalah',
        'poin',
        'gol_masuk',
        'gol_kemasukan',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function tim(): BelongsTo
    {
        return $this->belongsTo(Tim::class, 'tim_id');
    }
}