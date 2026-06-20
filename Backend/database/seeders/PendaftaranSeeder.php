<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PendaftaranSeeder extends Seeder
{
    public function run(): void
    {
        $users  = DB::table('users')->where('role', 'peserta')->pluck('id');
        $admin  = DB::table('users')->where('role', 'admin')->value('id');

        $data = [];

        foreach ($users as $i => $userId) {
            $data[] = [
                'user_id'           => $userId,
                'event_id'          => 1,
                'status'            => 'diterima',
                'dokumen_pendukung' => 'dokumen/tim' . ($i + 1) . '.pdf',
                'verified_by'       => $admin,
                'tanggal_daftar'    => now(),
                'created_at'        => now(),
                'updated_at'        => now(),
            ];
        }

        DB::table('pendaftaran')->insert($data);
    }
}