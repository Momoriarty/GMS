<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PendaftaranSeeder extends Seeder
{
    public function run(): void
    {
        $users  = DB::table('users')->where('role', 'peserta')->pluck('id');
        $events = DB::table('events')->pluck('id');
        $admin  = DB::table('users')->where('role', 'admin')->value('id');

        $data = [
            [
                'user_id'           => $users[0],
                'event_id'          => $events[0],
                'status'            => 'diterima',
                'dokumen_pendukung' => 'dokumen/tim1_garuda_cup.pdf',
                'verified_by'       => $admin,
            ],
            [
                'user_id'           => $users[1],
                'event_id'          => $events[0],
                'status'            => 'diterima',
                'dokumen_pendukung' => 'dokumen/tim2_garuda_cup.pdf',
                'verified_by'       => $admin,
            ],
            [
                'user_id'           => $users[2],
                'event_id'          => $events[0],
                'status'            => 'menunggu',
                'dokumen_pendukung' => 'dokumen/tim3_garuda_cup.pdf',
                'verified_by'       => null,
            ],
            [
                'user_id'           => $users[3],
                'event_id'          => $events[0],
                'status'            => 'ditolak',
                'dokumen_pendukung' => null,
                'verified_by'       => $admin,
            ],
        ];

        foreach ($data as $item) {
            DB::table('pendaftaran')->insert([

                'tanggal_daftar' => now(),
                ...$item,
                'created_at'    => now(),
                'updated_at'    => now(),
            ]);
        }
    }
}
