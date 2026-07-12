<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('klasemen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained('events')->onDelete('cascade');
            $table->foreignId('tim_id')->constrained('tim')->onDelete('cascade');
            $table->integer('main')->default(0);
            $table->integer('menang')->default(0);
            $table->integer('seri')->default(0);
            $table->integer('kalah')->default(0);
            $table->integer('gol_masuk')->default(0);
            $table->integer('gol_kemasukan')->default(0);
            $table->timestamps();

            $table->unique(['event_id', 'tim_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('klasemen');
    }
};
