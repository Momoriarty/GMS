<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    public function event()
    {
        return $this->belongsTo(Event::class);
    }

    public function tim()
    {
        return $this->belongsTo(Tim::class);
    }
}
