<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('jadwal_pertandingan', function (Blueprint $table) {
            $table->index('status');
            $table->index('waktu_pertandingan');
            $table->index(['event_id', 'waktu_pertandingan']);
            $table->index('tim_1_id');
            $table->index('tim_2_id');
        });
    }

    public function down(): void
    {
        Schema::table('jadwal_pertandingan', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['waktu_pertandingan']);
            $table->dropIndex(['event_id', 'waktu_pertandingan']);
            $table->dropIndex(['tim_1_id']);
            $table->dropIndex(['tim_2_id']);
        });
    }
};
