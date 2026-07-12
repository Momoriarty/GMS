<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class EventsSeeder extends Seeder
{
    public function run(): void
    {
        $admin = DB::table('users')->where('role', 'admin')->value('id');

        $events = [
            [
                'nama_event' => 'Turnamen Futsal Garuda Cup 2025',
                'deskripsi' => 'Turnamen futsal tahunan yang diselenggarakan oleh PT Garuda Melayu.',
                'tanggal_mulai' => '2025-07-01',
                'tanggal_selesai' => '2025-07-07',
                'lokasi' => 'GOR Garuda, Pekanbaru',
                'kuota_tim' => 16,
                'biaya_pendaftaran' => 500000,
                'status' => 'aktif',
            ],
            [
                'nama_event' => 'Futsal Open Tournament 2025',
                'deskripsi' => 'Turnamen terbuka untuk umum se-Riau.',
                'tanggal_mulai' => '2025-08-10',
                'tanggal_selesai' => '2025-08-15',
                'lokasi' => 'Lapangan Futsal Melayu, Pekanbaru',
                'kuota_tim' => 8,
                'biaya_pendaftaran' => 300000,
                'status' => 'draft',
            ],
        ];

        foreach ($events as $event) {
            DB::table('events')->insert([

                'created_by' => $admin,
                ...$event,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
