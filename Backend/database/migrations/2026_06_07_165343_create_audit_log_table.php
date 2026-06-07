<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('audit_log', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('tabel');
            $table->enum('aksi', ['create', 'update', 'delete', 'login', 'logout']);
            $table->timestamp('tanggal')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_log');
    }
};