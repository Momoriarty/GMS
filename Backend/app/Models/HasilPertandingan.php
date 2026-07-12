<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HasilPertandingan extends Model
{
    protected $table = 'hasil_pertandingan';

    protected $fillable = [
        'jadwal_id',
        'skor_tim_1',
        'skor_tim_2',
        'tim_pemenang_id',
        'input_by',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function jadwal(): BelongsTo
    {
        return $this->belongsTo(JadwalPertandingan::class, 'jadwal_id');
    }

    public function timPemenang(): BelongsTo
    {
        return $this->belongsTo(Tim::class, 'tim_pemenang_id');
    }

    public function inputBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'input_by');
    }
}
