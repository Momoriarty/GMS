<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('qris_settings', function (Blueprint $table) {
            $table->id();
            $table->text('static_payload'); // raw EMVCo string
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qris_settings');
    }
};
