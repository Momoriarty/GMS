<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QrisSetting extends Model
{
    use HasFactory;

    protected $table = 'qris_settings';

    protected $fillable = [
        'static_payload',
    ];
}
