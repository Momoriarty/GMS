<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tim extends Model
{
    protected $table = 'tim';

    protected $fillable = [
        'user_id',
        'nama_tim',
        'logo_tim',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function jadwalPertandinanAsTim1()
    {
        return $this->hasMany(JadwalPertandingan::class, 'tim_1_id');
    }

    public function jadwalPertandinanAsTim2()
    {
        return $this->hasMany(JadwalPertandingan::class, 'tim_2_id');
    }

    public function klasemen()
    {
        return $this->hasMany(Klasemen::class);
    }

    public function hasilPemenang()
    {
        return $this->hasMany(HasilPertandingan::class, 'tim_pemenang_id');
    }
}
