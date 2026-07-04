<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transaksi', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->nullable()->constrained('events')->onDelete('set null');
            $table->foreignId('pendaftaran_id')->nullable()->constrained('pendaftaran')->onDelete('set null');
            $table->enum('jenis', ['pemasukan', 'pengeluaran']);
            $table->decimal('nominal', 12, 2);
            $table->string('kategori'); // e.g. 'Pendaftaran', 'Sponsor', 'Sewa Lapangan', 'Honor Wasit'
            $table->string('metode_pembayaran')->nullable(); // e.g. 'qris', 'bank_transfer_bca', 'cash'
            $table->text('keterangan')->nullable();
            $table->date('tanggal_transaksi');
            $table->foreignId('dibuat_oleh')->nullable()->constrained('users')->onDelete('set null'); // Admin/Panitia yang input
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transaksi');
    }
};

