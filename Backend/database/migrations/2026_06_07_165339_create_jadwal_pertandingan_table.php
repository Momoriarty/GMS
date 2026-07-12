<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jadwal_pertandingan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->foreignId('tim_1_id')->constrained('tim')->onDelete('restrict');
            $table->foreignId('tim_2_id')->constrained('tim')->onDelete('restrict');
            $table->dateTime('waktu_pertandingan');
            $table->string('lokasi_lapangan');
            $table->enum('status', ['terjadwal', 'selesai', 'dibatalkan'])->default('terjadwal');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jadwal_pertandingan');
    }
};
