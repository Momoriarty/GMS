<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NotifikasiSeeder extends Seeder
{
    public function run(): void
    {
        $users = DB::table('users')->where('role', 'peserta')->pluck('id');

        $notifikasi = [
            [
                'user_id' => $users[0],
                'judul'   => 'Pendaftaran Diterima',
                'pesan'   => 'Pendaftaran tim kamu untuk Garuda Cup 2025 telah diterima.',
                'tipe'    => 'pendaftaran',
                'is_read' => false,
            ],
            [
                'user_id' => $users[1],
                'judul'   => 'Pendaftaran Diterima',
                'pesan'   => 'Pendaftaran tim kamu untuk Garuda Cup 2025 telah diterima.',
                'tipe'    => 'pendaftaran',
                'is_read' => true,
            ],
            [
                'user_id' => $users[2],
                'judul'   => 'Pendaftaran Menunggu Konfirmasi',
                'pesan'   => 'Pendaftaran tim kamu sedang ditinjau oleh admin.',
                'tipe'    => 'pendaftaran',
                'is_read' => false,
            ],
            [
                'user_id' => $users[3],
                'judul'   => 'Pendaftaran Ditolak',
                'pesan'   => 'Maaf, pendaftaran tim kamu ditolak. Silakan hubungi admin untuk info lebih lanjut.',
                'tipe'    => 'pendaftaran',
                'is_read' => false,
            ],
            [
                'user_id' => $users[0],
                'judul'   => 'Jadwal Pertandingan',
                'pesan'   => 'Pertandingan kamu dijadwalkan pada 1 Juli 2025 pukul 09:00 di Lapangan A.',
                'tipe'    => 'jadwal',
                'is_read' => false,
            ],
            [
                'user_id' => $users[0],
                'judul'   => 'Hasil Pertandingan',
                'pesan'   => 'Tim kamu menang 3-1 melawan Elang Muda pada pertandingan hari ini.',
                'tipe'    => 'hasil',
                'is_read' => false,
            ],
        ];

        foreach ($notifikasi as $item) {
            DB::table('notifikasi')->insert([

                ...$item,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
