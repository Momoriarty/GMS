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
        try {
            Schema::table('events', function (Blueprint $table) {
                $table->index('status');
            });
        } catch (Exception $e) {
        }

        try {
            Schema::table('jadwal_pertandingan', function (Blueprint $table) {
                $table->index('status');
            });
        } catch (Exception $e) {
        }

        try {
            Schema::table('jadwal_pertandingan', function (Blueprint $table) {
                $table->index('waktu_pertandingan');
            });
        } catch (Exception $e) {
        }

        try {
            Schema::table('pendaftaran', function (Blueprint $table) {
                $table->index('status');
            });
        } catch (Exception $e) {
        }

        try {
            Schema::table('transaksis', function (Blueprint $table) {
                $table->index('jenis');
            });
        } catch (Exception $e) {
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('jadwal_pertandingan', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['waktu_pertandingan']);
        });

        Schema::table('pendaftaran', function (Blueprint $table) {
            $table->dropIndex(['status']);
        });

        Schema::table('transaksis', function (Blueprint $table) {
            $table->dropIndex(['jenis']);
        });
    }
};
