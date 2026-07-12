<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PendaftaranSeeder extends Seeder
{
    public function run(): void
    {
        $timIds = DB::table('tim')->pluck('id');
        $admin = DB::table('users')->where('role', 'admin')->value('id');

        $data = [];

        foreach ($timIds as $i => $timId) {
            $data[] = [
                'tim_id' => $timId,
                'event_id' => 1,
                'status' => 'diterima',
                'tanggal_daftar' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ];
        }

        DB::table('pendaftaran')->insert($data);
    }
}
