<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    protected $table = 'audit_log';

    protected $fillable = [
        'user_id',
        'tabel',
        'aksi',
        'tanggal',
    ];

    protected $casts = [
        'tanggal' => 'datetime',
    ];

    public $timestamps = false;

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
