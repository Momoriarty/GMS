<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hasil_pertandingan', function (Blueprint $table) {
            $table->id();
            $table->foreignId('jadwal_id')->constrained('jadwal_pertandingan')->onDelete('cascade');
            $table->integer('skor_tim_1')->default(0);
            $table->integer('skor_tim_2')->default(0);
            $table->foreignId('tim_pemenang_id')->nullable()->constrained('tim')->onDelete('set null');
            $table->foreignId('input_by')->constrained('users')->onDelete('restrict');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hasil_pertandingan');
    }
};
