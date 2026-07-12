<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tim extends Model
{
    protected $table = 'tim';

    protected $fillable = [
        'user_id',
        'nama_tim',
        'kelompok_umur',
        'logo_tim',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function jadwalPertandinanAsTim1(): HasMany
    {
        return $this->hasMany(JadwalPertandingan::class, 'tim_1_id');
    }

    public function jadwalPertandinanAsTim2(): HasMany
    {
        return $this->hasMany(JadwalPertandingan::class, 'tim_2_id');
    }

    public function klasemen(): HasMany
    {
        return $this->hasMany(Klasemen::class, 'tim_id');
    }

    public function hasilPemenang(): HasMany
    {
        return $this->hasMany(HasilPertandingan::class, 'tim_pemenang_id');
    }
}
