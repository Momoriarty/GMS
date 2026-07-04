<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends Model
{
    protected $table = 'events';

    protected $fillable = [
        'nama_event',
        'deskripsi',
        'tanggal_mulai',
        'tanggal_selesai',
        'lokasi',
        'kuota_tim',
        'biaya_pendaftaran',
        'status',
        'created_by',
    ];

    protected $casts = [
        'tanggal_mulai' => 'datetime:Y-m-d H:i:s',   
        'tanggal_selesai' => 'datetime:Y-m-d H:i:s',  
        'created_at' => 'datetime:Y-m-d H:i:s',
        'updated_at' => 'datetime:Y-m-d H:i:s',
        'biaya_pendaftaran' => 'integer',
        'kuota_tim' => 'integer',
    ];

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function pendaftaran(): HasMany
    {
        return $this->hasMany(Pendaftaran::class);
    }

    public function jadwalPertandingan(): HasMany
    {
        return $this->hasMany(JadwalPertandingan::class);
    }

    public function klasemen(): HasMany
    {
        return $this->hasMany(Klasemen::class);
    }
}
