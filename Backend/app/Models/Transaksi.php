<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaksi extends Model
{
    protected $table = 'transaksi';

    protected $fillable = [
        'event_id',
        'pendaftaran_id',
        'jenis',
        'nominal',
        'kategori',
        'metode_pembayaran',
        'keterangan',
        'tanggal_transaksi',
        'dibuat_oleh',
    ];

    protected $casts = [
        'tanggal_transaksi' => 'date',
        'nominal' => 'float',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function pendaftaran(): BelongsTo
    {
        return $this->belongsTo(Pendaftaran::class, 'pendaftaran_id');
    }

    public function pembuat(): BelongsTo
    {
        return $this->belongsTo(User::class, 'dibuat_oleh');
    }
}
