<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HasilPertandinganSeeder extends Seeder
{
    public function run(): void
    {
        $admin = DB::table('users')->where('role', 'admin')->value('id');
        $jadwal = DB::table('jadwal_pertandingan')->where('status', 'selesai')->get();
        $tim = DB::table('tim')->pluck('id');

        // Jadwal pertama: tim[0] vs tim[1] → tim[0] menang 3-1
        DB::table('hasil_pertandingan')->insert([

            'jadwal_id' => $jadwal[0]->id,
            'skor_tim_1' => 3,
            'skor_tim_2' => 1,
            'tim_pemenang_id' => $tim[0],
            'input_by' => $admin,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // Jadwal kedua: tim[2] vs tim[3] → seri 2-2, pemenang null
        DB::table('hasil_pertandingan')->insert([

            'jadwal_id' => $jadwal[1]->id,
            'skor_tim_1' => 2,
            'skor_tim_2' => 2,
            'tim_pemenang_id' => null,
            'input_by' => $admin,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
