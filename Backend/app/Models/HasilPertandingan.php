<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    public function jadwal()
    {
        return $this->belongsTo(JadwalPertandingan::class);
    }

    public function timPemenang()
    {
        return $this->belongsTo(Tim::class, 'tim_pemenang_id');
    }

    public function inputBy()
    {
        return $this->belongsTo(User::class, 'input_by');
    }
}
