<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AuditLogSeeder extends Seeder
{
    public function run(): void
    {
        $admin = DB::table('users')
            ->where('role', 'admin')
            ->value('id');

        $peserta = DB::table('users')
            ->where('role', 'peserta')
            ->pluck('id');

        $logs = [
            [
                'user_id' => $admin,
                'tabel' => 'events',
                'aksi' => 'create',
            ],
            [
                'user_id' => $admin,
                'tabel' => 'events',
                'aksi' => 'update',
            ],
            [
                'user_id' => $admin,
                'tabel' => 'jadwal_pertandingan',
                'aksi' => 'create',
            ],
            [
                'user_id' => $admin,
                'tabel' => 'hasil_pertandingan',
                'aksi' => 'create',
            ],
            [
                'user_id' => $admin,
                'tabel' => 'pendaftaran',
                'aksi' => 'update',
            ],
            [
                'user_id' => $peserta[0] ?? null,
                'tabel' => 'users',
                'aksi' => 'login',
            ],
            [
                'user_id' => $peserta[1] ?? null,
                'tabel' => 'users',
                'aksi' => 'login',
            ],
            [
                'user_id' => $peserta[0] ?? null,
                'tabel' => 'users',
                'aksi' => 'logout',
            ],
        ];

        foreach ($logs as $item) {
            DB::table('audit_logs')->insert([
                ...$item,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
